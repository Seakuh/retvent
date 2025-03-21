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
}

export interface User {
  id: string;
  username: string;
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
  id?: string;
  text?: string;
  replies?: Comment[];
  parentId?: string;
  eventId?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
