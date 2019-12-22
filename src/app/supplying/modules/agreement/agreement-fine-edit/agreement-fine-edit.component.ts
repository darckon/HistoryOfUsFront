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

@Component({
  selector: 'app-agreement-fine-edit',
  templateUrl: './agreement-fine-edit.component.html',
  styleUrls: ['./agreement-fine-edit.component.scss']
})
export class AgreementFineEditComponent implements OnInit {


  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  costcenterFormgroup: FormGroup;
  isLoading: boolean = true;
  dataLoaded: boolean = false;
  agreementId: any = null;
  formGroup: FormGroup;
  agreementModule: ModuleInfo;
  agreementData: any = null;
  statusTypes: any[] = [];
  compliances: any[] = [];
  fineId: any = null;
  fineData: any;


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


  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }


  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/edit');
    this.agreementModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/detail');

    this.route.paramMap.subscribe((success: any) => {
      this.agreementId = success.params.id;
      this.fineId = success.params.fineid;

      this.isLoading = true;
      var tasks$ = [];


      tasks$.push(this.agreementService.detail(this.agreementModule, this.agreementId));
      tasks$.push(this.agreementService.getFineTypes());
      tasks$.push(this.agreementService.getFineCompliance());
      tasks$.push(this.agreementService.detail(this.currentModule, this.fineId));


      forkJoin(...tasks$).subscribe(
        (results: any) => {
          this.agreementData = results[0].data;
          this.statusTypes = results[1].data;
          this.compliances = results[2].data;
          this.fineData = results[3].data;

          this.formGroup = this.fb.group({
            status: [(this.fineData.type_non_compliance_data ? this.statusTypes.find(x => this.fineData.type_non_compliance_data.id == x.id) : null), Validators.required],
            comment: [(this.fineData.comment ? this.fineData.comment : ""), Validators.required],
            concept: [(this.fineData.fine_state_data ? this.compliances.find(x => this.fineData.fine_state_data.id == x.id) : null), Validators.required],
            notification_date: [(this.fineData.notification_date ? this.datePipe.transform(this.fineData.notification_date, 'yyyy-MM-ddTHH:mm:ss') : null), Validators.required],
            discharge_date: [(this.fineData.discharge_date ?  this.datePipe.transform(this.fineData.discharge_date, 'yyyy-MM-ddTHH:mm:ss') : null), Validators.required],
            resolution_date: [(this.fineData.resolution_date ? this.datePipe.transform(this.fineData.resolution_date, 'yyyy-MM-ddTHH:mm:ss') : null), Validators.required],
            res_number: [(this.fineData.resolution_number ? this.fineData.resolution_number : null), [Validators.required, Validators.pattern("^[0-9]*$")]],
            exp_number: [(this.fineData.exp_number ? this.fineData.exp_number : null), [Validators.required, Validators.pattern("^[0-9]*$")]],
            amount: [(this.fineData.amount ? this.fineData.amount : null), [Validators.required, Validators.pattern("^[0-9]*$")]],
            cancelled: [(this.fineData.is_canceled ? this.fineData.is_canceled : false), Validators.required],
            is_utm: [(this.fineData.is_utm ? this.fineData.is_utm : false), null],
          });

          this.isLoading = false;
          this.dataLoaded = true;

        },
        (error) => {

          this.isLoading = false;
          this.dataLoaded = false;
          console.error(error);
        });

    });

  }

  send() {
    if (this.formGroup.valid) {

      let data =
      {

        "agreement": this.agreementId,
        "fine_state": this.formGroup.value.concept.id,
        "type_non_compliance": this.formGroup.value.status.id,
        "comment": this.formGroup.value.comment,
        "notification_date": this.datePipe.transform(this.formGroup.value.notification_date, 'yyyy-MM-dd'),
        "discharge_date": this.datePipe.transform(this.formGroup.value.discharge_date, 'yyyy-MM-dd'),
        "resolution_date": this.datePipe.transform(this.formGroup.value.resolution_date, 'yyyy-MM-dd'),
        "resolution_number": this.formGroup.value.res_number,
        "exp_number": this.formGroup.value.exp_number,
        "amount": this.formGroup.value.amount,
        "is_canceled": this.formGroup.value.cancelled,
        "is_utm": this.formGroup.value.is_utm,
      }


      this.agreementService.patch(data, this.currentModule, this.fineId).subscribe(
        (result) => {
          this.snackBar.open("Multa editada con exito", null, {
            duration: 4000,
          });
          this.router.navigateByUrl('/supplying/agreements');
        },
        (error) => {
          this.snackBar.open("Hubo un error la multa.", null, {
            duration: 4000,
          });
          console.error(error);
        });

    }
    else {
      this.snackBar.open("Por favor revise el formulario.", null, {
        duration: 4000,
      });
    }
  }

}
