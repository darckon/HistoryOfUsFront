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
import { MovementService } from 'src/app/supplying/services/movement.service';


@Component({
  selector: 'app-provider-detail',
  templateUrl: './provider-detail.component.html',
  styleUrls: ['./provider-detail.component.scss']
})
export class ProviderDetailComponent implements OnInit {

  editMode: boolean = false;
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;
  locationTypes: any[] = [];

  isLoading:boolean = true;
  editModule: ModuleInfo;
  id: any;

  costCenters: any[] = [];
  communes: any[] = [];
  providerData:any = {};

  compareFn(c1: any, c2:any): boolean {     
    return c1 && c2 ? c1.id === c2.id : c1 === c2; 
  }

  activeEditMode(){
    (this.editMode==false) ? this.editMode = true : this.editMode = false;
    if(this.editMode == true)
    {
      this.formGroup.enable(); 
    }
    else
    {
      this.formGroup.disable();
    }
  }  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private movementService: MovementService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.isLoading = true;

    this.route.paramMap.subscribe((success: any) => {
      this.id = success.params.id;

      this.currentUser = this.userService.getCurrentUserData();
      this.currentInstitution = this.userService.getCurrentUserInstitutionId();
      this.currentProfileData = this.userService.getCurrentProfile();
  

      this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/providers/detail');
      this.editModule = this.moduleManagerService.getModuleByInternalUrl('supplying/providers/edit');


      var tasks$ = [];
      tasks$.push(this.movementService.getCommunes());
      tasks$.push(this.movementService.getDetail(this.currentModule, this.id));
  
      forkJoin(...tasks$).subscribe(
      (results: any) => 
      {

        this.communes = results[0].data.results; 
        this.providerData  = results[1].data;



        this.formGroup = this.fb.group({
          run: [this.providerData.run, Validators.required],
          business_name: [this.providerData.business_name, Validators.required],
          commune: [ this.communes.find( x => x.id == this.providerData.commune) , null],
          branch_office_code: [this.providerData.branch_office_code, Validators.required],
          code: [this.providerData.code, Validators.required], 
          contact_name: [this.providerData.contact_name, null],
          contact_phone: [this.providerData.contact_phone, null], 
          contact_email: [this.providerData.contact_email, null],
          work_position_contact: [this.providerData.work_position_contact, null], 
          address: [this.providerData.address, Validators.required],
          phone: [this.providerData.phone, Validators.required], 
          
        })

     
        this.isLoading = false;
        this.formGroup.disable();
      });

    });

    
  }

  edit()
  {
  
    let formData         = {
      run: this.formGroup.value.run,
      business_name: this.formGroup.value.business_name,
      commune: this.formGroup.value.commune.id,
      branch_office_code: this.formGroup.value.branch_office_code,
      code: this.formGroup.value.code, 
      contact_name: this.formGroup.value.contact_name,
      contact_phone: this.formGroup.value.contact_phone, 
      contact_email: this.formGroup.value.contact_email,
      work_position_contact: this.formGroup.value.work_position_contact, 
      address: this.formGroup.value.address, 
      phone: this.formGroup.value.phone,
      
    }


    this.movementService.update(formData, this.currentModule,this.id).subscribe(
    (result)=>{
      this.snackBar.open("Proveedor modificado con exito", null, {
        duration: 4000,
      });
    },
    (error)=>
    {
      this.snackBar.open("Hubo un error al modificar el proveedor.", null, {
        duration: 4000,
      });      
      console.error(error);
    });    
  }

}
