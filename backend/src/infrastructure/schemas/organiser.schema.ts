import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class Organiser {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  logo: string;

  @Prop({ required: true })
  events: string[];

  @Prop({ required: true })
  socialMediaLinks: string[];

  @Prop({ required: true })
  ticketLinks: string[];

  @Prop({ required: true })
  genres: string[];

  @Prop({ required: true })
  contactMail: string;

  @Prop({ required: true })
  instagramLink: string;

  @Prop({ required: true })
  images: string[];

  @Prop({ required: true })
  artists: string[];
}
