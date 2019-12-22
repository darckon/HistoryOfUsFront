import { YesnoComponent } from './core/components/yesno/yesno.component';
import { NgModule } from '@angular/core';
import { SeisMaterialModule } from './material-module';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './core/components/upload/upload.component';
import { Ng2Rut } from 'ng2-rut';
import { ProgressComponent } from './core/components/progress/progress.component';
import { ProgressBarModule } from 'angular-progress-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports:
    [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      SeisMaterialModule,
      ProgressBarModule,
      Ng2Rut,

    ],
  declarations:
    [
      YesnoComponent,
      UploadComponent,
      ProgressComponent
    ],
  exports: [
    YesnoComponent,
    ProgressBarModule,
    UploadComponent,
    ProgressComponent
  ]
})
export class SeisModule { }