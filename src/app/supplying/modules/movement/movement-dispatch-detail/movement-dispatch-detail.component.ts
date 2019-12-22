import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialog, MatSnackBar, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { OrderService } from 'src/app/supplying/services/order.service';
import { DatePipe } from '@angular/common';
import { MovementService, StockInLocation } from 'src/app/supplying/services/movement.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants';
import { Movement } from '../Movement';
import { MovementDispatchDetailPackingFactorDialog } from './MovementDispatchDetailPackingFactorDialog.component';
import { MovementDispatchDetailTargetDialog } from './MovementDispatchDetailTargetDialog';
import { MovementDispatchCancelDialog } from './MovementDispatchCancelDialog';

export interface RowElement {
  article: string;
  article_code: string;
  article_name: string;
  quantity: string;
}

@Component({
  selector: 'app-movement-dispatch-detail',
  templateUrl: './movement-dispatch-detail.component.html',
  styleUrls: ['./movement-dispatch-detail.component.scss']
})
export class MovementDispatchDetailComponent implements OnInit {

  currentModule: ModuleInfo;
  dispatchModule: ModuleInfo = null;
  currentUser: any;

  currentProfileData: any;
  currentInstitution: any;

  isLoading: boolean;

  currentOption:number = 0;

  movementId: string;
  origin: string;
  data: any;
  articleGroups: FormArray;

  detailTransferData: any;
  editedTransfersQuantity: number;
  historicalData: any[] = [];
  historicDispatches:any[] = [];
  transitDispatches:any[] = [];
  packing_factor: boolean = false;

  dataSource = new MatTableDataSource<RowElement>([]);
  articleList: any[] = [];
  orderFormGroup: FormGroup;
  location: any;
  displayedColumns: string[] = ['article_code', 'article_name', 'requested', 'debt', 'stock', 'quantity'];
  allowDispatch: boolean = false;
  movementData: any;
  InitialState: boolean = false;
  
  hasItems:boolean = false;
  dataLoaded: boolean = false;

  //permissions
  can_packing_factor: ModuleInfo = null;
  can_cancel: ModuleInfo = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private ordersService: OrderService,
    private movementService: MovementService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();

    this.currentUser = this.userService.getCurrentUserData();

    this.currentModule  = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/detail');
    this.dispatchModule = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/button');
    this.can_packing_factor = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/packing-factor');
    this.can_cancel            = this.moduleManagerService.getModuleByInternalUrl('supplying/orders/btn-cancel-order');

    if(!this.currentModule || !this.dispatchModule)
    {
      this.dataLoaded = false;
      this.isLoading  = false;
    }
    else
    {
      this.isLoading = true;
      this.loadDetail();
    }

    this.isLoading = true;
    this.loadDetail();

  }

  loadDetail() {

    this.route.paramMap.subscribe((success: any) => {
      this.movementId = success.params.movementId;
      this.origin = success.params.origin;
      let allItemsSent = true;

      this.ordersService.detail(this.currentModule, this.movementId).subscribe(
        (successData: Movement) => {
          this.data = successData;
          this.data.movement_state.movement_type_state.filter(
            (x:any) => 
              {
                if( x.movement_state==this.data.movement_state.id && x.is_inicial==true){
                  this.InitialState = true
                  return x;
                }
              });
          
          this.movementData = [...successData.detail_article];  
          this.allowDispatch = false;
          
          this.location = this.data.location;
          this.historicalData = this.data.state_movement_historical;

          let sType;
          this.articleList = (this.data.detail_article as []).slice();

          (this.data.detail_article.length > 0) ? sType = 0 : sType = 1;
          this.movementService.getOrderDebts(this.data.id, sType)
          .subscribe(
            
            (debtData: any) => 
            {
            let stockItemDataRequest: StockInLocation[] = [];
            this.articleList.map((elem) => stockItemDataRequest.push({ location_id: successData.origin_id.toString(), article_id: elem.article_id }));
            console.log(this.articleList);

            this.movementService.getArticlesInLocation(stockItemDataRequest).subscribe(
              (stockData: any) => {

                if(stockData.status == false)
                {
                  (this.articleList as []).map(
                    (element: any, i) => {
                      this.articleList[i].real_stock = 0;
                    }
                  )                  
                }
                else
                {
                  (stockData.data as []).map(
                    (element: any, i) => {
                      this.articleList[i].real_stock = element.real_stock;
                    }
                  )
                }

                for (let i = 0; i < this.articleList.length; i++) {
                  let datafilter = debtData.data.filter(
                    (x:any) => 
                    { 
                      if (x.article_id == this.articleList[i].article_id){
                        return x
                      }
                    });
                  this.articleList[i].debt = datafilter[0].debt;
                  this.articleList[i].current_quantity = Math.min(datafilter[0].debt, this.articleList[i].quantity);
                  this.articleList[i].requested = datafilter[0].requested;
                  this.articleList[i].percentage = Math.round(((datafilter[0].requested - datafilter[0].debt) / datafilter[0].requested) * 100);
                  if (this.articleList[i].percentage != 100)
                    allItemsSent = false;
                  }

                if (this.dispatchModule && (this.data.movement_state.id == SupplyingConstants.MOVEMENT_STATE_ORDER_AUTHORIZED || this.data.movement_state.id == SupplyingConstants.MOVEMENT_STATE_ORDER_PARTIAL_RECEPT || this.data.movement_state.id == SupplyingConstants.MOVEMENT_STATE_ORDER_MODIFIED  || this.data.movement_state.id == SupplyingConstants.MOVEMENT_STATE_ORDER_REJECTED  ))
                  this.allowDispatch = true;
                if (allItemsSent)
                  this.allowDispatch = false;

                this.dataSource = new MatTableDataSource<RowElement>(this.articleList);
                this.detailTransferData = this.articleList;
                this.articleGroups = this.fb.array(this.getArticlesControls().map(article => this.fb.group(article)));

                this.orderFormGroup = this.fb.group({
                  articles: this.articleGroups,
                })

                this.orderFormGroup.valueChanges.subscribe(
                  (change)=>
                  {
                    let articles = change.articles.filter(x=>x.quantity>0);
                    this.hasItems = (articles.length>0);
                  }
                )
                let articles = this.articleGroups.value.filter(x=>x.quantity>0);
                this.hasItems = (articles.length>0);

                this.historicDispatches = this.data.transactions.filter(x => x.status!=SupplyingConstants.TRANSACTION_STATUS_TRANSIT );
                this.transitDispatches  = this.data.transactions.filter(x => x.status==SupplyingConstants.TRANSACTION_STATUS_TRANSIT );

                this.dataLoaded = true;
                this.isLoading = false;
              },
              (error) => {
                console.error(error);
                this.snackBar.open(error.error.message.detail, null, {
                  duration: 4000,
                });
                this.isLoading = false;
                this.dataLoaded = false;
              }
            );
            },
            (errorData) =>
            {
              console.error(errorData);
              this.isLoading = false;    
              this.dataLoaded = false;          
            });
        },
        (errorData) => {
          console.error(errorData);
          this.isLoading = false;
          this.dataLoaded = false;
        }
      );
    });
  }

  
  selectTransferForEdition(transfer, index) {
    const dialogRef = this.dialog.open(MovementDispatchDetailTargetDialog, {
      width: '600px',
      data: {
        transfer: transfer,
        index: index,
        fatherForm: this.orderFormGroup,
        currentOption: this.currentOption}
    });
    
    dialogRef.afterClosed().subscribe(
      (resultTransfer:any) => 
      {  
        this.articleGroups = this.fb.array(this.getArticlesControls().map(article => this.fb.group(article)));
        this.orderFormGroup = this.fb.group({
          articles: this.articleGroups,
        })
        this.orderFormGroup.updateValueAndValidity();
        
        for (let control of (this.orderFormGroup.get('articles') as FormArray).controls)
        {
          if (control.value.article==transfer.article_id) 
          {
            (control).get('max_quantity').setValue(transfer.requested);
            (control).get('quantity').setValue(transfer.requested);
            (control).get('factor').setValue(true);
            (control).get('comment').setValue(transfer.comment);
            
          }
        }
        this.packing_factor = true
      }
    );

  }

  getMarkedForEditionTransfers(): any[] {
    let marked = this.detailTransferData as any[];
    return  marked.filter( 
      (x:any) => 
      {
        if(x._editInfo)
        {
          if(x._editInfo.edited==true)
            return true;
          return false;
        }
        return false;
      }    
    );
  }

  getArticlesControls(): any[] {
    let controlArray: any[] = [];

    for (let i = 0; i < this.articleList.length; i++) {
      let article = this.articleList[i];
      controlArray.push({
        article: [this.articleList[i].article_id, null],
        quantity: [{ value: (Math.min(this.articleList[i].current_quantity, this.articleList[i].real_stock)) , disabled: !this.allowDispatch }, [Validators.min(0), Validators.max(Math.min(this.articleList[i].current_quantity, this.articleList[i].real_stock)), Validators.pattern("^[0-9]*$"),]],
        max_quantity: [{ value: (Math.min(this.articleList[i].current_quantity, this.articleList[i].real_stock)), disabled: false}, null],
        factor:false,
        comment:null
      });
    }
    return controlArray;
  }

  return() {
    this.router.navigate(['/supplying/dispatches/']);
  }

  openDialog(): void {

    let userId = this.currentUser.id;
    let articles = this.articleGroups.value.filter(x=>x.quantity>0);
    let sendData = { 
      module: this.dispatchModule,
      id: this.data.id,
      articles: articles,
      userId: userId,
      packing_factor: this.packing_factor,
    };
    if(articles.length>0)
    {
      const dialogRef = this.dialog.open(MovementDispatchDetailDialog, {
        width: '450px',
        data: sendData
      });
       dialogRef.afterClosed().subscribe(result => {
        if (result == true) 
        {
          this.snackBar.open("¡El pedido fue despachado!", null, {
            duration: 4000,
          });
          this.InitialState=false;
          this.isLoading = true;
          this.loadDetail();
        }
        else
        {
          this.snackBar.open("No se realizó el despacho.", null, {
            duration: 4000,
          });
        }
      });
    }
    else
    {
      this.snackBar.open("No ha despachado ningún artículo", null, {
        duration: 4000,
      });   
    }
  }

  sendMaxArticles() : void
  {

    for (let control of (this.orderFormGroup.get('articles') as FormArray).controls)
    {
      if (control instanceof FormGroup) 
      {
        (control).get('quantity').setValue((control as FormGroup).get('max_quantity').value);
      }
    }
    
  }

  setZeroArticles() : void
  {
    for (let control of (this.orderFormGroup.get('articles') as FormArray).controls)
    {
      if (control instanceof FormGroup) 
      {
         (control).get('quantity').setValue(0);
      }
    }
  }

  cancel()
  {
    const dialogRef = this.dialog.open(MovementDispatchCancelDialog, {
      width: '600px',
      data: {}
    });
    
    dialogRef.afterClosed().subscribe(
      (resultTransfer:any) => {
        if(resultTransfer.valid){
          let data:any = {};
          data.is_canceled = true;
          data.comment= resultTransfer.comment;
          data.view_type = SupplyingConstants.VIEW_TYPE_CELLAR;
          this.ordersService.patch(data,this.data.id.toString()).subscribe(
            (successData) => {
                this.snackBar.open("¡El pedido fue cancelado!", null, {
                  duration: 4000,
                });
                this.InitialState=false;
                this.loadDetail();
            },
            (errorData) => {
              this.snackBar.open(errorData.error.message.detail, null, {
                duration: 4000,
              });
            });
        }
    });
  }

}



@Component({
  selector: 'movement-dispatch-detail-dialog',
  templateUrl: './movement-dispatch-detail-dialog.html',
})
export class MovementDispatchDetailDialog {

  loading: boolean = false;
  dataSent: boolean = false;
  success: boolean = false;
  msg: string = "";

  constructor(
    public dialogRef: MatDialogRef<MovementDispatchDetailDialog>,
    private movementService: MovementService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  accept() {
    this.loading = true;
    this.dataSent = false;
    let data = this.data;
    
    this.movementService.dispatch(data.module, data.id, data.articles, data.userId, data.packing_factor).subscribe(
      (successData) => {
        this.success = true;
        this.loading = false;
        this.dataSent = true;
        this.dialogRef.close(true);
      },
      (errorData) => {
        this.success = false;
        this.msg = errorData.error.message.detail;
        this.loading = false;
        this.dataSent = true;
        this.dialogRef.close(false);
      }
    );
    

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
