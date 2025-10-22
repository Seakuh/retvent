export class SendPrivateMessageDto {
  recipientId: string;
  content?: string;
  file?: Express.Multer.File;
  fileUrl?: string;
  latitude?: number;
  longitude?: number;
  type?: string;
}
