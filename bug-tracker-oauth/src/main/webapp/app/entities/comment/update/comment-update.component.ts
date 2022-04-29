import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';

import { IComment, Comment } from '../comment.model';
import { CommentService } from '../service/comment.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

@Component({
  selector: 'jhi-comment-update',
  templateUrl: './comment-update.component.html',
})
export class CommentUpdateComponent implements OnInit {
  isSaving = false;

  commentsSharedCollection: IComment[] = [];
  usersSharedCollection: IUser[] = [];

  editForm = this.fb.group({
    id: [],
    date: [],
    text: [],
    login: [],
    child: [],
  });

  constructor(
    protected commentService: CommentService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ comment }) => {
      if (comment.id === undefined) {
        const today = dayjs().startOf('day');
        comment.date = today;
      }

      this.updateForm(comment);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const comment = this.createFromForm();
    if (comment.id !== undefined) {
      this.subscribeToSaveResponse(this.commentService.update(comment));
    } else {
      this.subscribeToSaveResponse(this.commentService.create(comment));
    }
  }

  trackCommentById(_index: number, item: IComment): number {
    return item.id!;
  }

  trackUserById(_index: number, item: IUser): string {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IComment>>): void {
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

  protected updateForm(comment: IComment): void {
    this.editForm.patchValue({
      id: comment.id,
      date: comment.date ? comment.date.format(DATE_TIME_FORMAT) : null,
      text: comment.text,
      login: comment.login,
      child: comment.child,
    });

    this.commentsSharedCollection = this.commentService.addCommentToCollectionIfMissing(this.commentsSharedCollection, comment.child);
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing(this.usersSharedCollection, comment.login);
  }

  protected loadRelationshipsOptions(): void {
    this.commentService
      .query()
      .pipe(map((res: HttpResponse<IComment[]>) => res.body ?? []))
      .pipe(map((comments: IComment[]) => this.commentService.addCommentToCollectionIfMissing(comments, this.editForm.get('child')!.value)))
      .subscribe((comments: IComment[]) => (this.commentsSharedCollection = comments));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing(users, this.editForm.get('login')!.value)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }

  protected createFromForm(): IComment {
    return {
      ...new Comment(),
      id: this.editForm.get(['id'])!.value,
      date: this.editForm.get(['date'])!.value ? dayjs(this.editForm.get(['date'])!.value, DATE_TIME_FORMAT) : undefined,
      text: this.editForm.get(['text'])!.value,
      login: this.editForm.get(['login'])!.value,
      child: this.editForm.get(['child'])!.value,
    };
  }
}
