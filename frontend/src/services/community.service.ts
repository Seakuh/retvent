import {
  Comment,
  CommentInput,
  Community,
  ConnectResponse,
  Event,
  EventInput,
  FeedItem,
  ID,
  Member,
  NewsPost,
  NewsPostInput,
  Poll,
  PollInput,
  PollOption,
  Role,
  RSVPStatus,
} from "../types/community.types";

const randomLatency = () => 200 + Math.floor(Math.random() * 300);

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const randomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10);

const delay = <T>(value: T, shouldFail = false): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Mock network error"));
      } else {
        resolve(clone(value));
      }
    }, randomLatency());
  });

type ConnectRequest = { requesterId: ID; addresseeId: ID; status: "pending" | "accepted" };

interface CommunityStore {
  community: Community;
  members: Record<ID, Member>;
  feed: FeedItem[];
  events: Event[];
  comments: Record<ID, Comment>;
  pollVotes: Record<ID, Record<ID, ID>>;
  connectRequests: ConnectRequest[];
}

const adminId = "68ef99730e5996fb697c1bb2";
const now = () => new Date().toISOString();

const createMember = (
  id: ID,
  name: string,
  role: Role,
  avatarUrl: string,
  extra?: Partial<Member>
): Member => ({
  id,
  name,
  role,
  avatarUrl,
  joinedAt: extra?.joinedAt ?? new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
  title: extra?.title,
  bio: extra?.bio,
  location: extra?.location,
  tags: extra?.tags,
});

const seedMembers: Record<ID, Member> = {
  [adminId]: createMember(
    adminId,
    "Alex Admin",
    Role.ADMIN,
    "https://i.pravatar.cc/100?img=60",
    {
      title: "Community Lead",
      bio: "Orchestrates community strategy and partnerships.",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    }
  ),
  host1: createMember("host1", "Hannah Host", Role.HOST, "https://i.pravatar.cc/100?img=32", {
    title: "Event Moderator",
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  }),
  member1: createMember(
    "member1",
    "Marco Maker",
    Role.MEMBER,
    "https://i.pravatar.cc/100?img=10",
    {
      title: "Product Designer",
      bio: "Building inclusive experiences for communities.",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    }
  ),
  member2: createMember(
    "member2",
    "Simone Support",
    Role.MEMBER,
    "https://i.pravatar.cc/100?img=54",
    {
      title: "Customer Success",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    }
  ),
  member3: createMember(
    "member3",
    "Devon Developer",
    Role.MEMBER,
    "https://i.pravatar.cc/100?img=20",
    {
      title: "Fullstack Engineer",
      joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    }
  ),
};

const communitySlug = "lets-connect";

const seedCommunity: Community = {
  id: "community-1",
  slug: communitySlug,
  name: "LET'S C Community",
  description:
    "Wir verbinden Veranstalter:innen, Kreative und Tech-Enthusiast:innen, um gemeinsam besondere Events zu schaffen.",
  coverImageUrl:
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
  logoUrl:
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=240&q=70",
  stats: {
    members: Object.keys(seedMembers).length,
    upcomingEvents: 3,
    postsLast30Days: 3,
  },
  partners: [
    {
      id: "partner1",
      name: "RetVent Studios",
      logoUrl:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=200&q=60",
      websiteUrl: "https://retvent.example.com",
    },
    {
      id: "partner2",
      name: "EventScanner",
      logoUrl:
        "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=200&q=60",
      websiteUrl: "https://eventscanner.example.com",
    },
    {
      id: "partner3",
      name: "Club Kultur",
      logoUrl:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=200&q=60",
      websiteUrl: "https://clubkultur.example.com",
    },
  ],
  members: Object.values(seedMembers),
  featuredTags: ["Netzwerk", "Community", "Events", "Tech"],
};

const makeReactions = (): FeedItem["reactions"] => ({
  thumbs: 12 + Math.floor(Math.random() * 20),
  fire: 4 + Math.floor(Math.random() * 10),
  star: 3 + Math.floor(Math.random() * 6),
});

const pastDate = (daysAgo: number) =>
  new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString();

const futureDate = (daysAhead: number, hoursAhead = 18) =>
  new Date(Date.now() + 1000 * 60 * 60 * 24 * daysAhead + hoursAhead * 60 * 60 * 1000).toISOString();

const seedNews: NewsPost[] = [
  {
    id: "news-1",
    kind: "news",
    authorId: adminId,
    title: "Willkommen zur neuen Community Experience 🎉",
    body:
      "Wir freuen uns, die neue Community-Seite vorzustellen! Schau dir die frisch kuratierten Events an und stimme über kommende Themen im Poll-Bereich ab.",
    createdAt: pastDate(3),
    commentIds: [],
    reactions: makeReactions(),
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "news-2",
    kind: "news",
    authorId: "host1",
    title: "Recap: Community Drinks & Deep Tech Talk",
    body:
      "Danke an alle, die letzte Woche dabei waren. Slides und Recording sind jetzt online – Link findet ihr im Event Channel!",
    createdAt: pastDate(10),
    commentIds: [],
    reactions: makeReactions(),
  },
];

const seedPoll: Poll = {
  id: "poll-1",
  kind: "poll",
  authorId: adminId,
  question: "Welches Thema wollt ihr beim nächsten Meetup?",
  options: [
    { id: "opt-1", label: "Hybrid Events und Streaming", votes: 18 },
    { id: "opt-2", label: "Community Growth Playbooks", votes: 11 },
    { id: "opt-3", label: "Generative AI Showcases", votes: 9 },
  ],
  createdAt: pastDate(1),
  commentIds: [],
  reactions: makeReactions(),
  votesByUser: {
    [adminId]: "opt-1",
    host1: "opt-2",
    member1: "opt-2",
    member2: "opt-3",
  },
  closesAt: futureDate(5, 12),
  visibility: "members",
};

const seedEvents: Event[] = [
  {
    id: "event-1",
    communityId: seedCommunity.id,
    title: "Creator Lab: Meet & Build",
    description:
      "Hands-on Session: Wir bauen zusammen eine interaktive Experience für das Sommerfestival. Limitierte Plätze!",
    type: "workshop",
    location: "RetVent HQ, Berlin",
    startAt: futureDate(7, 17),
    endAt: futureDate(7, 20),
    capacity: 24,
    hostId: "host1",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    attendees: [
      { userId: adminId, status: RSVPStatus.GOING },
      { userId: "member1", status: RSVPStatus.GOING },
      { userId: "member2", status: RSVPStatus.MAYBE },
    ],
  },
  {
    id: "event-2",
    communityId: seedCommunity.id,
    title: "Panel: Future of Event Discovery",
    description:
      "Roundtable mit Partner:innen und Event-Profis. Wir diskutieren Trends zu Discovery, Community Monetarisierung und lokalen Partnerschaften.",
    type: "vortrag",
    location: "Online",
    startAt: futureDate(14, 18),
    endAt: futureDate(14, 20),
    hostId: adminId,
    attendees: [
      { userId: "member1", status: RSVPStatus.MAYBE },
      { userId: "member3", status: RSVPStatus.GOING },
    ],
  },
  {
    id: "event-3",
    communityId: seedCommunity.id,
    title: "Community Listening Session",
    description: "Offenes Forum – bring deine Themen mit, die wir gemeinsam anpacken sollten.",
    type: "community",
    location: "RetVent HQ, Berlin & Remote",
    startAt: futureDate(21, 19),
    endAt: futureDate(21, 21),
    hostId: "host1",
    attendees: [],
  },
];

const seedComments: Comment[] = [
  {
    id: "comment-1",
    postId: "news-1",
    authorId: "member1",
    content: "Mega cool! Die neue Seite fühlt sich richtig polished an 🙌",
    createdAt: pastDate(2),
  },
  {
    id: "comment-2",
    postId: "news-1",
    authorId: adminId,
    content: "Danke euch! Gebt uns gern Feedback, was noch fehlt.",
    createdAt: pastDate(2),
    parentId: "comment-1",
  },
  {
    id: "comment-3",
    postId: "poll-1",
    authorId: "member2",
    content: "Hybrid Events klingt spannend – vielleicht kombiniert mit Networking?",
    createdAt: pastDate(1),
  },
];

const store: Record<string, CommunityStore> = {
  [communitySlug]: {
    community: seedCommunity,
    members: seedMembers,
    feed: [seedPoll, ...seedNews].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    events: seedEvents,
    comments: seedComments.reduce<Record<ID, Comment>>((acc, comment) => {
      acc[comment.id] = comment;
      return acc;
    }, {}),
    pollVotes: {
      [seedPoll.id]: { ...seedPoll.votesByUser },
    },
    connectRequests: [],
  },
};

const ensureStore = (slug: string) => {
  const communityStore = store[slug];
  if (!communityStore) {
    throw new Error(`Community with slug "${slug}" not found in mock store`);
  }
  return communityStore;
};

const computeStats = (communityStore: CommunityStore) => {
  const nowTs = Date.now();
  const postsLast30Days = communityStore.feed.filter(
    (item) => nowTs - new Date(item.createdAt).getTime() <= 1000 * 60 * 60 * 24 * 30
  ).length;
  const upcomingEvents = communityStore.events.filter(
    (event) => new Date(event.startAt).getTime() >= nowTs
  ).length;
  return {
    members: Object.keys(communityStore.members).length,
    upcomingEvents,
    postsLast30Days,
  };
};

const attachComments = (communityStore: CommunityStore, post: FeedItem): FeedItem => {
  const commentIds = Object.values(communityStore.comments)
    .filter((comment) => comment.postId === post.id)
    .map((comment) => comment.id);
  return { ...post, commentIds };
};

export const getCommunity = async (slug: string): Promise<Community> => {
  const communityStore = ensureStore(slug);
  const stats = computeStats(communityStore);
  const members = Object.values(communityStore.members).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  return delay({
    ...communityStore.community,
    stats,
    members,
  });
};

export const listNews = async (slug: string): Promise<FeedItem[]> => {
  const communityStore = ensureStore(slug);
  const feedWithCommentRefs = communityStore.feed.map((item) =>
    attachComments(communityStore, item)
  );
  return delay(feedWithCommentRefs);
};

const validateNewsInput = (input: NewsPostInput) => {
  if (!input.title.trim()) {
    throw new Error("Titel ist erforderlich");
  }
  if (!input.body.trim()) {
    throw new Error("Inhalt ist erforderlich");
  }
};

export const createNews = async (input: NewsPostInput): Promise<NewsPost> => {
  validateNewsInput(input);
  const communityStore = ensureStore(input.communitySlug);
  const nowIso = now();
  const post: NewsPost = {
    id: `news-${randomId()}`,
    kind: "news",
    authorId: input.authorId,
    title: input.title.trim(),
    body: input.body.trim(),
    imageUrl: input.imageUrl?.trim() || undefined,
    createdAt: nowIso,
    commentIds: [],
    reactions: { thumbs: 0, fire: 0, star: 0 },
  };
  communityStore.feed.unshift(post);
  communityStore.community.stats = computeStats(communityStore);
  return delay(post);
};

const validatePollInput = (input: PollInput) => {
  const cleanedOptions = input.options.map((option) => option.trim()).filter(Boolean);
  if (!input.question.trim()) {
    throw new Error("Frage ist erforderlich");
  }
  if (cleanedOptions.length < 2) {
    throw new Error("Mindestens zwei Optionen sind erforderlich");
  }
  if (cleanedOptions.length > 6) {
    throw new Error("Maximal sechs Optionen erlaubt");
  }
};

export const createPoll = async (input: PollInput): Promise<Poll> => {
  validatePollInput(input);
  const communityStore = ensureStore(input.communitySlug);
  const optionObjects: PollOption[] = input.options
    .map((option) => option.trim())
    .filter(Boolean)
    .map((option) => ({ id: `poll-opt-${randomId()}`, label: option, votes: 0 }));
  const poll: Poll = {
    id: `poll-${randomId()}`,
    kind: "poll",
    authorId: input.authorId,
    question: input.question.trim(),
    options: optionObjects,
    createdAt: now(),
    commentIds: [],
    reactions: { thumbs: 0, fire: 0, star: 0 },
    votesByUser: {},
    closesAt: input.closesAt,
    visibility: input.visibility,
  };
  communityStore.feed.unshift(poll);
  communityStore.pollVotes[poll.id] = {};
  communityStore.community.stats = computeStats(communityStore);
  return delay(poll);
};

export const votePoll = async (
  pollId: ID,
  optionId: ID,
  userId: ID,
  slug = communitySlug
): Promise<Poll> => {
  const communityStore = ensureStore(slug);
  const pollIndex = communityStore.feed.findIndex(
    (item): item is Poll => item.kind === "poll" && item.id === pollId
  );
  if (pollIndex === -1) {
    throw new Error("Umfrage nicht gefunden");
  }
  const poll = communityStore.feed[pollIndex] as Poll;
  const existingVote = poll.votesByUser[userId];
  if (existingVote === optionId) {
    return delay(poll);
  }
  const option = poll.options.find((opt) => opt.id === optionId);
  if (!option) {
    throw new Error("Option nicht gefunden");
  }
  if (existingVote) {
    const prevOption = poll.options.find((opt) => opt.id === existingVote);
    if (prevOption) {
      prevOption.votes = Math.max(prevOption.votes - 1, 0);
    }
  }
  option.votes += 1;
  poll.votesByUser[userId] = optionId;
  communityStore.pollVotes[pollId] = { ...poll.votesByUser };
  communityStore.feed[pollIndex] = { ...poll };
  return delay(communityStore.feed[pollIndex] as Poll);
};

const validateEventInput = (input: EventInput) => {
  if (!input.title.trim()) {
    throw new Error("Eventtitel ist erforderlich");
  }
  if (!input.description.trim()) {
    throw new Error("Beschreibung ist erforderlich");
  }
  if (!input.location.trim()) {
    throw new Error("Ort ist erforderlich");
  }
  if (!input.startAt) {
    throw new Error("Startzeit ist erforderlich");
  }
  if (!input.endAt) {
    throw new Error("Endzeit ist erforderlich");
  }
  if (new Date(input.endAt).getTime() <= new Date(input.startAt).getTime()) {
    throw new Error("Endzeit muss nach Startzeit liegen");
  }
};

export const createEvent = async (input: EventInput): Promise<Event> => {
  validateEventInput(input);
  const communityStore = ensureStore(input.communitySlug);
  const event: Event = {
    id: `event-${randomId()}`,
    communityId: communityStore.community.id,
    title: input.title.trim(),
    description: input.description.trim(),
    type: input.type,
    location: input.location.trim(),
    startAt: input.startAt,
    endAt: input.endAt,
    capacity: input.capacity,
    hostId: input.authorId,
    imageUrl: input.imageUrl?.trim() || undefined,
    attendees: [{ userId: input.authorId, status: RSVPStatus.GOING }],
  };
  communityStore.events.unshift(event);
  communityStore.community.stats = computeStats(communityStore);
  return delay(event);
};

export const setRSVP = async (
  eventId: ID,
  userId: ID,
  status: RSVPStatus,
  slug = communitySlug
): Promise<Event> => {
  const communityStore = ensureStore(slug);
  const eventIndex = communityStore.events.findIndex((event) => event.id === eventId);
  if (eventIndex === -1) {
    throw new Error("Event nicht gefunden");
  }
  const event = communityStore.events[eventIndex];
  const attendeeIndex = event.attendees.findIndex((attendee) => attendee.userId === userId);
  if (status === RSVPStatus.NOT_GOING) {
    if (attendeeIndex >= 0) {
      event.attendees.splice(attendeeIndex, 1);
    }
  } else if (attendeeIndex >= 0) {
    event.attendees[attendeeIndex] = { userId, status };
  } else {
    event.attendees.push({ userId, status });
  }
  communityStore.events[eventIndex] = { ...event };
  return delay(communityStore.events[eventIndex]);
};

export const listEvents = async (slug: string): Promise<Event[]> => {
  const communityStore = ensureStore(slug);
  const events = [...communityStore.events].sort(
    (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
  );
  return delay(events);
};

export const addComment = async (input: CommentInput): Promise<Comment> => {
  if (!input.content.trim()) {
    throw new Error("Kommentar darf nicht leer sein");
  }
  const communityStore = ensureStore(input.communitySlug);
  const comment: Comment = {
    id: `comment-${randomId()}`,
    postId: input.postId,
    authorId: input.authorId,
    content: input.content.trim(),
    parentId: input.parentId,
    createdAt: now(),
  };
  communityStore.comments[comment.id] = comment;
  const item = communityStore.feed.find((feedItem) => feedItem.id === input.postId);
  if (item) {
    item.commentIds.push(comment.id);
  }
  return delay(comment);
};

export const deleteComment = async (
  commentId: ID,
  userId: ID,
  slug = communitySlug
): Promise<Comment> => {
  const communityStore = ensureStore(slug);
  const comment = communityStore.comments[commentId];
  if (!comment) {
    throw new Error("Kommentar nicht gefunden");
  }
  const user = communityStore.members[userId];
  if (!user) {
    throw new Error("Unbekannter Nutzer");
  }
  const isAuthor = comment.authorId === userId;
  const isPrivileged = user.role === Role.ADMIN || user.role === Role.HOST;
  if (!isAuthor && !isPrivileged) {
    throw new Error("Keine Berechtigung zum Löschen des Kommentars");
  }
  communityStore.comments[commentId] = { ...comment, deleted: true, content: "" };
  return delay(communityStore.comments[commentId]);
};

export const listComments = async (postId: ID, slug: string): Promise<Comment[]> => {
  const communityStore = ensureStore(slug);
  const comments = Object.values(communityStore.comments)
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return delay(comments);
};

export const connect = async (
  requesterId: ID,
  addresseeId: ID,
  slug = communitySlug
): Promise<ConnectResponse> => {
  const communityStore = ensureStore(slug);
  const existing = communityStore.connectRequests.find(
    (request) =>
      request.requesterId === requesterId && request.addresseeId === addresseeId
  );
  if (existing) {
    return delay(existing);
  }
  const request: ConnectRequest = { requesterId, addresseeId, status: "pending" };
  communityStore.connectRequests.push(request);
  return delay(request);
};

export const getMemberById = async (slug: string, memberId: ID): Promise<Member | undefined> => {
  const communityStore = ensureStore(slug);
  return delay(communityStore.members[memberId]);
};

const API_URL = import.meta.env.VITE_API_URL;

export const followUser = async (userId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}users/me/followedProfiles/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const unfollowUser = async (userId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_URL}users/me/followedProfiles/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};

export const getProfile = async (userId: string) => {
  try {
    if (userId === "public") {
      return null;
    }
    const response = await fetch(`${API_URL}profile/${userId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const communityMockStore = store;

