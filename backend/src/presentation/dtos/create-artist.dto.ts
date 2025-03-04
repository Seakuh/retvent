export class CreateArtistDto {
  // Required 🔒
  name: string;

  // Basic Information 📝
  biography?: string;
  basedIn?: string;
  careerStartDate?: Date;
  genres?: string[];
  aliases?: string[];
  languages?: string[];
  
  // Social Media & Web presence 🌐
  instagramUrl?: string;
  websiteUrl?: string;
  soundcloudUrl?: string;
  bandcampUrl?: string;
  spotifyUrl?: string;
  youtubeChannel?: string;
  mixcloudUrl?: string;
  twitterUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;

  // Media Content 📸
  profileImageUrl?: string;
  galleryImages?: string[];
  videoUrls?: string[];
  musicSamples?: string[];
  pressKit?: string;

  // Business & Booking Information 💼
  bookingEmail?: string;
  managementEmail?: string;
  pressEmail?: string;
  fees?: {
    hourlyRate?: number;
    performanceRate?: number;
    currency: string;
  };
  availability?: boolean;

  // Technical Requirements 🎛
  technicalRequirements?: string;
  riders?: string[];
  preferredSetupTime?: number;
  minimumStageSize?: {
    width: number;
    depth: number;
    unit: string;
  };

  // Achievements 🏆
  awards?: Array<{
    name: string;
    year: number;
    description?: string;
  }>;
  pressFeatures?: Array<{
    publication: string;
    date: Date;
    url?: string;
  }>;

  // Relations 🤝
  organiserId?: string;
  eventIds?: string[];
}