import { ChangeDetectionStrategy, Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatMenuTrigger, MenuPositionX, MenuPositionY } from '@angular/material';

@Component({
  selector: 'seis-popover',
  templateUrl: './popover.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'seisMatPopover'
})
export class SeisMatPopoverComponent {
  @Input() xPosition: MenuPositionX = 'after';
  @Input() yPosition: MenuPositionY = 'below';
  @Input() popoverContent: TemplateRef<any>;
  @ViewChild(MatMenuTrigger, { static: true }) private matMenuTrigger: MatMenuTrigger;
  // for outside call

  get PopOverMenu():MatMenuTrigger
  {
    return this.matMenuTrigger;
  }

  open() {
    this.matMenuTrigger.openMenu();
  }

  close() {
    this.matMenuTrigger.closeMenu();
  }
}
