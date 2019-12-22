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
  selector: 'app-location-detail',
  templateUrl: './location-detail.component.html',
  styleUrls: ['./location-detail.component.scss']
})
export class LocationDetailComponent implements OnInit {

  editMode: boolean = false;
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;
  locationTypes: any[] = [];

  isLoading: boolean = true;
  locationData: any = {};
  editModule: ModuleInfo;
  id: any;
  isActive: boolean;

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

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  ngOnInit() {
    this.isLoading = true;

    this.route.paramMap.subscribe((success: any) => {
      this.id = success.params.id;

      this.currentUser = this.userService.getCurrentUserData();
      this.currentInstitution = this.userService.getCurrentUserInstitutionId();
      this.currentProfileData = this.userService.getCurrentProfile();


      this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/locations/detail');
      this.editModule = this.moduleManagerService.getModuleByInternalUrl('supplying/locations/edit');

      var tasks$ = [];
      tasks$.push(this.movementService.getLocationTypes());
      tasks$.push(this.movementService.getDetail(this.currentModule, this.id));


      forkJoin(...tasks$).subscribe(
      (results: any) => 
      {
        this.locationTypes = results[0].data.results; 
        this.locationData  = results[1].data;
        this.isActive = this.locationData.is_active;

        this.formGroup = this.fb.group({
          name: [this.locationData.name, Validators.required],
          location_type: [  this.locationTypes.find( x => x.id == this.locationData.location_type_set.id) , Validators.required],
          receive_from_provider: [this.locationData.receive_from_provider, null],
          can_dispatch_to_cellar: [this.locationData.can_dispatch_to_cellar, null],
          can_dispatch_to_cost_center: [this.locationData.can_dispatch_to_cost_center, null],
          can_dispatch_to_patien: [this.locationData.can_dispatch_to_patien, null],
        })
        
        this.isLoading = false;
        this.formGroup.disable();
      });

    });

  }


  edit() {

    let formData = {
      name: this.formGroup.value.name,
      location_type: this.formGroup.value.location_type.id,
      receive_from_provider: this.formGroup.value.receive_from_provider,
      can_dispatch_to_cellar: this.formGroup.value.can_dispatch_to_cellar,
      can_dispatch_to_cost_center: this.formGroup.value.can_dispatch_to_cost_center,
      can_dispatch_to_patien: this.formGroup.value.can_dispatch_to_patien,
    };

    this.movementService.update(formData, this.currentModule, this.id).subscribe(
      (result) => {
        this.snackBar.open("Ubicación modificada con exito", null, {
          duration: 4000,
        });
      },
      (error) => {
        this.snackBar.open("Hubo un error al crear la ubicación.", null, {
          duration: 4000,
        });
        console.error(error);
      });
  }

  activeEditMode() {
    (this.editMode == false) ? this.editMode = true : this.editMode = false;
    if (this.editMode == true) {
      this.formGroup.enable();
    }
    else {
      this.formGroup.disable();
    }
  }

  toggleStatus()
  {

      let formData =
      {
         is_active: !this.isActive
      };

      this.movementService.update(formData, this.currentModule,this.id).subscribe(
        (result)=>
        {
          this.isActive = !this.isActive;
          this.snackBar.open("Ubicación desactivado con exito", null, {
          duration: 4000,
          });
          
        },
        (error)=>
        {
          this.snackBar.open("Hubo un error al modificar la ubicación.", null, {
          duration: 4000,
          });      
          console.error(error);
        });    

    
  }

}
