import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent } from './core/modules/login/login.component';
import { HomeComponent } from './core/modules/home/home.component';

import { AuthGuard } from './core/modules/guard/auth.guard';
import { ErrorComponent } from './core/modules/error/error.component';
import { NotificationsComponent } from './core/modules/notifications/notifications.component';
import { BeginComponent } from './core/modules/begin/begin.component';

const routes: Routes = [
  {
    path: '',
    data: {
      breadcrumb: 'Inicio'
    },
    canActivate: [AuthGuard],
    children:
      [

        {
          path: '',
          data: {
            breadcrumb: 'Dashboard'
          },
          component: HomeComponent,
        },
        {
          path: 'notifications',
          data: {
            breadcrumb: 'Notificaciones'
          },
          component: NotificationsComponent,
        },
        {
          path: 'begin',
          data: {
            breadcrumb: 'Comenzar'
          },
          component: BeginComponent,
        },
      ]
  },
  {
    path: 'login',
    component: LoginFormComponent,
  },
  {
    path: 'error',
    component: ErrorComponent,
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }