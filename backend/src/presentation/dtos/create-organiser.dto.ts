
export class CreateOrganiserDto {
    logo?: Express.Multer.File; // URL zur Logo-Bilddatei
    name?: string;
    description?: string;
    events?: string[]; // Array von Event-IDs
    socialMediaLinks?: string[];
    ticketLinks?: string[];
    genres?: string[];
    location?: string;
    contactMail?: string;
    instagramLink?: string;
    images?: Express.Multer.File[];
    artists?: string[]; // Array von Artist-IDs
  }
