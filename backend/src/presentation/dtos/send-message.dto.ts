export class SendMessageDto {
  groupId: string;
  content?: string;
  file?: Express.Multer.File;
  fileUrl?: string;
}
