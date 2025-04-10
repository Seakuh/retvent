export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || "https://event-scanner.com/";
export const DEFAULT_IMAGE =
  "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png";

export const categoriesToFilter = [
  "Concert",
  "Workshop",
  "Exhibition",
  "Festival",
  "Party",
  "Event",
  "Konzert",
  "Theater",
  "Market",
  "Service",
  "Rave",
  "Community",
  "Comedy",
  "Social",
  "Dance",
  "Film",
  "Demonstration",
  "Protest",
];

export interface SendMessageDto {
  groupId: string;
  content: string;
  file?: string;
}

export class Message {
  groupId?: string;
  senderId?: string;
  content?: string;
  type?: string;
  createdAt?: Date;
}

export class Group {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  memberIds?: string[];
  creatorId?: string;
  eventId?: string;
  imageUrl?: string;
  inviteToken?: string;
  isPublic?: boolean;
  isPrivate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const categories = [
  { name: "Music", emoji: "🎵" },
  { name: "Concert", emoji: "🎤" },
  { name: "Exhibition", emoji: "🖼️" },
  { name: "Workshop", emoji: "🔧" },
  { name: "Kunst", emoji: "🎨" },
  { name: "Event", emoji: "📅" },
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
  { name: "Protest", emoji: "🛡️" },
  { name: "Conference", emoji: "🗣️" },
  { name: "Movies", emoji: "🎬" },
  { name: "Science", emoji: "🔬" },
  { name: "Nightlife", emoji: "🌃" },
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
  { name: "Film", emoji: "🎬" },
  { name: "Demonstration", emoji: "👩‍🎤" },
  { name: "Community", emoji: "👥" },
  { name: "Healthcare", emoji: "🏥" },
  { name: "Science", emoji: "🔬" },
  { name: "Parade", emoji: "👯‍♀️" },
  { name: "Fashion Show", emoji: "👗" },
  { name: "Art Show", emoji: "🖼️" },
  { name: "Food Festival", emoji: "🍔" },
  { name: "Music Festival", emoji: "🎵" },
  { name: "Film Festival", emoji: "🎬" },
  { name: "Comedy Festival", emoji: "😂" },
  { name: "Market", emoji: "🛍️" },
  { name: "Festival", emoji: "🎪" },
  { name: "Party", emoji: "🎉" },
  { name: "Sports", emoji: "⚽" },
  { name: "Art", emoji: "🎨" },
  { name: "Food", emoji: "🍔" },
  { name: "Gaming", emoji: "🎮" },
  { name: "Theater", emoji: "🎭" },
  { name: "Dance", emoji: "💃" },
  { name: "Fashion Show", emoji: "👗" },
  { name: "Art Show", emoji: "🖼️" },
  { name: "Konzert", emoji: "🎤" },
  { name: "Food Festival", emoji: "🍔" },
  { name: "Music Festival", emoji: "🎵" },
  { name: "Service", emoji: "💼" },
  { name: "Workshop", emoji: "🔧" },
  { name: "Kunst", emoji: "🎨" },
  { name: "Party", emoji: "🎉" },
  { name: "Rave", emoji: "💃" },
  { name: "Social", emoji: "👥" },
  { name: "Club", emoji: "🎉" },
  { name: "Bar", emoji: "🍸" },
  { name: "Pub", emoji: "🍻" },
  { name: "Club", emoji: "🎉" },
  { name: "Bar", emoji: "🍸" },
  { name: "Pub", emoji: "🍻" },
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
  _id?: string;
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

export const defaultProfileImage =
  "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png";

export interface Profile {
  username: string;
  userId: string;
  profileImageUrl?: string;
  headerImageUrl?: string;
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

export const formatProfileDate = (date: Date) => {
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export interface EventProfile {
  username?: string;
  profileImageUrl?: string;
}

export const emptyEvent: Event = {
  id: "",
  title: "No events found",
  imageUrl:
    "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png",
  startDate: new Date(),
  description: "",
};
export const fallBackProfileImage =
  "https://hel1.your-objectstorage.com/imagebucket/events/8d703697-caf7-4438-abda-4ccd8e5939e9.png";

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
    description: "You've created your first events!",
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

export const getHostEvents = async (hostId: string): Promise<Event[]> => {
  const response = await fetch(`${API_URL}events/host/id/${hostId}`);
  if (!response.ok) throw new Error("Failed to fetch events");
  return await response.json();
};

export interface UserPreferences {
  eventTypes?: string[]; // ["Konzert", "Clubnacht"]
  subTypes?: string[]; // ["Akustik", "Rock"]
  genreStyles?: string[]; // ["Techno", "Jazz"]
  targetAudience?: string[];
  communityOffers?: string[];
}

export const defaultUserPreferences: UserPreferences = {
  eventTypes: [],
  subTypes: [],
  genreStyles: [],
  targetAudience: [],
  communityOffers: [],
};

export const userPreferencesTemplate = {
  categories: [
    {
      name: "Event Type",
      values: {
        Concert: [
          "Acoustic",
          "Rock",
          "Pop",
          "Classical",
          "Jazz",
          "Orchestral",
          "Electronic Dance Music (EDM)",
        ],
        "Club Night": [
          "DJ Set",
          "Live Act",
          "Afterparty",
          "Label Showcase",
          "Rave",
        ],
        Festival: [
          "Music Festival",
          "Cultural Festival",
          "Film Festival",
          "Food Festival",
          "Esports Festival",
        ],
        "Musical/Theater": [
          "Broadway",
          "Disney",
          "Modern",
          "Dance",
          "Cabaret",
          "Immersive Theater",
        ],
        "Fair/Market": [
          "Flea Market",
          "Design Market",
          "Christmas Market",
          "Art Fair",
          "Farmers Market",
        ],
        "Comedy/Show": [
          "Stand-up Comedy",
          "Improv",
          "Magic Show",
          "Satire",
          "Podcast Live Show",
        ],
        "Workshop/Lecture": [
          "Workshop",
          "Panel Discussion",
          "Keynote Speech",
          "Book Reading",
          "Masterclass",
          "Webinar",
        ],
      },
    },
    {
      name: "Genre/Style",
      values: {
        Music: [
          "Techno",
          "House",
          "Electro",
          "Minimal",
          "Drum & Bass",
          "Indie",
          "Rock",
          "Pop",
          "Hip-Hop",
          "Jazz",
          "Classical",
          "Reggae",
          "Schlager",
          "Folk",
          "Hyperpop",
          "K-Pop",
          "Latin Urban",
        ],
        "Theater/Musical": [
          "Classical",
          "Modern",
          "Comedy",
          "Dance",
          "Children's Theatre",
          "Performance Art",
        ],
        "Art/Film": [
          "Experimental",
          "Installation Art",
          "Documentary Film",
          "Independent Film",
          "Animation",
          "Virtual Reality (VR) Art",
        ],
        "Education/Talks": [
          "Science",
          "Social Issues",
          "Politics",
          "Startups",
          "Spirituality",
          "Technology",
          "Sustainability",
        ],
      },
    },
    {
      name: "Target Audience/Context",
      values: {
        AgeGroup: ["18+", "Family-Friendly", "Children", "Seniors", "All Ages"],
        Mood: [
          "Relaxed",
          "Rave",
          "Romantic",
          "Elegant",
          "Alternative",
          "Party",
          "Upbeat",
          "Chill",
        ],
        Setting: [
          "Open Air",
          "Indoor",
          "Livestream",
          "Bar Evening",
          "Day Event",
          "Weekend Event",
          "Hybrid Event",
        ],
        SpecialFeatures: [
          "Accessible",
          "International",
          "LGBTQIA+",
          "Dress Code",
          "Early Access",
          "VIP",
          "Sustainable",
          "Pet-Friendly",
          "Immersive Experience",
        ],
      },
    },
  ],
};

export const handleLogout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("access_token");
};

export const getDaysUntilDate = (date: string | Date): number => {
  // Parse das Datum-Format "SAT, JUL 12"
  const [, month, day] = date.toString().split(/[,\s]+/);
  const currentYear = new Date().getFullYear();

  // Erstelle neues Datum mit aktuellem Jahr
  const eventDate = new Date(`${month} ${day} ${currentYear}`);
  const now = new Date();

  // Beide Daten auf Mitternacht des jeweiligen Tages setzen
  const eventDateOnly = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate()
  );
  const nowDateOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const timeDiff = eventDateOnly.getTime() - nowDateOnly.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
};

export const getDaysPast = (date: string | Date): number => {
  const eventDate = new Date(date);
  const now = new Date();
  const timeDiff = now.getTime() - eventDate.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff;
};

export const getHoursUntilStart = (
  startDate: string,
  includeMinutes: boolean = false
): number => {
  const start = new Date(startDate);
  const now = new Date();
  const diff = start.getTime() - now.getTime();

  if (includeMinutes) {
    return Math.ceil(diff / (1000 * 60)); // Minuten
  } else {
    return Math.ceil(diff / (1000 * 60 * 60)); // Stunden
  }
};
