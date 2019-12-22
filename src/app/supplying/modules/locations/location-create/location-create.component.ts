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
  selector: 'app-location-create',
  templateUrl: './location-create.component.html',
  styleUrls: ['./location-create.component.scss']
})
export class LocationCreateComponent implements OnInit {


  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;
  locationTypes: any[] = [];

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

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/locations/create');

    this.formGroup = this.fb.group({
      name: [null, Validators.required],
      location_type: [null, Validators.required],
      receive_from_provider: [false, null],
      can_dispatch_to_cellar: [false, null],
      can_dispatch_to_cost_center: [false, null],
      can_dispatch_to_patien: [false, null],
    })


    var tasks$ = [];
    tasks$.push(this.movementService.getLocationTypes());



    forkJoin(...tasks$).subscribe(
    (results: any) => 
    {
      this.locationTypes = results[0].data.results;
    });
  }

  clearForm() : void{
    this.formGroup.reset();
  }


  send()
  {
    let formData         = this.formGroup.value;
    formData.institution = this.currentInstitution,  

    console.log(formData);

    this.movementService.create(formData, this.currentModule).subscribe(
    (result)=>{
      this.snackBar.open("Ubicación creada con exito", null, {
        duration: 4000,
      });
      this.router.navigateByUrl('/supplying/locations');
    },
    (error)=>
    {
      this.snackBar.open("Hubo un error al crear la ubicación.", null, {
        duration: 4000,
      });      
      console.error(error);
    });
  }

}
