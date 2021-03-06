import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { UserRouteAccessService } from 'src/app/services/auth/user-route-access.service';
import { EntitiesPage } from './entities.page';

const routes: Routes = [
  {
    path: '',
    component: EntitiesPage,
    data: {
      authorities: ['ROLE_USER'],
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'project',
    loadChildren: () => import('./project/project.module').then(m => m.ProjectPageModule),
  },
  {
    path: 'label',
    loadChildren: () => import('./label/label.module').then(m => m.LabelPageModule),
  },
  {
    path: 'ticket',
    loadChildren: () => import('./ticket/ticket.module').then(m => m.TicketPageModule),
  },
  {
    path: 'attachment',
    loadChildren: () => import('./attachment/attachment.module').then(m => m.AttachmentPageModule),
  },
  {
    path: 'comment',
    loadChildren: () => import('./comment/comment.module').then(m => m.CommentPageModule),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, RouterModule.forChild(routes), TranslateModule],
  declarations: [EntitiesPage],
})
export class EntitiesPageModule {}
