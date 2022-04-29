import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { ITicket, Ticket } from '../ticket.model';
import { TicketService } from '../service/ticket.service';
import { IProject } from 'app/entities/project/project.model';
import { ProjectService } from 'app/entities/project/service/project.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';
import { ILabel } from 'app/entities/label/label.model';
import { LabelService } from 'app/entities/label/service/label.service';
import { Status } from 'app/entities/enumerations/status.model';
import { Type } from 'app/entities/enumerations/type.model';
import { Priority } from 'app/entities/enumerations/priority.model';

@Component({
  selector: 'jhi-ticket-update',
  templateUrl: './ticket-update.component.html',
})
export class TicketUpdateComponent implements OnInit {
  isSaving = false;
  statusValues = Object.keys(Status);
  typeValues = Object.keys(Type);
  priorityValues = Object.keys(Priority);

  projectsSharedCollection: IProject[] = [];
  usersSharedCollection: IUser[] = [];
  labelsSharedCollection: ILabel[] = [];

  editForm = this.fb.group({
    id: [],
    title: [null, [Validators.required]],
    description: [],
    dueDate: [],
    date: [],
    status: [],
    type: [],
    priority: [],
    project: [],
    assignedTo: [],
    reportedBy: [],
    labels: [],
  });

  constructor(
    protected ticketService: TicketService,
    protected projectService: ProjectService,
    protected userService: UserService,
    protected labelService: LabelService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ ticket }) => {
      if (ticket.id === undefined) {
        const today = dayjs().startOf('day');
        ticket.date = today;
      }

      this.updateForm(ticket);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const ticket = this.createFromForm();
    if (ticket.id !== undefined) {
      this.subscribeToSaveResponse(this.ticketService.update(ticket));
    } else {
      this.subscribeToSaveResponse(this.ticketService.create(ticket));
    }
  }

  trackProjectById(_index: number, item: IProject): number {
    return item.id!;
  }

  trackUserById(_index: number, item: IUser): string {
    return item.id!;
  }

  trackLabelById(_index: number, item: ILabel): number {
    return item.id!;
  }

  getSelectedLabel(option: ILabel, selectedVals?: ILabel[]): ILabel {
    if (selectedVals) {
      for (const selectedVal of selectedVals) {
        if (option.id === selectedVal.id) {
          return selectedVal;
        }
      }
    }
    return option;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITicket>>): void {
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

  protected updateForm(ticket: ITicket): void {
    this.editForm.patchValue({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      dueDate: ticket.dueDate,
      date: ticket.date ? ticket.date.format(DATE_TIME_FORMAT) : null,
      status: ticket.status,
      type: ticket.type,
      priority: ticket.priority,
      project: ticket.project,
      assignedTo: ticket.assignedTo,
      reportedBy: ticket.reportedBy,
      labels: ticket.labels,
    });

    this.projectsSharedCollection = this.projectService.addProjectToCollectionIfMissing(this.projectsSharedCollection, ticket.project);
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing(
      this.usersSharedCollection,
      ticket.assignedTo,
      ticket.reportedBy
    );
    this.labelsSharedCollection = this.labelService.addLabelToCollectionIfMissing(this.labelsSharedCollection, ...(ticket.labels ?? []));
  }

  protected loadRelationshipsOptions(): void {
    this.projectService
      .query()
      .pipe(map((res: HttpResponse<IProject[]>) => res.body ?? []))
      .pipe(
        map((projects: IProject[]) => this.projectService.addProjectToCollectionIfMissing(projects, this.editForm.get('project')!.value))
      )
      .subscribe((projects: IProject[]) => (this.projectsSharedCollection = projects));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(
        map((users: IUser[]) =>
          this.userService.addUserToCollectionIfMissing(
            users,
            this.editForm.get('assignedTo')!.value,
            this.editForm.get('reportedBy')!.value
          )
        )
      )
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));

    this.labelService
      .query()
      .pipe(map((res: HttpResponse<ILabel[]>) => res.body ?? []))
      .pipe(
        map((labels: ILabel[]) => this.labelService.addLabelToCollectionIfMissing(labels, ...(this.editForm.get('labels')!.value ?? [])))
      )
      .subscribe((labels: ILabel[]) => (this.labelsSharedCollection = labels));
  }

  protected createFromForm(): ITicket {
    return {
      ...new Ticket(),
      id: this.editForm.get(['id'])!.value,
      title: this.editForm.get(['title'])!.value,
      description: this.editForm.get(['description'])!.value,
      dueDate: this.editForm.get(['dueDate'])!.value,
      date: this.editForm.get(['date'])!.value ? dayjs(this.editForm.get(['date'])!.value, DATE_TIME_FORMAT) : undefined,
      status: this.editForm.get(['status'])!.value,
      type: this.editForm.get(['type'])!.value,
      priority: this.editForm.get(['priority'])!.value,
      project: this.editForm.get(['project'])!.value,
      assignedTo: this.editForm.get(['assignedTo'])!.value,
      reportedBy: this.editForm.get(['reportedBy'])!.value,
      labels: this.editForm.get(['labels'])!.value,
    };
  }
}
