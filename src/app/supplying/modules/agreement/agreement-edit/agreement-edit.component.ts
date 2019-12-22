import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { OrderService } from 'src/app/supplying/services/order.service';
import { DatePipe } from '@angular/common';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { of, forkJoin } from 'rxjs';
import { AgreementService } from 'src/app/supplying/services/agreement.service';
import { UploadComponent } from 'src/app/core/components/upload/upload.component';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-agreement-edit',
  templateUrl: './agreement-edit.component.html',
  styleUrls: ['./agreement-edit.component.scss']
})
export class AgreementEditComponent implements OnInit {

  @ViewChild(UploadComponent, { static: false }) uploadComponent: UploadComponent;

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
  agreementId: any = null;
  agreementData: any = null;
  editMode: boolean = false;
  ocFormGroup: FormGroup;
  agrAmount:Number = 0;
  finalDate:any = null;

  
  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private agreementService: AgreementService,
    private datePipe: DatePipe
  ) { }
  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/edit');

    this.route.paramMap.subscribe((success: any) => {
      this.agreementId = success.params.id;
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
      tasks$.push(this.agreementService.detail(this.currentModule, this.agreementId));
      tasks$.push(this.agreementService.getTax());

      this.ocFormGroup = this.fb.group({
        oc: [null, null],
      });

      this.recipientsFormGroup = this.fb.group({
        recipient: [null, Validators.required],
      });

      this.articleFormGroup = this.fb.group({
        article: ["", Validators.required],
        quantityInput: [1, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
        unit_value: [0, [Validators.min(0), Validators.pattern("^[0-9]*$")]],
        comment: [null, null],
      });

      forkJoin(...tasks$).subscribe(
        (results: any) => {
          this.agreementData = results[8].data;
          this.licitations = results[0].data.results;
          this.agreementTypes = results[1].data.results;
          this.warrantyTypes = results[2].data.results;
          this.bankTypes = results[3].data.results;
          this.resolutionApprovalTypes = results[4].data.results;
          this.agreementCategories = results[5].data.results;
          this.contractEndingTypes = results[6].data.results;
          this.resolutionApprovalNumbers = results[7].data.results;
          this.tax = results[9].data.results;

          
          if(this.agreementData.date_start == null || this.agreementData.n_month == null ){
            this.finalDate = null;
          }else if( this.agreementData.n_month == 0){
            this.finalDate = this.datePipe.transform(this.agreementData.date_start,'dd/MM/yyyy')
          }else{
            let init_date = new Date(this.datePipe.transform(this.agreementData.date_start,'yyyy-MM-dd'));
            let month:number = init_date.getMonth();
            let nMonth:number = parseInt(this.agreementData.n_month);
            let totalMonth = (nMonth) + (month);
            this.finalDate = this.datePipe.transform(init_date.setMonth(totalMonth),'dd/MM/yyyy');
          }
          
          console.error("=========");
          if (this.agreementData.recipent != "" && this.agreementData.recipent != null)
            this.recipientList = (this.agreementData.recipent as string).split(";").filter(x => x != "");

          console.log(this.recipientList);
          console.error("=========")

          this.formGroup = this.fb.group({
            licitation: [(this.agreementData.bidding) ? (this.agreementData.bidding) : null, Validators.required],
            agreement_type: [(this.agreementData.agreement_type) ? this.agreementTypes.find(x => this.agreementData.agreement_type == x.id) : null, Validators.required],
            agreement_category: [(this.agreementData.category) ? this.agreementCategories.find(x => this.agreementData.category.id == x.id) : null, Validators.required],
            name: [(this.agreementData.name) ? this.agreementData.name : null, Validators.required],
            amount: [(this.agreementData.amount) ? this.agreementData.amount : null, Validators.required],
            excent: [("is_exempt" in this.agreementData) ? this.agreementData.is_exempt : null, Validators.required],
            init_date: [(this.agreementData.date_start) ? this.datePipe.transform(this.agreementData.date_start, 'yyyy-MM-ddTHH:mm:ss') : null, Validators.required],
            n_month: [(this.agreementData.n_month) ? this.agreementData.n_month : null, Validators.required],
            contract_ending: [(this.agreementData.anticipated_term) ? this.contractEndingTypes.find(x => this.agreementData.anticipated_term.id == x.id) : null, null],
            observations: [(this.agreementData.comment) ? this.agreementData.comment : null, Validators.required],
            tax_category: [(this.agreementData.tax) ? this.tax.find(x => this.agreementData.tax.id == x.id) : null, Validators.required],

            provider: [(this.agreementData.detail[0].provider) ? (this.agreementData.detail[0].provider) : null, null],
            tech_ref: [(this.agreementData.detail[0].technical_reference) ? (this.agreementData.detail[0].technical_reference) : null, null],
            buy_supervisor: [(this.agreementData.detail[0].purchase_supervisor) ? (this.agreementData.detail[0].purchase_supervisor) : null, null],
            subdirector: [(this.agreementData.detail[0].vice_principal) ? (this.agreementData.detail[0].vice_principal) : null, null],
            cost_center: [(this.agreementData.detail[0].cost_center) ? (this.agreementData.detail[0].cost_center) : null, null],

            bank: [(this.agreementData.last_warranty_detail.bank) ? (this.bankTypes.find(x => this.agreementData.last_warranty_detail.bank.id == x.id)) : null, Validators.required],
            warranty_type: [(this.agreementData.last_warranty_detail.warranty_type) ? (this.warrantyTypes.find(x => this.agreementData.last_warranty_detail.warranty_type.id == x.id)) : null, Validators.required],
            warranty_type_date: [(this.agreementData.last_warranty_detail.expiration_date) ? ( this.datePipe.transform(this.agreementData.last_warranty_detail.expiration_date, 'yyyy-MM-ddTHH:mm:ss') ) : null, Validators.required],
            warranty_amount: [(this.agreementData.last_warranty_detail.amount) ? (this.agreementData.last_warranty_detail.amount) : null, Validators.required],
            warranty_uf: [("is_uf" in this.agreementData.last_warranty_detail) ? (this.agreementData.last_warranty_detail.is_uf) : null, Validators.required],
            warranty_code: [(this.agreementData.last_warranty_detail.code) ? (this.agreementData.last_warranty_detail.code) : null, Validators.required],

            res_number_base: [(this.agreementData.base_resolution_number) ? this.agreementData.base_resolution_number : null, Validators.required],
            res_number_base_date: [(this.agreementData.base_resolution_date) ? this.agreementData.base_resolution_date : null, Validators.required],

            res_number_adjudication: [(this.agreementData.adjudicated_resolution_number) ? this.agreementData.adjudicated_resolution_number : null, Validators.required],
            res_number_adjudication_date: [(this.agreementData.adjudicated_resolution_date) ?  this.datePipe.transform(this.agreementData.adjudicated_resolution_date, 'yyyy-MM-ddTHH:mm:ss') : null, Validators.required],

            res_approve: [(this.agreementData.last_base_resolution_approval_detail) ? this.resolutionApprovalTypes.find(x => this.agreementData.last_base_resolution_approval_detail.base_resolution_approval_number.id == x.id) : null, Validators.required],
            res_approve_date: [(this.agreementData.last_base_resolution_approval_detail) ?  this.datePipe.transform(this.agreementData.last_base_resolution_approval_detail.resolution_date, 'yyyy-MM-ddTHH:mm:ss') : null, Validators.required],
            res_approve_comment: [(this.agreementData.last_base_resolution_approval_detail) ? this.agreementData.last_base_resolution_approval_detail.comment : null, Validators.required],
            res_approve_code: [(this.agreementData.last_base_resolution_approval_detail) ? this.agreementData.last_base_resolution_approval_detail.resolution_code : null, Validators.required],


          })


          this.articleList = this.agreementData.article_service_detail.map(
            (aux: any) => {
              let artserv_id = 0;
              let artserv_code = null;
              let artserv_name = null;

              if(this.agreementData.category.choice_type == SupplyingConstants.CHOICE_TYPE_CATEGORY_SERVICE){
                  artserv_id = aux.service.id;
                  artserv_code = aux.service.code;
                  artserv_name = aux.service.name;
              }else{
                  artserv_id = aux.article.id;
                  artserv_code = aux.article.code;
                  artserv_name = aux.article.name;
              }

              return {
                article: artserv_id,
                article_code: artserv_code,
                article_name: artserv_name,
                unit_value: aux.unit_value,
                comment: aux.comment,
                quantity: aux.quantity,
                service: aux.service
              };
            }

           
          );

          this.documents = this.agreementData.document;


          if (this.articleList.length > 0) {
            this.dataSource = new MatTableDataSource<any>(this.articleList);

            let value = 0;
            for (let i in this.articleList) {
              const total_value = this.articleList[i].unit_value * this.articleList[i].quantity;
              value = value +total_value;
            }

            if (this.agreementData.tax.id == SupplyingConstants.TAX_CATEGORY_EXENT) {
              this.agrAmount = value;
            } else if (this.agreementData.tax.id == SupplyingConstants.TAX_CATEGORY_IVA) {
              this.agrAmount = value + (value * 0.19);
            } else if (this.agreementData.tax.id == SupplyingConstants.TAX_CATEGORY_10) {
              this.agrAmount = (value / 0.90);
            }
            
            this.formGroup.get('amount').setValue(this.agrAmount);
          }

          this.agreementData.files = this.agreementData.files.map(
            (filedata) => {
              filedata.path_url = environment.backend_url + '/' + environment.media_path + '/' + filedata.path_url;
              return filedata;
            }
          )

          this.formGroup.disable();
          this.articleFormGroup.disable();
          this.isLoading = false;
          this.dataLoaded = true;
        },
        (error) => {

          this.isLoading = false;
          this.dataLoaded = false;
        });

    },
      (error) => {
        this.isLoading = false;
        this.dataLoaded = false;
      });
  }

  activeEditMode() {
    (this.editMode == false) ? this.editMode = true : this.editMode = false;
    if (this.editMode == true) {
      this.formGroup.enable();
      this.articleFormGroup.enable();
    }
    else {
      this.formGroup.disable();
      this.articleFormGroup.disable();
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
    if (this.editMode) {
      this.articleList.splice(ind, 1);
      this.dataSource = new MatTableDataSource<any>(this.articleList);
    }

    let value = 0;
    for (let i in this.articleList) {
      const total_value = this.articleList[i].unit_value * this.articleList[i].quantity;
      value = value + total_value;
    }

    this.agreementAmount();
  }

  agreementAmount() {
    let id = this.formGroup.value.tax_category.id;
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


  addOc(oc: any) {

    if (!this.documents.find(x => x.id == oc.id))
      this.documents.push(oc);
    this.ocFormGroup.reset();
  }

  removeOc(index: any) {
    this.documents.splice(index, 1);
    this.dataSource = new MatTableDataSource<any>(this.documents);
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
          console.log(aux);
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
        "provider_id": (this.formGroup.value.provider) ? this.formGroup.value.provider.id : null,
        "technical_reference_id": (this.formGroup.value.tech_ref) ? this.formGroup.value.tech_ref.id : null,
        "purchase_supervisor_id": (this.formGroup.value.buy_supervisor) ? this.formGroup.value.buy_supervisor.id : null,
        "vice_principal_id": (this.formGroup.value.subdirector) ? this.formGroup.value.subdirector.id : null,
        "cost_center_id": (this.formGroup.value.cost_center) ? this.formGroup.value.cost_center.id : null,
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
        "name": this.formGroup.value.name.toUpperCase(),
        "bidding_id": this.formGroup.value.licitation.id,
        "category_id": this.formGroup.value.agreement_category.id,

        "anticipated_term_id": (this.formGroup.value.contract_ending) ? this.formGroup.value.contract_ending.id : null,

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
          "comment": this.formGroup.value.res_approve_comment.toUpperCase(),
          "resolution_code": this.formGroup.value.res_approve_code,
          "resolution_date": this.datePipe.transform(this.formGroup.value.res_approve_date, 'yyyy-MM-dd')
        },

        "date_start": this.datePipe.transform(this.formGroup.value.init_date, 'yyyy-MM-dd'),
        "n_month": this.formGroup.value.n_month,
        "comment": comment.toUpperCase(),

        "articles_services": articles_services,
        "amount": this.formGroup.value.amount,
        "recipent": recipents,

        "documents": this.documents.map(x => x.id),
        "type_id": this.formGroup.value.agreement_type.id,
        "detail": detail,
        "tax_id": this.formGroup.value.tax_category.id
      }


      this.agreementService.patch(data, this.currentModule, this.agreementId).subscribe(
        (result) => {
          this.isLoading = false;
          this.snackBar.open("Convenio editado con exito", null, {
            duration: 4000,
          });
          this.router.navigateByUrl('/supplying/agreements');
        },
        (error) => {
          this.isLoading = false;
          this.snackBar.open(error.error.message.detail, null, {
            duration: 4000,
          });
          console.error(error);
        });

      console.log(data);
    }
    else {
      this.snackBar.open("Por favor revise el formulario.", null, {
        duration: 4000,
      });
    }
  }

}
