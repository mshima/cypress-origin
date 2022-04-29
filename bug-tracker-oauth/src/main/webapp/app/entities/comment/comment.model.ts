import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface IComment {
  id?: number;
  date?: dayjs.Dayjs | null;
  text?: string | null;
  parents?: IComment[] | null;
  login?: IUser | null;
  child?: IComment | null;
}

export class Comment implements IComment {
  constructor(
    public id?: number,
    public date?: dayjs.Dayjs | null,
    public text?: string | null,
    public parents?: IComment[] | null,
    public login?: IUser | null,
    public child?: IComment | null
  ) {}
}

export function getCommentIdentifier(comment: IComment): number | undefined {
  return comment.id;
}
