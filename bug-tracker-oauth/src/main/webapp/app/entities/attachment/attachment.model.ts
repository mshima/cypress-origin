import { ITicket } from 'app/entities/ticket/ticket.model';

export interface IAttachment {
  id?: number;
  name?: string;
  fileContentType?: string;
  file?: string;
  ticket?: ITicket | null;
}

export class Attachment implements IAttachment {
  constructor(
    public id?: number,
    public name?: string,
    public fileContentType?: string,
    public file?: string,
    public ticket?: ITicket | null
  ) {}
}

export function getAttachmentIdentifier(attachment: IAttachment): number | undefined {
  return attachment.id;
}
