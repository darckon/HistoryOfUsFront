import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
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
  selector: 'app-agreement-detail',
  templateUrl: './agreement-detail.component.html',
  styleUrls: ['./agreement-detail.component.scss']
})
export class AgreementDetailComponent implements OnInit {

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
  agreementId: any = null;
  agreementData: any = null;
  articleList: any[] = [];
  resolutionApprovalNumbers: any[] = [];
  tax: any[] = [];

  totalAmount: number = 0;

  agreementType: any;
  agreementCategory: any;
  licitation: any;
  bank: any;
  warrantyType: any;
  resApprove: any;
  recipientList: any[] = [];
  documents: any[] = [];
  displayedColumns: string[] = ['article_code', 'article_name', 'quantity', 'unit_value', 'amount', 'quantity_recept', 'unit_value_recept'];
  fineDisplayedColumns: string[] = ['amount', 'fine_state', 'discharge_date', 'resolution_date', 'actions'];

  dataSource = new MatTableDataSource<any>([]);
  fines: any[] = [];
  finesDataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  pageNumber: any;
  isLoadingFineData: boolean = false;
  fineCreatePrevilege: ModuleInfo;
  fineEditPrevilege: ModuleInfo;
  finalDate:any = null;

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

  loadData() {

    this.isLoadingFineData = true;
    this.agreementService.getFines(this.agreementId, (this.paginator.pageIndex + 1)).
      subscribe(
        (dSuccess: any) => {

          this.fines = dSuccess.data.results;
          this.finesDataSource = new MatTableDataSource<any>(this.fines);
          this.pageNumber = (dSuccess.data.count).toFixed(0);
          this.isLoadingFineData = false;
        },
        (error) => {
          this.fines = [];
          this.finesDataSource = new MatTableDataSource<any>(this.fines);
          this.pageNumber = 0;
          this.isLoadingFineData = false;
        });
  }

  loadPageData(pageEvent: PageEvent) {
    this.loadData();
  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/detail');
    this.fineCreatePrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/create');
    this.fineEditPrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/detail');

    this.route.paramMap.subscribe((success: any) => {
      this.agreementId = success.params.id;

      console.error("=================");
      console.log(success.params);
      console.error("=================");

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
      tasks$.push(this.agreementService.detailAgreementReception(this.agreementId));
      tasks$.push(this.agreementService.getFines(this.agreementId));
      tasks$.push(this.agreementService.getTax());

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
          let articleReceptionInfo: any[] = results[9].data.results;
          this.fines = results[10].data.results;
          this.tax = results[11].data.results;

          this.finesDataSource = new MatTableDataSource<any>(this.fines);
          this.finesDataSource.paginator = this.paginator;
          this.pageNumber = (results[10].data.count).toFixed(0);

          this.agreementData.files = this.agreementData.files.map(
            (filedata) => {
              filedata.path_url = environment.backend_url + '/' + environment.media_path + '/' + filedata.path_url;
              return filedata;
            }
          )
          if (this.agreementData.recipent != "" && this.agreementData.recipent != null)
            this.recipientList = (this.agreementData.recipent as string).split(";").filter(x => x != "");

          if( this.agreementData.n_month == 0){
            this.finalDate = this.datePipe.transform(this.agreementData.date_start,'dd/MM/yyyy')
          }else{
            let init_date = new Date(this.datePipe.transform(this.agreementData.date_start,'yyyy-MM-dd'));
            let month:number = init_date.getMonth();
            let nMonth:number = parseInt(this.agreementData.n_month);
            let totalMonth = (nMonth) + (month);
            this.finalDate = this.datePipe.transform(init_date.setMonth(totalMonth),'dd/MM/yyyy');
          }
          
          this.agreementType = this.agreementTypes.find(x => this.agreementData.agreement_type == x.id);
          this.agreementCategory = this.agreementCategories.find(x => this.agreementData.category.id == x.id);
          this.licitation = this.licitations.find(x => this.agreementData.bidding.id == x.id);
          this.bank = this.bankTypes.find(x => this.agreementData.last_warranty_detail.bank.id == x.id);
          this.warrantyType = this.warrantyTypes.find(x => this.agreementData.last_warranty_detail.warranty_type.id == x.id);
          this.tax = this.tax.find(x => this.agreementData.tax.id == x.id);

          this.resApprove = this.resolutionApprovalTypes.find(x => this.agreementData.last_base_resolution_approval_detail.base_resolution_approval_number.id == x.id);

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
              let reception = articleReceptionInfo.find(x => x.article_id == artserv_id);
              this.totalAmount = this.totalAmount + aux.unit_value * aux.quantity;

              return {
                article: artserv_id,
                article_code: artserv_code,
                article_name: artserv_name,
                unit_value: aux.unit_value,
                comment: aux.comment,
                quantity: aux.quantity,
                service: aux.service,
                reception: reception
              };
            }
          );

          this.documents = this.agreementData.document;

          if (this.articleList.length > 0) {
            this.dataSource = new MatTableDataSource<any>(this.articleList);
          }

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

}
