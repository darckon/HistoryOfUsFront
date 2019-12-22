import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { SeisMatPopoverComponent } from 'src/app/core/components/popover/popover.component';

@Component({
  selector: 'app-purchase-order-info',
  templateUrl: './purchase-order-info.component.html',
  styleUrls: ['./purchase-order-info.component.scss']
})
export class PurchaseOrderInfoComponent implements OnInit {
  @Input('code') code: string;
  @ViewChild('popover', { static: false }) popover: SeisMatPopoverComponent;

  loaded: boolean = false;
  data: any = null;
  currentProfileData: any;
  purchaseOrderModule: ModuleInfo;
  movement: any;
  ocType: string;
  transferElementCount: any;
  articleElementCount: any;
  serviceElementCount: any;
  historyElementCount: any;
  lastHistory: any;

  constructor(private movementService: MovementService,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService, ) { }

  ngOnInit() {

  }

  handleTooltipEvents(event: string) {

    if (!this.loaded) {
      this.currentProfileData = this.userService.getCurrentProfile();
      this.purchaseOrderModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/detail');

      if (this.purchaseOrderModule) {
        this.movementService.detail(this.purchaseOrderModule, this.code).subscribe(
          (successData: any) => {
            console.log(successData);
            if (successData.data.count == 1) {
              this.movement = successData.data.results[0];
              this.ocType = this.purchaseOrderIsService();

              this.movement.detail_transfer = (this.movement.detail_transfer as []).filter((x: any) => x.is_processed == false);
              this.transferElementCount = this.movement.detail_transfer.length;
              this.articleElementCount = this.movement.detail_article.length;
              this.serviceElementCount = this.movement.detail_service.length;
              this.historyElementCount = this.movement.state_movement_historical.length;

              this.lastHistory = this.movement.state_movement_historical[0];
            }

            this.loaded = true;
          },
          (error) => {
            this.loaded = true;
          }
        )
      }
      else {
        //usuario no tiene previlegios
        this.loaded = true;
      }
    }
  }

  purchaseOrderIsService() {
    let countServices = this.movement.detail_service.length;
    let countArticles = this.movement.detail_article.length;
    if (countServices > 0) {
      return "SERVICE";
    }
    else if (countArticles > 0) {
      return "ARTICLE";
    }

    let marked = this.movement.detail_transfer as any[];
    marked = marked.filter(x => x._edited == true);
    if (marked.length > 0) {
      let findOneService = marked.find(x => x._type == "SERVICE");
      let findOneArticle = marked.find(x => x._type == "ARTICLE");
      if (findOneService)
        return "SERVICE";
      else if (findOneArticle)
        return "ARTICLE";
    }

    return "UNDEFINED";
  }

}
