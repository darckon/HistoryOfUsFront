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
  selector: 'app-agreement-fine-detail',
  templateUrl: './agreement-fine-detail.component.html',
  styleUrls: ['./agreement-fine-detail.component.scss']
})

export class AgreementFineDetailComponent implements OnInit {

  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  agreementModule: ModuleInfo;
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
  fineId: any = null;
  fineData: any;
  fine: any = {}

  agreementData: any = null;
  articleList: any[] = [];
  resolutionApprovalNumbers: any[] = [];

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

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/detail');
    this.agreementModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/detail');

    this.route.paramMap.subscribe((success: any) => {
      this.agreementId = success.params.id;
      this.fineId = success.params.fineid;

      this.isLoading = true;
      var tasks$ = [];
      
      tasks$.push(this.agreementService.detail(this.agreementModule, this.agreementId));
      tasks$.push(this.agreementService.detail(this.currentModule, this.fineId));

      forkJoin(...tasks$).subscribe(
        (results: any) => {
          this.agreementData = results[0].data;
          this.fineData = results[1].data;
          this.fine._agreement = this.agreementData.name;
          this.fine._bidding = this.agreementData.bidding.code;
          this.fine._concept = (this.fineData.type_non_compliance_data ? this.fineData.type_non_compliance_data.name : null);
          this.fine._comment =  (this.fineData.comment ? this.fineData.comment : "");
          this.fine._status = (this.fineData.fine_state_data ? this.fineData.fine_state_data.name : null);
          this.fine._notification_date = (this.fineData.notification_date ? this.datePipe.transform(this.fineData.notification_date, 'yyyy-MM-ddTHH:mm:ss') : null);
          this.fine._discharge_date = (this.fineData.discharge_date ?  this.datePipe.transform(this.fineData.discharge_date, 'yyyy-MM-ddTHH:mm:ss') : null);
          this.fine._resolution_date = (this.fineData.resolution_date ? this.datePipe.transform(this.fineData.resolution_date, 'yyyy-MM-ddTHH:mm:ss') : null);
          this.fine._resolution_number = (this.fineData.resolution_number ? this.fineData.resolution_number : null);
          this.fine._exp_number = (this.fineData.exp_number ? this.fineData.exp_number : null);
          this.fine._amount = (this.fineData.amount ? this.fineData.amount : null);
          this.fine._is_cancelled = (this.fineData.is_canceled ? this.fineData.is_canceled : false);
          this.fine._is_utm = (this.fineData.is_utm ? this.fineData.is_utm : false);

          this.isLoading = false;
          this.dataLoaded = true;

        },
        (error) => {

          this.isLoading = false;
          this.dataLoaded = false;
          console.error(error);
        });

    },
      (error) => {
        this.isLoading = false;
        this.dataLoaded = false;
      });

  }

}
