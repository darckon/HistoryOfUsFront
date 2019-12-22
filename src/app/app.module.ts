import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './shared/jwt/jwt.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//modulos sistema
import { CoreModule } from './core/core.module';
import { GlobalErrorHandler } from './shared/global-error-handler.service';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { TooltipModule } from 'ng2-tooltip-directive';
import { ProgressBarModule } from "angular-progress-bar"
import { SeisMatPopoverModule } from 'src/app/core/components/popover/popover.module'
import { PreviousRouteServiceService } from './core/services/previousRouteService/previous-route-service.service';
import { ProgressComponent } from './core/components/progress/progress.component';

import { BreadcrumbsModule } from "ng6-breadcrumbs";
import { SeisModule } from './seis-module';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SeisMatPopoverModule
  ],
  providers: [
    DatePipe,
    TranslateService,
    PreviousRouteServiceService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  exports:
    [
      TooltipModule,
      SeisMatPopoverModule
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }