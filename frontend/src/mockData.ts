import {
  Event,
  Release,
  TicketSale,
  Trend,
  UserInsight,
  UserProfile,
} from "./utils";

export const mockTicketSales: TicketSale[] = [
  { date: "2025-04-01", sales: 120 },
  { date: "2025-04-02", sales: 85 },
  { date: "2025-04-03", sales: 165 },
  { date: "2025-04-04", sales: 190 },
  { date: "2025-04-05", sales: 250 },
  { date: "2025-04-06", sales: 210 },
  { date: "2025-04-07", sales: 180 },
];

export const mockUserInsights: UserInsight[] = [
  { name: "New Users", value: 65 },
  { name: "Returning Users", value: 35 },
];

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Summer Bass Festival",
    date: "2025-06-15",
    location: "Beachfront Park, Miami",
    description: "Annual electronic music festival featuring top DJs",
    ticketsSold: 1250,
    ticketsAvailable: 2000,
  },
  {
    id: "2",
    title: "Indie Rock Night",
    date: "2025-05-20",
    location: "The Underground, Austin",
    description: "Showcase of emerging indie rock bands",
    ticketsSold: 350,
    ticketsAvailable: 500,
  },
  {
    id: "3",
    title: "Jazz in the Garden",
    date: "2025-07-10",
    location: "Botanical Gardens, New Orleans",
    description: "Evening of smooth jazz under the stars",
    ticketsSold: 420,
    ticketsAvailable: 600,
  },
  {
    id: "4",
    title: "Podcast Live: Tech Talks",
    date: "2025-05-05",
    location: "Tech Hub, San Francisco",
    description: "Live recording of popular tech podcast",
    ticketsSold: 180,
    ticketsAvailable: 200,
  },
];

export const mockReleases: Release[] = [
  {
    id: "1",
    title: "Midnight Waves",
    artist: "Ocean Beats",
    description: "Deep house album with tropical influences",
    coverImage:
      "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg",
    genre: "Deep House",
    releaseDate: "2025-05-10",
    platforms: {
      spotify: "https://spotify.com/album/123",
      soundCloud: "https://soundcloud.com/oceanbeats/midnight-waves",
      beatport: "https://beatport.com/release/midnight-waves/123",
    },
  },
  {
    id: "2",
    title: "Urban Stories",
    artist: "City Talkers",
    description: "Weekly podcast discussing urban development",
    coverImage:
      "https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg",
    genre: "Podcast",
    releaseDate: "2025-04-28",
    platforms: {
      spotify: "https://spotify.com/show/456",
      applePodcasts: "https://podcasts.apple.com/us/podcast/urban-stories/456",
    },
  },
];

export const mockTrends: Trend[] = [
  { id: "1", name: "Lo-fi beats", category: "Music", relevance: 85 },
  { id: "2", name: "True crime podcasts", category: "Podcast", relevance: 92 },
  { id: "3", name: "Outdoor concerts", category: "Events", relevance: 78 },
  {
    id: "4",
    name: "Virtual reality shows",
    category: "Technology",
    relevance: 65,
  },
];

export const mockUserProfile: UserProfile = {
  id: "1",
  name: "Alex Rivera",
  location: "Miami, FL",
  region: "Southeast US",
  trends: ["Electronic music", "Summer festivals", "Beach events"],
  releases: mockReleases,
  socials: {
    instagram: "@alexrivera_events",
    facebook: "AlexRiveraEvents",
    linktree: "linktr.ee/alexrivera",
    tiktok: "@alexrivera_events",
  },
  textPreferences: [
    {
      platform: "Instagram",
      tone: "energetic",
      structure: "Short and punchy with hashtags",
      emojiLevel: "heavy",
      language: "English",
    },
    {
      platform: "WhatsApp",
      tone: "casual",
      structure: "Brief with key details",
      emojiLevel: "light",
      language: "English",
    },
  ],
};
