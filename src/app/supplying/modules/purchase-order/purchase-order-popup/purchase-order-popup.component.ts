import { Component, OnInit, Inject, ViewChildren, QueryList, ElementRef, ViewChild, Input } from '@angular/core';
import { switchMap, tap, finalize, debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService } from '../../../services/movement.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatPaginator } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SeisMatPopoverComponent } from 'src/app/core/components/popover/popover.component';

@Component({
  selector: 'seis-purchase-order-popup',
  templateUrl: './purchase-order-popup.component.html',
  styleUrls: ['./purchase-order-popup.component.scss']
})
export class PurchaseOrderPopupComponent implements OnInit {
  currentProfileData: any;
  currentInstitution: string = null;
  currentModule: ModuleInfo = null;
  movement: any = {};
  isLoading: boolean = false;

  document: any = null;
  provider: any = null;
  dataLoaded: boolean = false;

  is_service: boolean = false;
  detailArticleDataSource = new MatTableDataSource<any>([]);
  detailArticleDisplayedColumns: string[] = [ 'provider_product_code' , 'charge',  'quantity', 'unit_value', 'subtotal'];
    
  @Input('text') text: string = null;
  @ViewChild('popover', { static: true }) popover: SeisMatPopoverComponent;
  @Input('code') code: string;
  ocData: any = null;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  historicalData: any;
  transferElementCount: number = 0;
  providerReturnModule: ModuleInfo;

  constructor(private movementService: MovementService,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService, 
   ) { 


   }

   Init()
   {
 
     if (!this.dataLoaded) {
       this.currentProfileData = this.userService.getCurrentProfile();
       this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/detail');
       this.providerReturnModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/return');

       this.isLoading = true;
 
       
       var tasks$ = [];
       
       
       tasks$.push( this.movementService.detail(this.currentModule, this.code));
 
 
       forkJoin(...tasks$).subscribe(
         (results: any) => 
         {
            this.ocData = results[0].data.results[0];
            console.log(this.ocData)
            this.document = this.ocData.document[0].document;
            this.is_service = this.ocData.is_service;
            this.movement.detail_transfer = (this.ocData.detail_transfer as []).filter((x: any) => x.is_processed == false);
            this.transferElementCount = this.movement.detail_transfer.length;
            if(this.is_service){
              this.detailArticleDataSource = new MatTableDataSource<any>(this.ocData.detail_service);
            }else{
              this.detailArticleDataSource = new MatTableDataSource<any>(this.ocData.detail_article);
            }
            this.detailArticleDataSource.paginator = this.paginator;

            this.historicalData = this.ocData.state_movement_historical;

            this.dataLoaded    = true;

         },
         (error) =>
         {
           this.dataLoaded = false;
         },
         ()=>
         {
           this.isLoading = false;
         });
 
     }
      
   }


  ngOnInit() {
    this.popover.PopOverMenu.onMenuOpen.subscribe(
      (event) =>
      { 
        if(this.dataLoaded==false)
        {
          this.Init();
        }
      }
    );

  }

}
