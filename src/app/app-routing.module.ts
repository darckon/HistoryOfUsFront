import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginFormComponent } from './core/modules/login/login.component';
import { HomeComponent } from './core/modules/home/home.component';

import { AuthGuard } from './core/modules/guard/auth.guard';
import { ErrorComponent } from './core/modules/error/error.component';
import { UsersComponent } from './core/modules/users/users.component';
import { ProfileEditComponent } from './core/modules/profiles/profile-edit/profile-edit.component';
import { ProfileCreateComponent } from './core/modules/profiles/profile-create/profile-create.component';
import { ProfileListComponent } from './core/modules/profiles/profile-list/profile-list.component';
import { InstitutionDetailComponent } from './core/modules/institutions/institution-detail/institution-detail.component';
import { NotificationsComponent } from './core/modules/notifications/notifications.component';
import { CreateUserComponent } from './core/modules/users/create/create_user.component';
import { UserEditComponent } from './core/modules/users/user-edit/user-edit.component';

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
          path: 'users',
          data: {
            breadcrumb: 'Usuarios'
          },
          children:
            [
              {
                path: '',
                component: UsersComponent,
                data: {
                  breadcrumb: 'listar usuarios'
                },
              },
              {
                path: 'create',
                component: CreateUserComponent,
                data: {
                  breadcrumb: 'Crear usuario'
                },
              },
              {
                path: 'detail/:id',
                component: UserEditComponent,
                data: {
                  breadcrumb: 'Editar usuario'
                },
              },
            ]
        },
        {
          path: 'profiles',

          data: {
            breadcrumb: 'Perfiles'
          },
          children:
            [
              {
                path: '',
                component: ProfileListComponent,
                data: {
                  breadcrumb: 'Listado de perfiles'
                },
              },
              {
                path: 'detail/:id',
                data: {
                  breadcrumb: 'Detalle del perfil'
                },
                component: ProfileEditComponent,
              },
              {
                path: 'create',
                data: {
                  breadcrumb: 'Crear perfil'
                },
                component: ProfileCreateComponent,
              },
            ]
        },
        {
          path: 'institutions',
          data: {
            breadcrumb: 'Institución'
          },
          children:
            [
              {
                path: 'detail',
                data: {
                  breadcrumb: 'Crear movimiento'
                },
                component: InstitutionDetailComponent,
              },
              {
                path: '',
                redirectTo: '/detail',
                pathMatch: 'full'
              },
            ]

        },
        {
          path: 'supplying',
          data: {
            breadcrumb: 'Abastecimiento'
          },
          canActivate: [AuthGuard],
          children: [
            { path: '', loadChildren: () => import('./supplying/supplying.module').then(m => m.SupplyingModule) },
          ]
        }
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