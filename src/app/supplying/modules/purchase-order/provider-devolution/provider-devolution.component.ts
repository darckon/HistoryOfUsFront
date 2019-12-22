import { Component, OnInit } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { forkJoin } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants';

@Component({
  selector: 'app-provider-devolution',
  templateUrl: './provider-devolution.component.html',
  styleUrls: ['./provider-devolution.component.scss']
})
export class ProviderDevolutionComponent implements OnInit {

  currentProfileData: any;
  currentInstitution: string = null;
  currentModule: ModuleInfo = null;
  movement: any = {};
  isLoading: boolean = false;
  code: string;
  document: any = null;
  provider: any = null;
  ocType: any;

  movementDispatches: any[] = [];


  detailModule: ModuleInfo;
  providerReturnModule: ModuleInfo;
  dispatchData$: any;
  formGroup: FormGroup;
  isLoadingDispatchInfo: boolean = false;
  currentDispatch: any = null;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['article_code', 'article_name', 'quantity', 'quantity_left', 'batch', 'n_serie', 'return_quantity'];
  currentUser: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }


  loadOrderData() {
    this.route.paramMap.subscribe(
      (success: any) => {
        this.code = success.params.code;

        var tasks$ = [];
        tasks$.push(this.movementService.detail(this.detailModule, this.code));
        tasks$.push(this.movementService.getPurchaseOrderDispatches(this.code));

        forkJoin(...tasks$).subscribe(
          (successData: any) => {
            console.log(successData);

            if (successData[0].data.count == 1) {
              this.movement = successData[0].data.results[0];
              this.document = this.movement.document[0].document;
              this.provider = this.movement.document[0].provider;
              let found: boolean = false;
              this.movementDispatches = successData[1].data.filter(
                (x:any) => {
                  let i=0;
                  x.transaction.filter(
                    (y:any) => {
                      if(y.quantity_left == 0){
                        i++;
                      }
                    });
                  if(i != x.transaction.length){
                    return x
                  }
                });

              this.ocType = this.purchaseOrderIsService();
              this.isLoading = false;

              if (this.movementDispatches.length > 0) {
                this.formGroup = this.fb.group({
                  dispatch: [null, Validators.required],
                  articles: this.fb.array([]),
                  comment: ["", null]
                });
                this.dataSource = new MatTableDataSource<any>([]);


                this.formGroup.get('dispatch').valueChanges
                  .subscribe(
                    (change) => {
                      this.selectDispatch(change);
                    }
                  )

              }

            }
          },
          (errorData) => {
            console.error(errorData);
            this.isLoading = false;
          }
        );
      }
    );
  }
  selectDispatch(change: any) {
    this.currentDispatch = change;
    this.dataSource = new MatTableDataSource<any>(change.transaction);

    while (this.formGroup.value.articles.length > 0) {
      (this.formGroup.get('articles') as FormArray).removeAt(0);
    }


    (change.transaction as []).map(
      (transaction: any) => {
        let FormGroup = this.fb.group(
          {
            article_id: [transaction.article_id, null],
            transaction_id: [transaction.id, null],
            return_quantity: [{ value: (0), disabled: false }, [Validators.min(0), Validators.max(transaction.quantity_left), Validators.pattern("^[0-9]*$")]],
          });
        (this.formGroup.get('articles') as FormArray).push(FormGroup);
      }
    )

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

    return "UNDEFINED";
  }

  send() {
    let totalArticles = (this.formGroup.value.articles as []).reduce((a, b: any) => a + b.return_quantity, 0);
    if (totalArticles > 0) {


      let transactions: any[] = [];
      console.log(this.formGroup.value);
      (this.formGroup.value.articles as []).map(
        (transaction: any, index) => {
          console.log(this.currentDispatch);
          transactions.push({
            id_transaction: transaction.transaction_id,
            article: transaction.article_id,
            comment_mov_detail: "",
            quantity: parseInt(transaction.return_quantity)
          });
        }
      )
      let data = {

        user: this.currentUser.id,
        institution: this.currentInstitution,

        comment: this.formGroup.value.comment,
        destiny_cost_center: null,

        origin: this.movement.destination,
        destination: this.provider.location,
        is_service: this.movement.is_service,

        movement_type_id: SupplyingConstants.MOVEMENT_TYPE_RETURN,
        movement_state_id: SupplyingConstants.MOVEMENT_STATE_ORDER_SENT,

        main_movement_id: this.movement.id,

        correlative: 0,

        movement_detail: transactions
      };


      this.movementService.returnToProvider(this.providerReturnModule, data).subscribe(
        (successData: any) => {
          this.snackBar.open("¡Datos guardados con exito!", null, {
            duration: 4000,
          });
          this.router.navigate(['/supplying/purchase-orders/detail/' + this.code]);
        },
        (errorData) => {
          this.snackBar.open(errorData.error.message.detail, null, {
            duration: 4000,
          });
        });


    }
    else {
      this.snackBar.open("Debe retornar al menos un artículo.", null, {
        duration: 4000,
      });
    }


  }

  ngOnInit() {
    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentUser = this.userService.getCurrentUserData();

    this.detailModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/detail');
    this.providerReturnModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/return');


    this.isLoading = true;

    this.loadOrderData();
  }

}
