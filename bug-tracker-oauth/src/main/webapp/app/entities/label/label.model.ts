import { ITicket } from 'app/entities/ticket/ticket.model';

export interface ILabel {
  id?: number;
  label?: string;
  tickets?: ITicket[] | null;
}

export class Label implements ILabel {
  constructor(public id?: number, public label?: string, public tickets?: ITicket[] | null) {}
}

export function getLabelIdentifier(label: ILabel): number | undefined {
  return label.id;
}
