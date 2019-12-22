import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeisMaterialModule } from 'src/app/material-module';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { HomeComponent } from '../core/modules/home/home.component';
import { LoginFormComponent } from '../core/modules/login/login.component';
import { CreateUserComponent } from '../core/modules/users/create/create_user.component';
import { NavbarComponent } from '../core/templates/partials/navbar/navbar.component';
import {TranslateModule, TranslateLoader, TranslateService} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import { LayoutComponent } from '../core/templates/layout/layout.component';
import { FooterComponent } from '../core/templates/partials/footer/footer.component';

import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from "@angular/flex-layout";
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


import { SidebarComponent } from './templates/partials/sidebar/sidebar.component';

import { GlobalErrorHandler } from '../shared/global-error-handler.service';
import { ErrorComponent } from './modules/error/error.component';
import { PreviousRouteServiceService } from './services/previousRouteService/previous-route-service.service';

import { UsersComponent } from './modules/users/users.component';
import { YesnoComponent } from './components/yesno/yesno.component';
import { UserService } from './services/users/user.service';
import { UserEditComponent } from './modules/users/user-edit/user-edit.component';
import { ProfileListComponent } from './modules/profiles/profile-list/profile-list.component';
import { ProfileCreateComponent } from './modules/profiles/profile-create/profile-create.component';
import { ProfileEditComponent } from './modules/profiles/profile-edit/profile-edit.component';
import { InstitutionDetailComponent } from './modules/institutions/institution-detail/institution-detail.component';
import { InstitutionService } from './services/institution/institution.service';
import { UploadComponent } from './components/upload/upload.component';
import { ProgressComponent } from './components/progress/progress.component';
import { NotificationsComponent } from './modules/notifications/notifications.component';
import { NotificationsService } from './services/notifications/notifications.service';


import {BreadcrumbsModule} from "ng6-breadcrumbs";
import { UserAutocompleteComponent } from './modules/users/user-autocomplete/user-autocomplete.component';
import { SeisModule } from '../seis-module';


export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
}

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    BreadcrumbsModule,
    FlexLayoutModule,
    LayoutModule,
    ReactiveFormsModule,
    FormsModule,
    SeisModule,
    SeisMaterialModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    NavbarComponent,
    LoginFormComponent,
    HomeComponent,
    CreateUserComponent,
    FooterComponent,
    LayoutComponent,
    SidebarComponent,
    ErrorComponent,
    UserEditComponent,
    CreateUserComponent,
    UserEditComponent,
    UsersComponent,
    ProfileListComponent,
    ProfileCreateComponent,
    ProfileEditComponent,
    InstitutionDetailComponent,
    NotificationsComponent,
    
  ],
  exports: [
    NavbarComponent,
    FooterComponent,
    LayoutComponent,
    SidebarComponent,
    SeisMaterialModule
  ],
  providers: [
    TranslateService,
    PreviousRouteServiceService,
    InstitutionService,
    UserService,
    NotificationsService
    //{ provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
})
export class CoreModule { }
