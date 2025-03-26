export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const categories = [
  { name: "Music", emoji: "🎵" },
  { name: "Party", emoji: "🎉" },
  { name: "Sports", emoji: "⚽" },
  { name: "Art", emoji: "🎨" },
  { name: "Food", emoji: "🍔" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Tech", emoji: "💻" },
  { name: "Education", emoji: "📚" },
  { name: "Festival", emoji: "🎪" },
  { name: "Fitness", emoji: "💪" },
  { name: "Travel", emoji: "✈️" },
  { name: "Nature", emoji: "🌿" },
  { name: "Photography", emoji: "📸" },
  { name: "Fashion", emoji: "👗" },
  { name: "Books", emoji: "📖" },
  { name: "Movies", emoji: "🎬" },
  { name: "Science", emoji: "🔬" },
  { name: "Finance", emoji: "💰" },
  { name: "Health", emoji: "🏥" },
  { name: "DIY & Crafting", emoji: "✂️" },
  { name: "Animals", emoji: "🐾" },
  { name: "Spirituality", emoji: "🧘" },
  { name: "Comedy", emoji: "😂" },
  { name: "History", emoji: "🏛️" },
  { name: "Startups", emoji: "🚀" },
  { name: "Coding", emoji: "🖥️" },
  { name: "Politics", emoji: "🗳️" },
  { name: "Relationships", emoji: "💑" },
  { name: "Mental Health", emoji: "🧠" },
  { name: "Automotive", emoji: "🚗" },
  { name: "Luxury", emoji: "💎" },
  { name: "Minimalism", emoji: "🏡" },
  { name: "Environment", emoji: "🌍" },
  { name: "Parenting", emoji: "👶" },
  { name: "Space", emoji: "🚀" },
  { name: "Esports", emoji: "🎮🏆" },
];

// Cache-Durations in Millisekunden
// 24 Stunden
export const CACHE_DURATION_24 = 24 * 60 * 60 * 1000;
// 12 Stunden
export const CACHE_DURATION_12 = 12 * 60 * 60 * 1000;
// 6 Stunden
export const CACHE_DURATION_6 = 6 * 60 * 60 * 1000;
// 3 Stunden
export const CACHE_DURATION_3 = 3 * 60 * 60 * 1000;
// 1 Stunde
export const CACHE_DURATION_1 = 60 * 60 * 1000;

interface address {
  city?: string;
  houseNumber?: string;
  street?: string;
}

export interface Event {
  // ID
  id?: string;
  // Titel
  title: string;
  // Beschreibung
  description?: string;
  // Bild URL
  imageUrl?: string;
  // Zeitliche Daten
  startDate?: Date | string;
  startTime?: string;
  endDate?: Date | string;
  endTime?: string;
  // Beziehungen
  hostId?: string;
  hostUsername?: string;
  city?: string;
  locationId?: string;
  category?: string;
  address?: address;
  price?: string;
  ticketLink?: string;
  lineup?: Array<{ name: string; role?: string; startTime?: string }>;
  socialMediaLinks?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  tags?: string[];
  website?: string;
  likeIds?: string[];
  email?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;

  // upload location
  uploadLat?: number;
  uploadLon?: number;

  // views
  views?: number;

  // comments
  commentCount?: number;
}

export interface Profile {
  username: string;
  userId: string;
  profileImageUrl?: string;
  category?: string;
  followerCount?: number;
  bio?: string;
  followedLocationIds?: string[];
  likedEventIds?: string[];
  createdEventIds?: string[];
  links?: string[];
  queue?: string;
  gallery?: string[];
  doorPolicy?: string;
  followers?: string[];
  following?: string[];
  createdAt: Date;
  updatedAt: Date;
  points?: number;
  id: string;
  email: string;
  profilePictureUrl: string;
  uploads: number;
  events: Event[];
  uploadedEvents: Event[];
  likedEvents: Event[];
  dislikedEvents: Event[];
  comments: Comment[];
  likes: number;
}

export interface Comment {
  _id?: string;
  text: string;
  createdAt?: string;
  userId?: string;
  eventId: string;
  parentId?: string | null;
  replies?: Comment[];
}

export interface MapEvent {
  id: string;
  title: string;
  imageUrl: string;
  location: {
    type: string;
    coordinates: number[];
    city?: string;
  };
  startDate: Date;
}

export const formatDate = (date: string) => {
  const d = new Date(date);
  return d
    .toLocaleDateString("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .toUpperCase();
};

export const emptyEvent: Event = {
  id: "",
  title: "No events found",
  imageUrl:
    "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png",
  startDate: new Date(),
  description: "",
};

interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[];
}

export const buildCommentTree = (comments: Comment[]): CommentWithReplies[] => {
  // Erstelle eine Map für schnellen Zugriff auf Kommentare
  const commentMap = new Map<string | null | undefined, CommentWithReplies>();

  // Initialisiere alle Kommentare mit einem leeren replies-Array
  comments.forEach((comment) => {
    if (comment._id) {
      commentMap.set(comment._id, { ...comment, replies: [] });
    }
  });

  const rootComments: CommentWithReplies[] = [];

  // Baue die Baumstruktur auf
  comments.forEach((comment) => {
    if (!comment._id) return;

    const commentWithReplies = commentMap.get(comment._id)!;

    if (comment.parentId) {
      // Wenn es eine Antwort ist, füge sie zum parent-Kommentar hinzu
      const parentComment = commentMap.get(comment.parentId);
      if (parentComment) {
        parentComment.replies.push(commentWithReplies);
      }
    } else {
      // Wenn es ein Root-Kommentar ist, füge ihn zur Root-Liste hinzu
      rootComments.push(commentWithReplies);
    }
  });

  return rootComments;
};

export interface UserLevel {
  level: number;
  name: string;
  minPoints: number;
  color: string;
  description: string;
}

export const USER_LEVELS: UserLevel[] = [
  {
    level: 0,
    name: "Explorer",
    minPoints: 0,
    color: "#94A3B8",
    description: "Start your journey!",
  },
  {
    level: 1,
    name: "Event-Expert",
    minPoints: 100,
    color: "#22C55E",
    description: "You've created your first event!",
  },
  {
    level: 2,
    name: "Scann-Pro-light",
    minPoints: 500,
    color: "#3B82F6",
    description: "You know your way around!",
  },
  {
    level: 3,
    name: "Scann-Pro",
    minPoints: 2000,
    color: "#8B5CF6",
    description: "You're a local legend!",
  },
  {
    level: 4,
    name: "Event-Master",
    minPoints: 5000,
    color: "#EC4899",
    description: "You're a true pro!",
  },
  {
    level: 5,
    name: "Event-God",
    minPoints: 10000,
    color: "#F59E0B",
    description: "You're a true legend!",
  },
];

export const calculateUserLevel = (points: number): UserLevel => {
  return USER_LEVELS.reduce((prev, curr) =>
    points >= curr.minPoints ? curr : prev
  );
};

export const calculateProgress = (
  points: number,
  currentLevel: UserLevel
): number => {
  const nextLevel = USER_LEVELS.find(
    (level) => level.level > currentLevel.level
  );
  if (!nextLevel) return 100;

  const levelRange = nextLevel.minPoints - currentLevel.minPoints;
  const currentProgress = points - currentLevel.minPoints;
  return (currentProgress / levelRange) * 100;
};
