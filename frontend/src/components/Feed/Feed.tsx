import { useMemo, useState } from "react";
import {
  Comment,
  FeedItem,
  Member,
  NewsPost,
  Poll,
} from "../../types/community.types";
import { CommentThread } from "../Comments/CommentThread";
import { NewsPostCard } from "./NewsPostCard";
import { PollCard } from "./PollCard";
import styles from "./Feed.module.css";

type FeedItemWithMeta = FeedItem & { optimistic?: boolean; error?: string };

interface FeedProps {
  items: FeedItemWithMeta[];
  members: Record<string, Member>;
  commentsByPost: Record<string, Comment[]>;
  currentUser?: Member | null;
  searchTerm: string;
  isLoading?: boolean;
  loadingComments?: Record<string, boolean>;
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<void>;
  onDeleteComment: (postId: string, commentId: string) => Promise<void>;
  onVote: (pollId: string, optionId: string) => Promise<void>;
  onExpand?: (postId: string) => Promise<void> | void;
}

export const Feed = ({
  items,
  members,
  commentsByPost,
  currentUser,
  searchTerm,
  isLoading,
  loadingComments = {},
  onAddComment,
  onDeleteComment,
  onVote,
  onExpand,
}: FeedProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [pendingComments, setPendingComments] = useState<Record<string, boolean>>({});
  const [pendingDeletes, setPendingDeletes] = useState<Record<string, boolean>>({});
  const [pendingVotes, setPendingVotes] = useState<Record<string, boolean>>({});

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedSearch) {
      return items;
    }
    return items.filter((item) => {
      if (item.kind === "news") {
        const news = item as NewsPost;
        return (
          news.title.toLowerCase().includes(normalizedSearch) ||
          news.body.toLowerCase().includes(normalizedSearch)
        );
      }
      const poll = item as Poll;
      return (
        poll.question.toLowerCase().includes(normalizedSearch) ||
        poll.options.some((option) => option.label.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [items, normalizedSearch]);

  const handleToggle = async (postId: string) => {
    const next = !expandedItems[postId];
    setExpandedItems((prev) => ({ ...prev, [postId]: next }));
    if (next && onExpand) {
      await onExpand(postId);
    }
  };

  const handleAddComment = async (postId: string, content: string, parentId?: string) => {
    setPendingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      await onAddComment(postId, content, parentId);
    } finally {
      setPendingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    setPendingDeletes((prev) => ({ ...prev, [commentId]: true }));
    try {
      await onDeleteComment(postId, commentId);
    } finally {
      setPendingDeletes((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    setPendingVotes((prev) => ({ ...prev, [pollId]: true }));
    try {
      await onVote(pollId, optionId);
    } finally {
      setPendingVotes((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  if (isLoading) {
    return (
      <section className={styles.wrapper} aria-busy="true" aria-live="polite">
        <p className={styles.placeholder}>Feed wird geladen …</p>
      </section>
    );
  }

  if (filteredItems.length === 0) {
    return (
      <section className={styles.wrapper} aria-live="polite">
        <p className={styles.placeholder}>
          Keine Beiträge gefunden. Versuche einen anderen Suchbegriff.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Feed</h2>
      <ul className={styles.list}>
        {filteredItems.map((item) => {
          const author = members[item.authorId];
          const comments = commentsByPost[item.id] ?? [];
          const commentCount = comments.length || item.commentIds.length;
          const isExpanded = expandedItems[item.id] ?? false;
          const isCommentPending = pendingComments[item.id] ?? false;

          if (item.kind === "poll") {
            return (
              <li key={item.id}>
                <PollCard
                  poll={item as Poll}
                  author={author}
                  optimistic={item.optimistic}
                  isExpanded={isExpanded}
                  onToggle={() => handleToggle(item.id)}
                  onVote={(optionId) => handleVote(item.id, optionId)}
                  isVoting={pendingVotes[item.id] ?? false}
                  currentUser={currentUser}
                  commentCount={commentCount}
                >
                  <CommentThread
                    comments={comments}
                    members={members}
                    currentUser={currentUser}
                    isSubmitting={isCommentPending}
                    isLoading={loadingComments[item.id]}
                    pendingDeletes={pendingDeletes}
                    onAddComment={(content, parentId) =>
                      handleAddComment(item.id, content, parentId)
                    }
                    onDeleteComment={(commentId) => handleDeleteComment(item.id, commentId)}
                  />
                </PollCard>
              </li>
            );
          }

          return (
            <li key={item.id}>
              <NewsPostCard
                post={item as NewsPost}
                author={author}
                optimistic={item.optimistic}
                isExpanded={isExpanded}
                onToggle={() => handleToggle(item.id)}
                commentCount={commentCount}
              >
                <CommentThread
                  comments={comments}
                  members={members}
                  currentUser={currentUser}
                  isSubmitting={isCommentPending}
                  isLoading={loadingComments[item.id]}
                  pendingDeletes={pendingDeletes}
                  onAddComment={(content, parentId) =>
                    handleAddComment(item.id, content, parentId)
                  }
                  onDeleteComment={(commentId) => handleDeleteComment(item.id, commentId)}
                />
              </NewsPostCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
