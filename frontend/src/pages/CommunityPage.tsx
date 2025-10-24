import { useEffect, useMemo, useState } from "react";
import { AdminComposer } from "../components/AdminComposer/AdminComposer";
import { CommunityHeader } from "../components/CommunityHeader/CommunityHeader";
import { EventList } from "../components/Events/EventList";
import { Feed } from "../components/Feed/Feed";
import { MemberGrid } from "../components/Members/MemberGrid";
import { PartnerStrip } from "../components/Partners/PartnerStrip";
import {
  addComment,
  connect,
  createEvent,
  createNews,
  createPoll,
  deleteComment,
  getCommunity,
  listComments,
  listEvents,
  listNews,
  setRSVP,
  votePoll,
} from "../services/community.service";
import {
  Comment,
  Community,
  Event,
  EventInput,
  FeedItem,
  Member,
  NewsPostInput,
  PollInput,
  RSVPStatus,
} from "../types/community.types";
import {
  canCreateEvent,
  canCreatePoll,
  canPostNews,
} from "../utils/permissions";
import styles from "./CommunityPage.module.css";

type FeedItemWithMeta = FeedItem & { optimistic?: boolean };

interface CommunityPageProps {
  communitySlug: string;
  currentUser?: Member | null;
}

export const CommunityPage = ({
  communitySlug = "lets-connect",
  currentUser,
}: CommunityPageProps) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItemWithMeta[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [composerTab, setComposerTab] = useState<"news" | "poll" | "event">(
    "news"
  );
  const [toast, setToast] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, Comment[]>
  >({});
  const [loadingComments, setLoadingComments] = useState<
    Record<string, boolean>
  >({});
  const [pendingRSVP, setPendingRSVP] = useState<Record<string, boolean>>({});
  const [connectionState, setConnectionState] = useState<
    Record<string, "idle" | "pending" | "requested">
  >({});

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        const [communityData, feedData, eventData] = await Promise.all([
          getCommunity(communitySlug),
          listNews(communitySlug),
          listEvents(communitySlug),
        ]);
        setCommunity(communityData);
        setFeedItems(feedData);
        setEvents(eventData);
      } catch (error) {
        console.error(error);
        setToast({
          message: "Community konnte nicht geladen werden.",
          tone: "error",
        });
      } finally {
        setFeedLoading(false);
        setEventsLoading(false);
      }
    };

    loadCommunityData();
  }, [communitySlug]);

  const membersMap = useMemo(() => {
    if (!community) {
      return {} as Record<string, Member>;
    }
    return community.members.reduce<Record<string, Member>>((acc, member) => {
      acc[member.id] = member;
      return acc;
    }, {});
  }, [community]);

  const handleLoadComments = async (postId: string) => {
    if (loadingComments[postId]) {
      return;
    }
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const comments = await listComments(postId, communitySlug);
      setCommentsByPost((prev) => ({ ...prev, [postId]: comments }));
    } catch (error) {
      console.error(error);
      setToast({
        message: "Kommentare konnten nicht geladen werden.",
        tone: "error",
      });
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreateNews = async (input: NewsPostInput) => {
    const optimisticId = `optimistic-news-${Date.now()}`;
    const optimisticItem: FeedItemWithMeta = {
      id: optimisticId,
      kind: "news",
      authorId: input.authorId,
      title: input.title,
      body: input.body,
      imageUrl: input.imageUrl,
      createdAt: new Date().toISOString(),
      commentIds: [],
      reactions: { thumbs: 0, fire: 0, star: 0 },
      optimistic: true,
    };
    setFeedItems((prev) => [optimisticItem, ...prev]);
    try {
      const created = await createNews(input);
      setFeedItems((prev) =>
        prev.map((item) => (item.id === optimisticId ? created : item))
      );
      setToast({ message: "Beitrag veröffentlicht.", tone: "success" });
    } catch (error) {
      console.error(error);
      setFeedItems((prev) => prev.filter((item) => item.id !== optimisticId));
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Beitrag konnte nicht erstellt werden.",
        tone: "error",
      });
    }
  };

  const handleCreatePoll = async (input: PollInput) => {
    const optimisticId = `optimistic-poll-${Date.now()}`;
    const optimisticItem: FeedItemWithMeta = {
      id: optimisticId,
      kind: "poll",
      authorId: input.authorId,
      question: input.question,
      options: input.options.map((option, index) => ({
        id: `temp-${index}`,
        label: option,
        votes: 0,
      })),
      createdAt: new Date().toISOString(),
      commentIds: [],
      reactions: { thumbs: 0, fire: 0, star: 0 },
      votesByUser: {},
      visibility: input.visibility,
      optimistic: true,
    };
    setFeedItems((prev) => [optimisticItem, ...prev]);
    try {
      const created = await createPoll(input);
      setFeedItems((prev) =>
        prev.map((item) => (item.id === optimisticId ? created : item))
      );
      setToast({ message: "Abstimmung veröffentlicht.", tone: "success" });
    } catch (error) {
      console.error(error);
      setFeedItems((prev) => prev.filter((item) => item.id !== optimisticId));
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Abstimmung konnte nicht erstellt werden.",
        tone: "error",
      });
    }
  };

  const handleCreateEvent = async (input: EventInput) => {
    const optimisticId = `optimistic-event-${Date.now()}`;
    const optimisticEvent: Event = {
      id: optimisticId,
      communityId: community?.id ?? "",
      title: input.title,
      description: input.description,
      type: input.type,
      location: input.location,
      startAt: input.startAt,
      endAt: input.endAt,
      capacity: input.capacity,
      imageUrl: input.imageUrl,
      hostId: input.authorId,
      attendees: [{ userId: input.authorId, status: RSVPStatus.GOING }],
    };
    setEvents((prev) => [optimisticEvent, ...prev]);
    try {
      const created = await createEvent(input);
      setEvents((prev) =>
        prev.map((event) => (event.id === optimisticId ? created : event))
      );
      setToast({ message: "Event erstellt.", tone: "success" });
    } catch (error) {
      console.error(error);
      setEvents((prev) => prev.filter((event) => event.id !== optimisticId));
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Event konnte nicht erstellt werden.",
        tone: "error",
      });
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    try {
      const updated = await votePoll(
        pollId,
        optionId,
        currentUser?.id ?? "",
        communitySlug
      );
      setFeedItems((prev) =>
        prev.map((item) => (item.id === pollId ? updated : item))
      );
    } catch (error) {
      console.error(error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Stimme konnte nicht gespeichert werden.",
        tone: "error",
      });
    }
  };

  const handleAddComment = async (
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!currentUser) {
      setToast({
        message: "Bitte melden Sie sich an, um zu kommentieren.",
        tone: "error",
      });
      return;
    }
    try {
      const created = await addComment({
        communitySlug,
        postId,
        authorId: currentUser.id,
        content,
        parentId,
      });
      setCommentsByPost((prev) => {
        const existing = prev[postId] ?? [];
        return { ...prev, [postId]: [...existing, created] };
      });
      setFeedItems((prev) =>
        prev.map((item) =>
          item.id === postId
            ? { ...item, commentIds: [...item.commentIds, created.id] }
            : item
        )
      );
    } catch (error) {
      console.error(error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Kommentar konnte nicht gespeichert werden.",
        tone: "error",
      });
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!currentUser) {
      return;
    }
    try {
      const deleted = await deleteComment(
        commentId,
        currentUser.id,
        communitySlug
      );
      setCommentsByPost((prev) => {
        const existing = prev[postId] ?? [];
        return {
          ...prev,
          [postId]: existing.map((comment) =>
            comment.id === commentId ? deleted : comment
          ),
        };
      });
    } catch (error) {
      console.error(error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Kommentar konnte nicht gelöscht werden.",
        tone: "error",
      });
    }
  };

  const handleRSVP = async (eventId: string, status: RSVPStatus) => {
    if (!currentUser) {
      setToast({
        message: "Bitte melde dich an, um zuzusagen.",
        tone: "error",
      });
      return;
    }
    setPendingRSVP((prev) => ({ ...prev, [eventId]: true }));
    try {
      const updated = await setRSVP(
        eventId,
        currentUser.id,
        status,
        communitySlug
      );
      setEvents((prev) =>
        prev.map((event) => (event.id === updated.id ? updated : event))
      );
    } catch (error) {
      console.error(error);
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "RSVP konnte nicht gespeichert werden.",
        tone: "error",
      });
    } finally {
      setPendingRSVP((prev) => ({ ...prev, [eventId]: false }));
    }
  };

  const handleConnect = async (memberId: string) => {
    if (!currentUser) {
      setToast({
        message: "Bitte melde dich an, um Connect-Anfragen zu senden.",
        tone: "error",
      });
      return;
    }
    setConnectionState((prev) => ({ ...prev, [memberId]: "pending" }));
    try {
      await connect(currentUser.id, memberId, communitySlug);
      setConnectionState((prev) => ({ ...prev, [memberId]: "requested" }));
      setToast({ message: "Connect-Anfrage gesendet.", tone: "success" });
    } catch (error) {
      console.error(error);
      setConnectionState((prev) => ({ ...prev, [memberId]: "idle" }));
      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Anfrage konnte nicht gesendet werden.",
        tone: "error",
      });
    }
  };

  const showComposerToggle =
    (canPostNews(currentUser) ||
      canCreatePoll(currentUser) ||
      canCreateEvent(currentUser)) &&
    showComposer;

  return (
    <div className={styles.page}>
      {community ? (
        <>
          <CommunityHeader
            community={community}
            currentUser={currentUser ?? undefined}
            searchTerm={searchTerm}
            onSearchChange={(value) => setSearchTerm(value)}
            onAction={(action) => {
              setComposerTab(action);
              setShowComposer(true);
            }}
          />
          <div className={styles.main}>
            <div className={styles.feedColumn}>
              {showComposerToggle && currentUser ? (
                <AdminComposer
                  communitySlug={communitySlug}
                  currentUser={currentUser}
                  events={events}
                  initialTab={composerTab}
                  onCreateNews={handleCreateNews}
                  onCreatePoll={handleCreatePoll}
                  onCreateEvent={handleCreateEvent}
                  onClose={() => setShowComposer(false)}
                />
              ) : null}
              <Feed
                items={feedItems}
                members={membersMap}
                commentsByPost={commentsByPost}
                currentUser={currentUser ?? undefined}
                searchTerm={searchTerm}
                isLoading={feedLoading}
                loadingComments={loadingComments}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onVote={handleVotePoll}
                onExpand={handleLoadComments}
              />
            </div>
            <aside className={styles.sidebar}>
              <EventList
                events={events}
                members={membersMap}
                currentUser={currentUser ?? undefined}
                isLoading={eventsLoading}
                pendingRSVP={pendingRSVP}
                onRSVP={handleRSVP}
              />
              <PartnerStrip partners={community.partners} />
            </aside>
          </div>
          <MemberGrid
            members={community.members}
            currentUser={currentUser ?? undefined}
            searchTerm={searchTerm}
            connectionState={connectionState}
            onConnect={handleConnect}
          />
        </>
      ) : (
        <p className={styles.placeholder}>Community wird geladen …</p>
      )}

      {toast ? (
        <div
          className={`${styles.toast} ${
            toast.tone === "success" ? styles.toastSuccess : styles.toastError
          }`}
          role="status"
        >
          {toast.message}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Meldung schließen"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default CommunityPage;
