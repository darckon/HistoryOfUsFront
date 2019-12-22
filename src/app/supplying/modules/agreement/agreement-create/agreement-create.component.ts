import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource, MatDatepickerInputEvent, DateAdapter } from '@angular/material';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { OrderService } from 'src/app/supplying/services/order.service';
import { DatePipe } from '@angular/common';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { of, forkJoin } from 'rxjs';
import { AgreementService } from 'src/app/supplying/services/agreement.service';
import { UploadComponent } from 'src/app/core/components/upload/upload.component';

@Component({
  selector: 'app-agreement-create',
  templateUrl: './agreement-create.component.html',
  styleUrls: ['./agreement-create.component.scss']
})
export class AgreementCreateComponent implements OnInit {

  @ViewChild(UploadComponent, { static: false }) uploadComponent: UploadComponent;

  events: string[] = [];
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  costcenterFormgroup: FormGroup;
  isLoading: boolean = true;
  dataLoaded: boolean = false;

  licitations: any[] = [];
  agreementTypes: any[] = [];
  warrantyTypes: any[] = [];
  bankTypes: any[] = [];
  resolutionApprovalTypes: any[] = [];
  formGroup: FormGroup;
  ocFormGroup: FormGroup;
  agreementCategories: any[] = [];
  contractEndingTypes: any[] = [];
  documents: any[] = [];
  tax: any[] = [];

  recipientList: any[] = [];
  recipientsFormGroup: FormGroup;
  articleFormGroup: FormGroup;
  displayedColumns: string[] = ['article_code', 'article_name', 'quantity', 'unit_value', 'unit_value_tax', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  articleList: any[] = [];
  resolutionApprovalNumbers: any[] = [];
  agrAmount:Number = 0
  finalDate:any = null;
  taxDefault:any = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private agreementService: AgreementService,
    private datePipe: DatePipe,
    private _adapter: DateAdapter<any>
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();
    this._adapter.setLocale('fr');

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/create');

    this.isLoading = true;
    var tasks$ = [];
    tasks$.push(this.agreementService.getLicitations());
    tasks$.push(this.agreementService.getAgreementTypes());
    tasks$.push(this.agreementService.getWarrantyTypes());
    tasks$.push(this.agreementService.getBanksTypes());
    tasks$.push(this.agreementService.getResolutionApproval());
    tasks$.push(this.agreementService.getCategories());
    tasks$.push(this.agreementService.getContractEndingTypes());
    tasks$.push(this.agreementService.getResolutionApprovalNumbers());
    tasks$.push(this.agreementService.getTax());


    this.recipientsFormGroup = this.fb.group({
      recipient: [null, Validators.required],
    });


    this.ocFormGroup = this.fb.group({
      oc: [null, null],
    });

    this.articleFormGroup = this.fb.group({
      article: ["", Validators.required],
      quantityInput: [1, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      unit_value: [0, [Validators.min(0), Validators.pattern("^[0-9]*$")]],
      comment: [null, null],
    });

    forkJoin(...tasks$).subscribe(
      (results: any) => {

        this.licitations = results[0].data.results;
        this.agreementTypes = results[1].data.results;
        this.warrantyTypes = results[2].data.results;
        this.bankTypes = results[3].data.results;
        this.resolutionApprovalTypes = results[4].data.results;
        this.agreementCategories = results[5].data.results;
        this.contractEndingTypes = results[6].data.results;
        this.resolutionApprovalNumbers = results[7].data.results;
        this.tax = results[8].data.results;

        this.formGroup = this.fb.group({
          licitation: [null, Validators.required],
          agreement_type: [null, Validators.required],
          agreement_category: [null, Validators.required],
          name: [null, Validators.required],
          amount: [0, Validators.required],
          init_date: [false, Validators.required],
          n_month: [null, Validators.required],
          observations: [false, Validators.required],
          tax_category: [1, Validators.required],


          provider: [null, Validators.required],

          bank: [null, Validators.required],
          warranty_type: [null, Validators.required],
          warranty_type_date: [null, Validators.required],
          warranty_amount: [null, Validators.required],
          warranty_uf: [false, Validators.required],
          warranty_code: [null, Validators.required],

          res_number_base: [null, Validators.required],
          res_number_base_date: [null, Validators.required],

          res_number_adjudication: [null, Validators.required],
          res_number_adjudication_date: [null, Validators.required],

          res_approve: [null, Validators.required],
          res_approve_date: [null, Validators.required],
          res_approve_comment: [null, Validators.required],
          res_approve_code: [null, Validators.required],

          tech_ref: [null, Validators.required],
          buy_supervisor: [null, Validators.required],
          subdirector: [null, Validators.required],

          cost_center: [null, Validators.required],

        })

        this.isLoading = false;
        this.dataLoaded = true;
      },
      (error) => {
        this.isLoading = false;
        this.dataLoaded = false;
      });

  }

  add(array: any[], formarray: FormGroup) {

    if (!array.find(x => x == formarray.value.recipient)) {
      array.push(formarray.value.recipient);
      formarray.reset();
    }
    else {
      this.snackBar.open("Ya existe ese destinatario.", null, {
        duration: 4000,
      });
    }

  }

  remove(array: any[], elementToRemove: any) {
    let index = array.findIndex(x => x == elementToRemove);
    if (index != -1) {
      if (array.length == 1) {
        array = array.pop();
      }
      else {
        array.splice(index, 1);
      }

    }
  }

  addArticle() {

    let article = this.articleList.find(x => x.article == this.articleFormGroup.value.article.id);


    if (!article) {

      let articleValue = this.articleFormGroup.value.article;
      this.articleList.push({
        article: articleValue.id,
        article_code: articleValue.code,
        article_name: articleValue.name,
        quantity: parseInt(this.articleFormGroup.value.quantityInput),
        unit_value: parseInt(this.articleFormGroup.value.unit_value),
        comment: this.articleFormGroup.value.comment
      });

      this.articleFormGroup.get('article').setValue("");
      this.articleFormGroup.get('quantityInput').setValue("");
      this.articleFormGroup.get('unit_value').setValue("");
      this.articleFormGroup.get('comment').setValue("");

      this.dataSource = new MatTableDataSource<any>(this.articleList);
    }
    else {
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }

    this.agreementAmount();
  }
  
  removeArticle(ind: number) {
    this.articleList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<any>(this.articleList);

    this.agreementAmount();
  }

  agreementAmount() {
    let id = this.formGroup.value.tax_category;
    let value = 0;
    for (let i in this.articleList) {
      const total_value = this.articleList[i].unit_value * this.articleList[i].quantity;
      value = value + total_value;
    }

    if (id == SupplyingConstants.TAX_CATEGORY_EXENT) {
      this.agrAmount = value;
    } else if (id == SupplyingConstants.TAX_CATEGORY_IVA) {
      this.agrAmount = value + (value * 0.19);
    } else if (id == SupplyingConstants.TAX_CATEGORY_10) {
      this.agrAmount = (value / 0.90);
    }

    this.formGroup.get('amount').setValue(this.agrAmount);
  }

  clearForm(): void {

    this.formGroup.reset();
    this.recipientsFormGroup.reset();
    this.articleFormGroup.reset();

    this.recipientList = [];
  }

  addOc(oc: any) {

    if (!this.documents.find(x => x.id == oc.id))
      this.documents.push(oc);
    this.ocFormGroup.reset();
  }

  removeOc(index: any) {
    this.documents.splice(index, 1);
    this.dataSource = new MatTableDataSource<any>(this.documents);
  }

  calculateDate(){
    
    if(this.formGroup.value.init_date == null || this.formGroup.value.n_month == null ){
      this.finalDate = null;
    }else if( this.formGroup.value.n_month == 0){
      this.finalDate = this.datePipe.transform(this.formGroup.value.init_date,'dd/MM/yyyy')
    }else{
      let init_date = new Date(this.datePipe.transform(this.formGroup.value.init_date,'yyyy-MM-dd'));
      let month:number = init_date.getMonth();
      let nMonth:number = parseInt(this.formGroup.value.n_month);
      let totalMonth = (nMonth) + (month);
      this.finalDate = this.datePipe.transform(init_date.setMonth(totalMonth),'dd/MM/yyyy');
    }

  }

  send() {
    if (this.formGroup.valid) {

      this.isLoading = true;
      
      let articles_services = this.articleList.map(
        (aux) => {
          return {
            "id": aux.article,
            "unit_value": aux.unit_value,
            "quantity": aux.quantity,
            "comment": aux.comment
          }
        }
      );


      let detail =
      {
        "provider_id": this.formGroup.value.provider.id,
        "technical_reference_id": this.formGroup.value.tech_ref.id,
        "purchase_supervisor_id": this.formGroup.value.tech_ref.id,
        "vice_principal_id": this.formGroup.value.subdirector.id,
        "cost_center_id": this.formGroup.value.cost_center.id,
      };


      let recipents: string = "";
      this.recipientList.map(
        (recipent) => {
          recipents += recipent + ";";
        }
      )

      let comment = (this.formGroup.value.observations) ? this.formGroup.value.observations : "";

      let data =
      {
        "institution_id": this.currentInstitution,
        "name": this.formGroup.value.name,
        "bidding_id": this.formGroup.value.licitation.id,
        "category_id": this.formGroup.value.agreement_category.id,

        "warranty_detail": {
          "warranty_type_id": this.formGroup.value.warranty_type.id,
          "bank_id": this.formGroup.value.bank.id,
          "code": this.formGroup.value.warranty_code,
          "expiration_date": this.datePipe.transform(this.formGroup.value.warranty_type_date, 'yyyy-MM-dd'),
          "amount": this.formGroup.value.warranty_amount,
          "is_uf": this.formGroup.value.warranty_uf
        },

        "base_resolution_number": this.formGroup.value.res_number_base,
        "base_resolution_date": this.datePipe.transform(this.formGroup.value.res_number_base_date, 'yyyy-MM-dd'),

        "adjudicated_resolution_number": this.formGroup.value.res_number_adjudication,
        "adjudicated_resolution_date": this.datePipe.transform(this.formGroup.value.res_number_adjudication_date, 'yyyy-MM-dd'),

        "base_resolution_approval_number":
        {
          "base_resolution_approval_number_id": this.formGroup.value.res_approve.id,
          "comment": this.formGroup.value.res_approve_comment,
          "resolution_code": this.formGroup.value.res_approve_code,
          "resolution_date": this.datePipe.transform(this.formGroup.value.res_approve_date, 'yyyy-MM-dd')
        },
        "date_start": this.datePipe.transform(this.formGroup.value.init_date, 'yyyy-MM-dd'),
        "n_month": this.formGroup.value.n_month,

        "articles_services": articles_services,
        "amount": this.formGroup.value.amount,
        "recipent": recipents,
        "comment": comment,
        "tax":this.formGroup.value.tax_category,

        "documents": this.documents.map(x => x.id),
        "type_id": this.formGroup.value.agreement_type.id,
        "detail": detail,
        "attached": this.uploadComponent.Files,
        "user_id": this.currentUser.id,
      }


      this.agreementService.create(data, this.currentModule).subscribe(
        (result) => {
          this.isLoading = false;
          this.snackBar.open("Convenio creado con exito", null, {
            duration: 4000,
          });
          this.router.navigateByUrl('/supplying/agreements');
        },
        (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error.message.detail, null, {
            duration: 4000,
          });
        });

    }
    else {
      this.snackBar.open("Por favor revise el formulario.", null, {
        duration: 4000,
      });
    }
  }

}
