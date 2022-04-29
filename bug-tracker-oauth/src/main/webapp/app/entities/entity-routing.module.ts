import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'project',
        data: { pageTitle: 'jhipsterApp.project.home.title' },
        loadChildren: () => import('./project/project.module').then(m => m.ProjectModule),
      },
      {
        path: 'label',
        data: { pageTitle: 'jhipsterApp.label.home.title' },
        loadChildren: () => import('./label/label.module').then(m => m.LabelModule),
      },
      {
        path: 'ticket',
        data: { pageTitle: 'jhipsterApp.ticket.home.title' },
        loadChildren: () => import('./ticket/ticket.module').then(m => m.TicketModule),
      },
      {
        path: 'attachment',
        data: { pageTitle: 'jhipsterApp.attachment.home.title' },
        loadChildren: () => import('./attachment/attachment.module').then(m => m.AttachmentModule),
      },
      {
        path: 'comment',
        data: { pageTitle: 'jhipsterApp.comment.home.title' },
        loadChildren: () => import('./comment/comment.module').then(m => m.CommentModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
