import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IAttachment, Attachment } from '../attachment.model';
import { AttachmentService } from '../service/attachment.service';
import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { ITicket } from 'app/entities/ticket/ticket.model';
import { TicketService } from 'app/entities/ticket/service/ticket.service';

@Component({
  selector: 'jhi-attachment-update',
  templateUrl: './attachment-update.component.html',
})
export class AttachmentUpdateComponent implements OnInit {
  isSaving = false;

  ticketsSharedCollection: ITicket[] = [];

  editForm = this.fb.group({
    id: [],
    name: [null, [Validators.required, Validators.minLength(3)]],
    file: [null, [Validators.required]],
    fileContentType: [],
    ticket: [],
  });

  constructor(
    protected dataUtils: DataUtils,
    protected eventManager: EventManager,
    protected attachmentService: AttachmentService,
    protected ticketService: TicketService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ attachment }) => {
      this.updateForm(attachment);

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('jhipsterApp.error', { ...err, key: 'error.file.' + err.key })),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const attachment = this.createFromForm();
    if (attachment.id !== undefined) {
      this.subscribeToSaveResponse(this.attachmentService.update(attachment));
    } else {
      this.subscribeToSaveResponse(this.attachmentService.create(attachment));
    }
  }

  trackTicketById(_index: number, item: ITicket): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAttachment>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(attachment: IAttachment): void {
    this.editForm.patchValue({
      id: attachment.id,
      name: attachment.name,
      file: attachment.file,
      fileContentType: attachment.fileContentType,
      ticket: attachment.ticket,
    });

    this.ticketsSharedCollection = this.ticketService.addTicketToCollectionIfMissing(this.ticketsSharedCollection, attachment.ticket);
  }

  protected loadRelationshipsOptions(): void {
    this.ticketService
      .query()
      .pipe(map((res: HttpResponse<ITicket[]>) => res.body ?? []))
      .pipe(map((tickets: ITicket[]) => this.ticketService.addTicketToCollectionIfMissing(tickets, this.editForm.get('ticket')!.value)))
      .subscribe((tickets: ITicket[]) => (this.ticketsSharedCollection = tickets));
  }

  protected createFromForm(): IAttachment {
    return {
      ...new Attachment(),
      id: this.editForm.get(['id'])!.value,
      name: this.editForm.get(['name'])!.value,
      fileContentType: this.editForm.get(['fileContentType'])!.value,
      file: this.editForm.get(['file'])!.value,
      ticket: this.editForm.get(['ticket'])!.value,
    };
  }
}
