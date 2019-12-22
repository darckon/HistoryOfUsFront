import { Component, OnInit, Inject } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { ArticlesService } from 'src/app/supplying/services/articles.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { debounceTime, switchMap, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { OrderService } from 'src/app/supplying/services/order.service';
import {merge} from "rxjs";
import { Movement } from '../Movement';

@Component({
  selector: 'app-movement-dispatchment',
  templateUrl: './movement-dispatchment.component.html',
  styleUrls: ['./movement-dispatchment.component.scss']
})
export class MovementDispatchmentComponent implements OnInit {

  isLoading: boolean         = false;
  canAcceptDispatch: boolean = false;
  isService:boolean          = false;
  
  currentModule: ModuleInfo  = null;
  orderModule: ModuleInfo    = null;

  currentUser: any;
  currentInstitution: number = null;
  currentProfileData: any;

  location: any;

  transactionFormArray: FormArray;
  orderFormGroup: FormGroup;

  movementId: string;
  data: any;
  isAuthorized: boolean;
  transactions: any[] = [];
  historicDispatches:any[] = [];
  historicalData:any[];

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['article_code','article_name','quantity','actions',"actions2"];
  dataLoaded:boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private ordersService: OrderService,
    private articleService: ArticlesService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) { }
  

  getDispatchControls():any[]
  {
    let controlArray:any[] = [];

    for (let i = 0; i < this.transactions.length; i++) {

      let transaction = this.transactions[i];
      controlArray.push(
        {
          status:[ null,Validators.required ],
          id:[ transaction.id,Validators.required ],
        }        
      );
    }

    return controlArray;
  }


  ngOnInit() {
    this.currentUser        = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/recept');
    this.orderModule   = this.moduleManagerService.getModuleByInternalUrl('supplying/orders/detail'); 

    if(!this.currentModule || !this.orderModule)
    {
      console.log(this.currentModule);
      console.log(this.orderModule);
      this.dataLoaded = false;
      this.isLoading  = false;
    }
    else
    {
      this.isLoading = true;
      this.loadDetail();
    }


  }

  loadDetail() {
    this.route.paramMap.subscribe(
      (success: any) => {
        this.movementId = success.params.movementId;



        this.ordersService.detail(this.orderModule, this.movementId).subscribe(
          (successData: Movement) => {
              
              this.data         = successData;
              
              this.isAuthorized = this.data.is_authorized;
              this.location     = this.data.location;

              this.transactions = this.data.transactions.filter(x=> x.status==SupplyingConstants.TRANSACTION_STATUS_TRANSIT);
       
              this.canAcceptDispatch = false;
              this.transactions.map(
                (transaction) =>
                {
                  if(transaction.status == SupplyingConstants.TRANSACTION_STATUS_TRANSIT)
                    this.canAcceptDispatch = true;
                }
              )

              this.transactionFormArray = this.fb.array(this.getDispatchControls().map(dispatch => this.fb.group(dispatch)));
              this.orderFormGroup = this.fb.group({
                dispatchArray: this.transactionFormArray,
              })

              this.dataSource         = new MatTableDataSource<any>(this.transactions);
              this.isLoading          = false;
              this.historicDispatches = this.data.transactions.filter(x => x.status!=SupplyingConstants.TRANSACTION_STATUS_TRANSIT );
              this.historicalData     = this.data.state_movement_historical;
              this.dataLoaded         = true;
              console.log(this.data.transactions);

          },
          (errorData) =>
          {
            this.dataLoaded         = false;
            console.log(errorData);
          }
        );
      }
    );
  }

  markAllAccepted()
  {

    for (let control of (this.orderFormGroup.get('dispatchArray') as FormArray).controls)
    {
      if (control instanceof FormGroup) 
      {
         (control as FormGroup).get('status').setValue("1");
      }
    }
    
  }

  markAllRejected()
  {
    for (let control of (this.orderFormGroup.get('dispatchArray') as FormArray).controls)
    {
      if (control instanceof FormGroup) 
      {
         (control as FormGroup).get('status').setValue("2");
      }
    }
  }

  send()
  {
    let articles:any[] = [];
    (this.orderFormGroup.value.dispatchArray as []).map(
      (article:any) =>
      {
        articles.push({id: article.id, status: parseInt(article.status)})
      }
    );

    this.movementService.acceptDispatch(this.currentModule,parseInt(this.movementId),articles,this.currentUser.id).subscribe(
      (successData) => {
        this.snackBar.open("¡La información del pedido fue realizada!", null, {
          duration: 4000,
        });
        this.isLoading = true;
        this.loadDetail();
      },
      (errorData) => {
        this.snackBar.open(errorData.error.message.detail, null, {
          duration: 4000,
        });
      });    
  }

}
