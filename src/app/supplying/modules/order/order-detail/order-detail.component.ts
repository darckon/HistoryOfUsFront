import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { OrderService } from 'src/app/supplying/services/order.service';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource, MatPaginator } from '@angular/material';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants';
import { Movement } from '../../movement/Movement';
import { OrderDetailTargetDialog } from './OrderDetailTargetDialog';


export interface RowElement {
  article: string;
  article_code: string;
  article_name: string;
  quantity: string;
}

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {

  data: Movement;

  currentProfileData: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  isLoading: boolean;
  movementId: string;
  origin: any;
  
  articleGroups: FormArray;
  editMode: boolean = false;

  dataSource = new MatTableDataSource<RowElement>([]);
  historicalData:any[];
  historicDispatches:any[] = [];

  articleList: any[] = [];
  transactions: any[] = [];
  allowDispatchmentApproval : Boolean = false;

  orderFormGroup: FormGroup;
  location: any;
  finalState: boolean = false;
  displayedColumns: string[] = ['article_code','article_name','quantity','actions'];
  
  articleFormGroup: FormGroup;
  locations: any[];
  costCenters: any[];
  canAuthorize:boolean;
 

  currentUser: any;
  isAuthorized: boolean;
  isCanceled: boolean = false;
  transitDispatches: any[];

  cancel_comment: string;

  // permissions
  canCancel:ModuleInfo = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,    
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private ordersService: OrderService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.currentProfileData   = this.userService.getCurrentProfile();
    this.currentInstitution   = this.userService.getCurrentUserInstitutionId();

    this.currentModule        = this.moduleManagerService.getModuleByInternalUrl('supplying/orders/detail');
    this.canCancel            = this.moduleManagerService.getModuleByInternalUrl('supplying/orders/btn-cancel-order');

    this.locations            = this.userService.getUserLocations().map( (x:any) => ({...x, type: SupplyingConstants.ORIGIN_TYPE_CELLAR})  );
    this.costCenters          = this.userService.getUserCostCenter().map( (x:any) => ({...x, type: SupplyingConstants.ORIGIN_TYPE_COST_CENTER})  );
    this.currentUser          = this.userService.getCurrentUserData();
    this.canAuthorize         = this.userService.getUserCanAuthorize();

    
    
    this.isLoading = true;
    this.loadDetail();
  }

  
  getArticlesControls():any[]
  {
    let controlArray:any[] = [];

    for (let i = 0; i < this.articleList.length; i++) {

      let article = this.articleList[i];
      controlArray.push(
        {
          quantity:[ {value:(article.quantity), disabled:true }  ,  [Validators.min(0),Validators.pattern("^[0-9]*$")] ],
        }        
      );
    }
    return controlArray;
  }

  loadDetail() {
    
    this.route.paramMap.subscribe(
      (success: any) => {
        this.movementId = success.params.movementId;
        //this.movementState = success.params.movementId
        this.ordersService.detail(this.currentModule, this.movementId).subscribe(
          (successData: Movement) => {
              this.data = successData;
              this.data.movement_state.movement_type_state.filter(
                (x:any) => 
                  {
                    if( x.movement_state==this.data.movement_state.id && x.is_final==true){
                      this.finalState = true
                      return x;
                    }
                  });
              this.isAuthorized = this.data.is_authorized;
              this.transactions = this.data.transactions;


              this.allowDispatchmentApproval = false;
              this.transactions.map(
                (transaction) =>
                {
                  if(transaction.status == SupplyingConstants.TRANSACTION_STATUS_TRANSIT)
                    this.allowDispatchmentApproval = true;
                }
              )

              this.articleList = this.data.detail_article.map(
                (article:any) =>
                {
                  let aux = article;
                  article.article = article.article_id;
                  return aux;
                }
              );
             
              console.log('-----')
              console.log(this.articleList)
              console.log('-----')

              this.dataSource     = new MatTableDataSource<RowElement>(this.articleList);
              this.historicalData = this.data.state_movement_historical;
              this.articleGroups = this.fb.array(this.getArticlesControls().map(article => this.fb.group(article)));
              this.orderFormGroup = this.fb.group({
                articles: this.articleGroups,
              })

              this.articleFormGroup = this.fb.group({
                article: ["",Validators.required],
                quantityInput: ["1", [Validators.required , Validators.min(1), Validators.pattern("^[0-9]*$")] ],
              })              
          
              this.articleFormGroup.disable();
              this.orderFormGroup.disable();

              this.historicDispatches = this.data.transactions.filter(x => x.status!=SupplyingConstants.TRANSACTION_STATUS_TRANSIT );
              this.transitDispatches  = this.data.transactions.filter(x => x.status==SupplyingConstants.TRANSACTION_STATUS_TRANSIT );
              this.isLoading = false;



          },
          (errorData) =>
          {
            console.error(errorData);
          }
        );
      }
    );

  }

  activeEditMode()
  {
    (this.editMode==false) ? this.editMode = true : this.editMode = false;
    if(this.editMode == true)
    {
      this.orderFormGroup.enable();
      this.articleFormGroup.enable();
    }
    else
    {
      this.orderFormGroup.disable();
      this.articleFormGroup.disable();
    }
  }

  addArticle()
  {

    let article = this.articleList.find(x=>x.article_id==this.articleFormGroup.value.article.id);
    if(!article)
    {
      let quantity = this.articleFormGroup.value.quantityInput;
      this.articleList.push({article:this.articleFormGroup.value.article.id, article_code:this.articleFormGroup.value.article.code, article_name:this.articleFormGroup.value.article.name, quantity: this.articleFormGroup.value.quantityInput, comment_mov_detail: null });
      this.articleFormGroup.get('article').setValue(""); 
      this.articleFormGroup.get('quantityInput').setValue("1");
      this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

      let FormGroup = this.fb.group(
        {
          quantity:[ {value:(quantity), disabled:false }  ,  [Validators.min(0),Validators.pattern("^[0-9]*$")] ],
        });
      (this.orderFormGroup.get('articles') as FormArray).push(FormGroup);

    }
    else
    {
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.",null, {
        duration: 4000,
      });  
    }

  }

  removeArticle(ind:number)
  {
    
    (this.orderFormGroup.get('articles') as FormArray).removeAt(ind);
    this.articleList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

  }

  send()
  {

    let items = {}

    items = this.orderFormGroup.value.articles.map(
      (x:any, index) =>
      {
        let article = this.articleList[index];
        article.quantity = x.quantity;

        return article;
      }
    )

    let data:any = {};
    data.movement_detail   = items;
    data.user              = this.currentUser.id;
    data.movement_state_id = SupplyingConstants.MOVEMENT_STATE_ORDER_MODIFIED;

    this.ordersService.patch(data,this.data.id.toString()).subscribe(
      (successData) => {
        this.snackBar.open("¡Datos guardados con exito!", null, {
          duration: 4000,
        });
      },
      (errorData) => {
        this.snackBar.open(errorData.error.message.detail, null, {
          duration: 4000,
        });
      });
   
  
    return data;

  }

  authorize()
  {
    let data:any = {};
    data.authorized_by     = this.currentUser.id;
    data.is_authorized     = true;
    data.movement_state_id = SupplyingConstants.MOVEMENT_STATE_ORDER_AUTHORIZED;
    this.isAuthorized = true;

    this.ordersService.patch(data,this.data.id.toString()).subscribe(
      (successData) => {
        this.snackBar.open("¡El pedido fue autorizado!", null, {
          duration: 4000,
        });
      },
      (errorData) => {
        this.snackBar.open(errorData.error.message.detail, null, {
          duration: 4000,
        });
      });

  }

  cancel()
  {
    const dialogRef = this.dialog.open(OrderDetailTargetDialog, {
      width: '600px',
      data: {}
    });
    
    dialogRef.afterClosed().subscribe(
      (resultTransfer:any) => {
        if(resultTransfer.valid){
          this.isCanceled = true;
          let data:any = {};
          data.is_canceled = true;
          data.comment= resultTransfer.comment;
          data.view_type = SupplyingConstants.VIEW_TYPE_ORDER;
          this.ordersService.patch(data,this.data.id.toString()).subscribe(
            (successData) => {
                this.snackBar.open("¡El pedido fue cancelado!", null, {
                  duration: 4000,
                });
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
