import dayjs from 'dayjs/esm';
import { IAttachment } from 'app/entities/attachment/attachment.model';
import { IProject } from 'app/entities/project/project.model';
import { IUser } from 'app/entities/user/user.model';
import { ILabel } from 'app/entities/label/label.model';
import { Status } from 'app/entities/enumerations/status.model';
import { Type } from 'app/entities/enumerations/type.model';
import { Priority } from 'app/entities/enumerations/priority.model';

export interface ITicket {
  id?: number;
  title?: string;
  description?: string | null;
  dueDate?: dayjs.Dayjs | null;
  date?: dayjs.Dayjs | null;
  status?: Status | null;
  type?: Type | null;
  priority?: Priority | null;
  attachments?: IAttachment[] | null;
  project?: IProject | null;
  assignedTo?: IUser | null;
  reportedBy?: IUser | null;
  labels?: ILabel[] | null;
}

export class Ticket implements ITicket {
  constructor(
    public id?: number,
    public title?: string,
    public description?: string | null,
    public dueDate?: dayjs.Dayjs | null,
    public date?: dayjs.Dayjs | null,
    public status?: Status | null,
    public type?: Type | null,
    public priority?: Priority | null,
    public attachments?: IAttachment[] | null,
    public project?: IProject | null,
    public assignedTo?: IUser | null,
    public reportedBy?: IUser | null,
    public labels?: ILabel[] | null
  ) {}
}

export function getTicketIdentifier(ticket: ITicket): number | undefined {
  return ticket.id;
}
