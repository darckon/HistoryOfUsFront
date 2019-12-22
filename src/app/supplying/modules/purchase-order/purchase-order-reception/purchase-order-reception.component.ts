import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService } from '../../../services/movement.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { environment } from '../../../../../environments/environment';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { DetailArticleRowElement } from '../../purchase-order/purchase-order/purchase-order.component';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { AgreementService } from 'src/app/supplying/services/agreement.service';

import { forkJoin } from 'rxjs';
import { ArticlesService } from '../../../services/articles.service';
import { UploadComponent } from 'src/app/core/components/upload/upload.component';

@Component({
  selector: 'app-purchase-order-reception',
  templateUrl: './purchase-order-reception.component.html',
  styleUrls: ['./purchase-order-reception.component.scss']
})
export class PurchaseOrderReceptionComponent implements OnInit {


  @ViewChild(UploadComponent, { static: false }) uploadComponent:UploadComponent;

  canRecept: boolean = true;
  currentModule: ModuleInfo = null;
  purchaseOrderModule: ModuleInfo = null;

  code: string = "";
  isLoading: boolean = false;
  currentProfileData: any;

  movement: any = {};
  document: any = null;
  provider: any = null;
  locations: any[] = [];
  transactions: any[] = [];

  currentUser: any;
  currentLocation: any;
  currentInstitution: number = null;

  articles: any[] = [];
  services: any[] = [];
  articlesHistory: any[] = [];

  localMovementStates: any[] = [];
  documentTypes: any[] = [];
  intermeditationTypes: any[] = [];

  today: Date = new Date();

  detailServiceDataSource = new MatTableDataSource<DetailArticleRowElement>([]);
  detailHistoricArticleDataSource = new MatTableDataSource<DetailArticleRowElement>([]);

  detailDisplayedColumns: string[] = ['id', 'name', 'charge', 'discount', 'provider_product_code', 'quantity', 'subtotal', 'tax_amount', 'unit_value'];
  detailHistoricArticleDisplayerColumns: string[] = ['provider_product_code', 'name', 'quantity'];

  transaction: any[];

  serviceElementCount: number = 0;

  receptionFormGroup: FormGroup;
  articleGroups: FormArray;
  isService: boolean;
  activeToggles: number = 0;
  total: number = 0;

  withIva: boolean = false;
  dataLoaded:boolean = false;
  //Tax OC
  iva_percentage: any = null;
  tax_name: any = null;
  tax: any = null;
  total_oc:any = null;
  charge:any = null;
  discount:any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private articleService: ArticlesService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private agreementService: AgreementService


  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentLocation = this.userService.getCurrentLocations();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();


    this.currentModule       = this.moduleManagerService.getModuleByInternalUrl("supplying/purchase-orders/recept");
    this.purchaseOrderModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/detail');



    this.isLoading = true;
    this.canRecept = true;

    this.route.paramMap.subscribe(
      (success: any) => {
        this.code = success.params.code;

        this.movementService.detail(this.purchaseOrderModule, this.code).subscribe(
          (successData: any) => {
            if (successData.data.count == 1) {

              this.movement = successData.data.results[0];
              this.document = this.movement.document[0].document;
              this.provider = this.movement.document[0].provider;
              this.articles = this.movement.detail_article;
              this.services = this.movement.detail_service;
              

              this.isService = this.purchaseOrderIsService();
              console.log('jojojo' )
              console.log(this.currentLocation )
              if (this.isService) {
                this.locations = (this.currentLocation as []).filter((x: any) => x.type.id == environment.LOCATION_TYPE_COST_CENTER)
              }
              else {
              this.provider = this.movement.document[0].provider;
                this.locations = (this.currentLocation as []).filter((x: any) => x.type.id != environment.LOCATION_TYPE_COST_CENTER && x.receive_from_provider == true)
              }

              //this.locations = this.locations.filter((x: any) => x.institution.id == this.currentInstitution);


              let serviceType = (this.isService == true) ? "SERVICE" : "ARTICLE";

              var tasks$ = [];
              tasks$.push(this.movementService.movementStates());
              tasks$.push(this.movementService.documentType());
              tasks$.push(this.movementService.intermeditationTypes());
              tasks$.push(this.movementService.getOrderDebts(this.movement.id, serviceType));
              tasks$.push(this.movementService.articleTransactions(this.movement.id));
              let firstArticle = null;
              if (this.articles.length > 0) {
                console.log('soy mayoerjk jekje');
                console.log(this.articles)
                firstArticle = this.articles[0];
                tasks$.push(this.articleService.getArticle(firstArticle.article_id));
              }
              tasks$.push(this.agreementService.getTax());


              forkJoin(...tasks$).subscribe(
                (results) => {

                  let movementStates = results[0].data.filter((type: any) => !type.public_market_code);
                  let debtsData      = results[3].data;
                
                  if(debtsData.status == false)
                  {
                    console.error("GO!!");
                    this.dataLoaded = false;
                    this.isLoading = false;
                    return;
                  }


                  movementStates.map(
                    (status) => {

     
                      let searchType = status.movement_type_state.find(
                        (type_state) => {
                          return (type_state.movement_type == this.movement.movement_type.id && type_state.is_final == true)
                        }
                      );

                      if (searchType) {
                        this.localMovementStates.push(status);
                      }
                    }
                  );

                  console.log(results[0].data);
                  console.log(this.localMovementStates);


                  
                  
                  console.error("=========");
                  console.log(debtsData);
                  console.error("=========");

                  debtsData.map(
                    (article) => {
                      let articleId = article.article_id;
                      let ind = this.articles.findIndex((x) => x.article_id == articleId);
                      if (ind != -1) {
                        this.articles[ind].debt = article.debt;
                        this.articles[ind].requested = article.requested;
                      }
                    }
                  );

                  this.documentTypes = results[1].data.results.filter((x) => x.id != 1);
                  this.intermeditationTypes = results[2].data.results;
                  if (this.articles.length > 0) {
                  this.tax = results[6].data.results;
                  }else{
                    this.tax = results[5].data.results;

                  }
                  this.tax = this.tax.find(x => this.document.tax.id == x.id);
                  this.tax_name = this.tax.name;

               

                  this.activeToggles = 1;
                  this.articleGroups = this.fb.array(this.getArticleControls().map(article => this.fb.group(article)));
                  for (let control of this.articleGroups.controls) {
                    if (control instanceof FormGroup) {
                      control.get('is_active').valueChanges.subscribe(
                        (value) => {
                          let counter = 0;
                          this.activeToggles = 0;
                          for (let control of this.articleGroups.controls) {
                            if (control instanceof FormGroup) {
                              let is_active = control.get('is_active').value;
                              if (is_active == true) {
                                control.get('quantity').enable();
                                control.get('batchs').enable()
                                this.activeToggles = this.activeToggles + 1;
                              }
                              else {
                                control.get('quantity').disable();
                                control.get('batchs').disable();
                              }

                              counter = counter + 1;
                            }
                          }
                          this.recalculateTotal();
                        }
                      );
                    }
                  }
                  this.receptionFormGroup = this.fb.group({
                    document_type: [null, Validators.required],
                    destination: [null, Validators.required],
                    intermediator: [null, null],
                    reception_date: [null, Validators.required],
                    amount: [{ value: '0', disabled: true }, [Validators.min(1), Validators.pattern("^[0-9]*$")]],
                    document_code: [null, Validators.required],
                    document_comment: [null, null],
                    articles: this.articleGroups
                  });
                  this.recalculateArticlesQuantityTotals();

                  this.articlesHistory = this.articles.filter(
                    (article) => {
                      return article.debt == 0;
                    }
                  );

                  let articleListAux = this.articles.filter(
                    (article) => {return article.debt>0 }
                  )
                  this.articles = articleListAux;

                  this.detailHistoricArticleDataSource = new MatTableDataSource<DetailArticleRowElement>(this.articlesHistory);
                  this.transactions = results[4].data.results;

                  if (firstArticle && this.isService == false) {
                    let articleLocations: any[] = (results[5].data.locations as []).map((x: any) => x.location.id)

                    let auxRealLocs = [];
                    this.locations.map(
                      (location) => {
                        let loc = articleLocations.find(x => location.id == x);
                        if (loc)
                          auxRealLocs.push(location);
                      }
                    );
                    this.locations = auxRealLocs;
                    if (this.locations.length == 0)
                      this.canRecept = false;
                  }
                  this.dataLoaded = true;
                },
                (errors) => {
                  this.dataLoaded = false;
                },
                () => {
                  this.isLoading = false;
                  this.recalculateTotal();
                }
              );

              this.serviceElementCount = this.services.length;
              if (this.serviceElementCount > 0)
                this.detailServiceDataSource = new MatTableDataSource<DetailArticleRowElement>(this.services);
              else
                this.detailServiceDataSource = null;
            }
          });
      });

  }


  getArticleControls(): any[] {
    let articleControlArray = [];


    for (let i = 0; i < this.articles.length; i++) {

      console.log(this.articles[i]);
      if (this.articles[i].debt > 0) {

        

        let expirationDateValidator = null;
        if (this.articles[i].article_is_perishable == true)
          expirationDateValidator = Validators.required;

        let newControl = this.fb.group(
          {
            quantity: [this.articles[i].debt, [Validators.required, Validators.min(1), Validators.max(this.articles[i].debt), Validators.pattern("^[0-9]*$")]],
            batch: ['', Validators.required],
            n_serie: ['', Validators.required],
            expiration_date: ['', expirationDateValidator]
          }
        );
        let batchs: FormArray = this.fb.array([newControl]);

        let expected = { debt: this.articles[i].debt, quantity: this.articles[i].quantity };
        articleControlArray.push({
          article_id: [{ value: this.articles[i].article_id, disabled: true }, Validators.required],
          article_code: [{ value: this.articles[i].article_code, disabled: true }, Validators.required],
          article_name: [{ value: this.articles[i].article_name, disabled: true }, Validators.required],
          quantity: [{ value: this.articles[i].debt, disabled: false }, [Validators.required, Validators.min(1), Validators.max(this.articles[i].debt), Validators.pattern("^[0-9]*$")]],
          expected_quantity: [{ value: expected, disabled: true }, null],
          unit_value: [{ value: this.articles[i].unit_value, disabled: true }, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
          subtotal: [{ value: this.articles[i].subtotal, disabled: true }, Validators.required],
          tax_amount: [{value:this.articles[i].tax_amount, disabled:true}, Validators.required],
          discount: [{value:this.articles[i].discount, disabled:true}, Validators.required],
          charge: [{value:this.articles[i].charge, disabled:true}, Validators.required],
          is_active: [true, Validators.required],
          batchs: batchs
        });

        batchs.valueChanges.subscribe(values => {
          this.recalculateArticlesQuantityTotals();
        });

      }
    }


    console.error("=============");
    console.log(articleControlArray);
    console.error("=============");


    return articleControlArray;
  }

  recalculateArticlesQuantityTotals() {

    for (let articleControl of this.articleGroups.controls) {
      let quantity: FormControl = articleControl.get('quantity') as FormControl;
      let discount: FormControl = articleControl.get('discount') as FormControl;
      let tax_amount: FormControl = articleControl.get('tax_amount') as FormControl;
      let charge: FormControl = articleControl.get('charge') as FormControl;
      let unit_value: FormControl = articleControl.get('unit_value') as FormControl;
      let expected_quantity: FormControl = articleControl.get('expected_quantity') as FormControl;
      let batchsControl: FormArray = articleControl.get('batchs') as FormArray;
      let subtotal: FormControl = articleControl.get('subtotal') as FormControl;

      let sumDiscount =  (this.convertNull(discount.value)/ parseInt(expected_quantity.value.quantity)) * parseInt(quantity.value);
      let sumCharge = (this.convertNull(charge.value)/ parseInt(expected_quantity.value.quantity)) * parseInt(quantity.value);
      let sumTaxAmount = (this.convertNull(tax_amount.value)/ parseInt(expected_quantity.value.quantity)) * parseInt(quantity.value);
      let sum = parseInt(quantity.value) * parseInt(unit_value.value) ;

      let subtotalArt = sum + sumCharge + sumTaxAmount - sumDiscount;
      let summed = batchsControl.value.reduce((a, b) => parseInt(a) + parseInt(b.quantity), 0);
      quantity.setValue(summed);
      subtotal.setValue(subtotalArt);
    }

  }



  return() {
    this.router.navigate(['/supplying/purchase-order-detail/' + this.code]);
  }

  convertNull(value){
    if (value == null){
      value = 0;
    }else{
      value =  value;
    }
    return value;
  }

  purchaseOrderIsService() {

    let countServices = this.services.length;
    if (countServices > 0) {
      return true;
    }
    return false;
  }

  addBatch(article: FormGroup, articleIndex: number) {

    let expirationDateValidator = null;
    if (this.articles[articleIndex].article_is_perishable == true)
      expirationDateValidator = Validators.required;

    let batchs: FormArray = this.articleGroups.controls[articleIndex].get('batchs') as FormArray;

    let newControl = this.fb.group(
      {
        quantity: [this.articles[articleIndex].debt, [Validators.required, Validators.min(1), Validators.max(this.articles[articleIndex].debt), Validators.pattern("^[0-9]*$")]],
        batch: ['', Validators.required],
        n_serie: ['', Validators.required],
        expiration_date: ['', expirationDateValidator],
      }
    );
    batchs.push(newControl);

  }

  removeBatch(index: number, batchs: FormArray) {
    batchs.removeAt(index);
  }

  sendOc() {

    if (!this.receptionFormGroup.invalid) {
      let destination = this.receptionFormGroup.value.destination;
      let document_type = this.receptionFormGroup.value.document_type;
      
      
      let reception_date = this.receptionFormGroup.value.reception_date;
      let intermed = (this.receptionFormGroup.value.intermediator) ? this.receptionFormGroup.value.intermediator : null;
      let document_code = this.receptionFormGroup.value.document_code;
      let document_comment = this.receptionFormGroup.value.document_comment;

      let iSDestinyCostCenter = (destination == environment.LOCATION_TYPE_COST_CENTER) ? true : false;
      let institution = this.currentInstitution as number;

      let date_reception = (typeof reception_date.toISOString !== "undefined") ? reception_date.toISOString().slice(0, 10) : null;
      this.recalculateTotal();
      let document =
      {
        document_id: this.movement.document[0].document.id,
        code: document_code,
        document_type: document_type,
        institution: institution,
        date_reception: date_reception,
        comment: document_comment,
        purchase_amount: this.total,
      }

      let history = {
        user: this.currentUser.id
      }

      this.transaction = [];

      if (!this.isService) {
        this.receptionFormGroup.value.articles.map(
          (article, index: number) => {

            if (article.is_active == true) {

              let articleBatchs: any[] = this.receptionFormGroup.get('articles').value[index].batchs as [];

              articleBatchs.map(
                (batch) => {

                  let expDate = (batch.expiration_date == "") ? null : batch.expiration_date;
                  this.transaction.push(
                    {
                      article: this.articles[index].article_id,
                      quantity: parseInt(batch.quantity),
                      subtotal: parseInt(batch.quantity) * parseInt(this.articles[index].unit_value),
                      unit_value: parseInt(this.articles[index].unit_value),
                      expiration_date: expDate,
                      batch: batch.batch,
                      n_serie: batch.n_serie
                    }
                  );

                }
              );
            }
          }
        );
      }
      else {
        this.services.map(
          (service) => {
            this.transaction.push(
              {
                service: service.service_id,
                quantity: service.quantity,
                subtotal: service.quantity * service.unit_value,
                unit_value: parseInt(service.unit_value),
                expiration_date: null,
                batch: null,
                n_serie: null
              }
            )
          }
        );
      }

      let sendData =
      {
        movement: this.movement.id,
        destiny_cost_center: iSDestinyCostCenter,
        origin: this.provider.run,
        destination: destination,
        provider: this.provider.id,
        is_service: this.isService,
        document: [document],
        history: [history],
        intermediator: intermed,
        transaction: this.transaction,
        quantity: 1,

      };

      let fullData = { data: sendData, module: this.currentModule, code: this.code, isService: this.isService, files: this.uploadComponent.Files }

      this.openDialog(fullData);
    }
    else {
      this.snackBar.open("Revise los campos del formulario para poder enviar", null, {
        duration: 4000,
      });
    }
  }

  openDialog(data: any): void {
    const dialogRef = this.dialog.open(DialogOrderReceptionDialog, {
      width: '450px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.snackBar.open("¡Datos guardados con exito!", null, {
          duration: 4000,
        });
        this.router.navigate(['supplying/purchase-orders/detail/' + this.code]);
      }

    });
  }

  recalculateTotal() {

    let sum = 0;
    let sumCharge = 0;
    let sumDiscount = 0;
    if (this.isService == false) {
      this.receptionFormGroup.value.articles.map(
        (article, index: number) => {
          if (article.is_active == true) {
            sumCharge =  (this.document.purchase_charge/ parseInt(this.articles[index].quantity)) * parseInt(article.quantity);
            sumDiscount = (this.document.purchase_discount/ parseInt(this.articles[index].quantity)) * parseInt(article.quantity);
            sum = sum + parseInt(article.quantity) * parseInt(this.articles[index].unit_value) ;

          }

        });
    }
    else {
      this.services.map(
        (service) => {
          sum = sum + service.subtotal;
        }
      )
    }
    this.total = sum ;
    this.charge = sumCharge;
    this.discount = sumDiscount;
    this.total_oc = this.total;
    this.recalculateArticlesQuantityTotals();
  }

}


export interface PurchaseOrderReceptionDialogData {
  data: any;
  code: any,
  module: any;
  isService: boolean;
}

@Component({
  selector: 'purchase-order-reception-dialog',
  templateUrl: './purchase-order-reception-dialog.html',
})
export class DialogOrderReceptionDialog {

  loading: boolean = false;
  dataSent: boolean = false;
  success: boolean = false;
  msg: string = "";

  constructor(
    public dialogRef: MatDialogRef<DialogOrderReceptionDialog>,
    private purchaseOrderService: MovementService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  async accept() {
    this.loading = true;
    this.dataSent = false;
    let data = this.data.data;
    let files = this.data.files;
    let currentModule = this.data.module;

    data.attached = files;

    this.purchaseOrderService.purchaseOrderReception(currentModule,data).subscribe(
      (successData:any) => {
       
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
