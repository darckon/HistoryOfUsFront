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
  selector: 'app-provider-create',
  templateUrl: './provider-create.component.html',
  styleUrls: ['./provider-create.component.scss']
})
export class ProviderCreateComponent implements OnInit {

  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  providerFormgroup: FormGroup;
  communes: any[] = [];
  isLoading:boolean = false;

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
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/providers/create');

    this.providerFormgroup = this.fb.group({
      run: [null, Validators.required],
      business_name: [null, Validators.required],
      commune: [null, null],
      branch_office_code: [null, Validators.required],
      code: [null, Validators.required], 
      contact_name: [null, Validators.required],
      contact_phone: [null, Validators.required], 
      contact_email: [null, Validators.required],
      work_position_contact: [null, Validators.required], 
      address: [null, Validators.required],
      phone: [null, Validators.required], 
      
    })

    var tasks$ = [];
    tasks$.push(this.movementService.getCommunes());
    forkJoin(...tasks$).subscribe(
    (results: any) => 
    {
      this.communes = results[0].data.results; 
      console.log(this.communes);
      
    });

  }

  clearForm() : void{
    this.providerFormgroup.reset();

  }

  send()
  {
    let formData = this.providerFormgroup.value;

    console.log(formData);

    this.movementService.create(formData, this.currentModule).subscribe(
    (result)=>{
      this.snackBar.open("Proveedor creado con exito", null, {
        duration: 4000,
      });
      this.router.navigateByUrl('/supplying/providers');
    },
    (error)=>
    {
      this.snackBar.open("Hubo un error al crear el proveedor.", null, {
        duration: 4000,
      });      
      console.error(error);
    });
  }

}
