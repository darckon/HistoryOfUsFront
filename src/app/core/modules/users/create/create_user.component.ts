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
import { UserService } from 'src/app/core/services/users/user.service';
import { RutValidator } from 'ng2-rut';
declare var require: any;

export interface RowElement {
  profile: string;
  locations: string;
}


@Component({
  selector: 'app-create',
  templateUrl: './create_user.component.html',
  styleUrls: ['./create_user.component.scss']
})
export class CreateUserComponent implements OnInit {
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;

  isLoading: boolean = false;

  locations: any[] = [];
  costCenters: any[] = [];
  personTypes: any[] = [];
  userProfiles: any[] = [];
  locationFormGroup: FormGroup;

  userProfileLocations = false;
  userProfileLocationsList: any[] = [];
  userProfileLocationsFormGroup: FormGroup;
  dataSource = new MatTableDataSource<RowElement>([]);
  displayedColumns: string[] = ['profile', 'locations', 'actions'];
  ProfileGroups : FormArray;

  locationList: any[] = [];
  costCenterList: any[] = [];
  userProfileList: any[] = [];
  personTypeList: any[] = [];

  costCenterFormGroup: FormGroup;
  userProfileFormGroup: FormGroup;
  communes: any[] = [];
  genders: any[] = [];
  nationalities: any[] = [];
  personTypesFormGroup: FormGroup;
  dataLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private userService: UserService,
    private datePipe: DatePipe,
    private rutValidator: RutValidator
  ) { }


  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserData();
    this.currentInstitution = this.authService.getCurrentUserInstitutionId();
    this.currentProfileData = this.authService.getCurrentProfile();

    this.isLoading = true;
    this.dataLoaded = false;

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('users/create');

    this.formGroup = this.fb.group({
      username: [null, Validators.required],
      //password: [null, Validators.required, Validators.minLength(10)],
      password: [null, Validators.required],
      active_session_time: [15, [Validators.required, Validators.pattern("^[0-9]*$")]],
      error_password: [3, [Validators.required, Validators.pattern("^[0-9]*$")]],
      can_authorize_order: [null, Validators.required],

      run: [null, [Validators.required, this.rutValidator]],
      name: [null, Validators.required],
      last_name: [null, Validators.required],
      mother_last_name: [null, Validators.required],
      gender: [null, Validators.required],
      commune: [null, Validators.required],
      address: [null, Validators.required],
      personal_phone: [null, Validators.required],
      mobile_phone: [null, Validators.required],
      email: [null, Validators.required],
      birthdate: [null, Validators.required],
      nationality: [null, Validators.required],
      location_profile : this.fb.array([]),
    });

    this.locationFormGroup = this.fb.group({
      location: [null, Validators.required],
    });
    this.costCenterFormGroup = this.fb.group({
      costCenter: [null, Validators.required],
    });
    this.userProfileLocationsFormGroup = this.fb.group({
      userProfile: [null, Validators.required],
      location: [null, Validators.required]

    });
    this.personTypesFormGroup = this.fb.group({
      personType: [null, Validators.required],
    });

    var tasks$ = [];

    tasks$.push(this.userService.getLocations(this.currentInstitution));
    tasks$.push(this.userService.getCostCenters(this.currentInstitution));
    tasks$.push(this.userService.getPersonTypes());
    tasks$.push(this.userService.getUserProfiles(this.currentInstitution));
    tasks$.push(this.userService.getCommunes());
    tasks$.push(this.userService.getGenders());
    tasks$.push(this.userService.getNationalities());

    forkJoin(...tasks$).subscribe(
      (results: any) => {

        const location = results[0].data.results;
        for (let x in location) {
          if (location[x].is_active == true) {
            this.locations.push(location[x]);
          }
        }

        this.costCenters = results[1].data;
        this.personTypes = results[2].data.results;
        this.userProfiles = results[3].data.results;
        this.communes = results[4].data.results;
        this.genders = results[5].data.results;
        this.nationalities = results[6].data.results;
        this.isLoading = false;
        this.dataLoaded = true;
      },
      (error) => {
        console.error(error);
        this.isLoading = false;
        this.dataLoaded = false;
      });

  }

  GeneratePassword() {
    var generator = require('generate-password-browser');
    let password = generator.generate({
      length: 10,
      numbers: true,
      symbols: true
    });
    this.formGroup.get('password').setValue(password);

  }

  add_person_type(array: any[], elementToAdd: any) {
    if (!array.find(x => x.id == elementToAdd.id)) {
      array.push(elementToAdd)
      this.personTypeList.push(elementToAdd)
    }
  }
  
  remove_person(array:any[],elementToRemove:any)
  {
    let index = array.findIndex(x=>x.id==elementToRemove.id);
    if(index != -1)
    {
      if(array.length==1)
      {
        array = array.pop();
      }
      else
      {
        array.splice(index,1);
      }
      
    }
  }
  
    editlist(locations, i){
      let profile_locations = this.userProfileLocationsList.map(
        (x: any, index) => {
          if(index == i){
            return {
              profile: {id: x.profile.id, name: x.profile.name},
              locations: locations.map(
                (x: any) => {
                  return {
                    id: x.id,
                    name: x.name
                }
              })
            }
          }else{
            return {
              profile: {id: x.profile.id, name: x.profile.name},
              locations: x.locations.map(
                (x: any) => {
                  return {
                    id: x.id,
                    name: x.name
                }
              })
            }
          }
        }
      )
    }
  
  add(array: any[], elementOneToAdd: any, elementTwoToAdd: any) {
    if (!array.find(x => x.profile.id == elementOneToAdd.id)) {
      this.userProfileLocations = true;
      let profile = {
        id: elementOneToAdd.id,
        name: elementOneToAdd.name
      }
      let locations = elementTwoToAdd.map((y: any) => {
        return {
          id: y.id,
          name: y.name
        }
      });
      let element = {
        profile,
        locations
      }
      if (!array.find(x => x.id == profile.id)) {
        this.userProfileLocationsList.push(element);
      }

      this.dataSource = new MatTableDataSource<RowElement>(this.userProfileLocationsList);
      this.ProfileGroups = this.fb.array(this.getProfilesControls().map(profile => this.fb.group(profile)))
      let FormGroups = this.fb.group(
        {
          locations:[ {value:(locations)} ],
        });

      (this.formGroup.get('location_profile') as FormArray).push(FormGroups);
      this.formGroup.updateValueAndValidity();

      // clean fields
      this.userProfileLocationsFormGroup.get('userProfile').setValue("1");
      this.userProfileLocationsFormGroup.get('location').setValue("");
    }else{
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }
  }

  remove(ind: number) {
    (this.formGroup.get('location_profile') as FormArray).removeAt(ind);
    this.userProfileLocationsList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<RowElement>(this.userProfileLocationsList);
  }

  clearForm(): void {

    this.formGroup.reset();

    this.locationList = [];
    this.costCenterList = [];
    this.personTypeList = [];
    this.userProfileList = [];


  }

  send() {
    if (this.formGroup.valid) {
      let profile_locations = this.userProfileLocationsList.map(
        (x: any) => {
          return {
            profile: x.profile.id,
            locations: x.locations.map(
              (x: any) => {
                return x.id
              }
            )
          }
        })

      let locations = this.locationList.map(x => x.id);
      let costCenters = this.costCenterList.map(x => x.id);

      let institution_profile = this.userProfileList.map(
        (x: any) => {
          return { institution_id: this.currentInstitution, profile_id: x.id }
        }
      )

      let institution_person_type = this.personTypeList.map(
        (x: any) => {
          return { institution_id: this.currentInstitution, person_type_id: x.id }
        }
      )

      let run = (this.formGroup.value.run as string).toUpperCase();
        
      let person =
      {
        run: run,
        name: this.formGroup.value.name,
        last_name: this.formGroup.value.last_name,
        mother_last_name: this.formGroup.value.mother_last_name,
        gender: this.formGroup.value.gender.id,
        commune: this.formGroup.value.commune.id,
        address: this.formGroup.value.address,
        personal_phone: this.formGroup.value.personal_phone,
        mobile_phone: this.formGroup.value.mobile_phone,
        email: this.formGroup.value.email,
        birthdate: this.datePipe.transform(this.formGroup.value.birthdate, 'yyyy-MM-dd'),
        nationality: this.formGroup.value.nationality.id,
        institution_person_type: institution_person_type
      }

      let sendData =
      {
        username: this.formGroup.value.username,
        password: this.formGroup.value.password,
        can_authorize_order: this.formGroup.value.can_authorize_order,
        active_session_time: this.formGroup.value.active_session_time,
        error_password: this.formGroup.value.error_password,
        locations: locations,
        institution: this.currentInstitution,
        profile_locations: profile_locations,
        cost_centers: costCenters,
        institution_profile: institution_profile,
        person: person,
      }



      this.userService.create(sendData).subscribe(
        (result) => {
          this.snackBar.open("Usuario creado con exito", null, {
            duration: 4000,
          });
          this.router.navigateByUrl('/users');
        },
        (error: any) => {
          let msg = "Hubo un error al crear el usuario.";
          if (error.message) {
            if (error.message.password) {
              msg = error.message.password;
            }
          }
          this.snackBar.open(msg, null, {
            duration: 4000,
          });
          console.error(error);
        });

    }

  }

  getProfilesControls():any[]
  {
    let controlArray:any[] = [];

    for (let i = 0; i < this.userProfileLocationsList.length; i++) {
      let locations = this.userProfileLocationsList[i];

      controlArray.push(
        {
          locations:[ {value:(locations.locations), disabled:false }],
        }        
      );
    }
    return controlArray;
  }

  equals(objOne, objTwo) {
    if (typeof objOne !== 'undefined' && typeof objTwo !== 'undefined') {
      return objOne.id === objTwo.id;
    }
  }

}