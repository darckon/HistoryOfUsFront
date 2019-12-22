import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material';

import { SeisMatPopoverComponent } from './popover.component';

@NgModule({
  declarations: [SeisMatPopoverComponent],
  imports: [CommonModule, MatMenuModule],
  exports: [SeisMatPopoverComponent]
})
export class SeisMatPopoverModule {}
