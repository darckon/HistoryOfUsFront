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
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {

  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;

  isLoading: boolean = false;
  userProfileLocations = false;
  userProfileLocationsList: any[] = [];
  userProfileLocationsListEdit: any[] = [];
  dataSource = new MatTableDataSource<RowElement>([]);
  displayedColumns: string[] = ['profile', 'locations', 'actions'];

  locations: any[] = [];
  costCenters: any[] = [];
  personTypes: any[] = [];
  userProfiles: any[] = [];
  locationFormGroup: FormGroup;

  locationList: any[] = [];
  costCenterList: any[] = [];
  userProfileList: any[] = [];
  personTypeList: any[] = [];

  costCenterFormGroup: FormGroup;
  userProfileLocationsFormGroup: FormGroup;
  ProfileGroups : FormArray;

  communes: any[] = [];
  genders: any[] = [];
  nationalities: any[] = [];
  personTypesFormGroup: FormGroup;
  dataLoaded: boolean = false;
  id: string = "";
  userData: any = null;
  isActive: boolean = null;

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


  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
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


  toggleStatus() {

    let formData =
    {
      is_active: !this.isActive
    };

    this.userService.update(formData, this.id).subscribe(
      (result) => {
        this.isActive = !this.isActive;
        this.snackBar.open("usuario desactivado con exito", null, {
          duration: 4000,
        });

      },
      (error) => {
        this.snackBar.open("Hubo un error al modificar el usuario.", null, {
          duration: 4000,
        });
      });


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
    console.log(this.userProfileLocationsList = profile_locations)
  }

  edit() {

    if (this.formGroup.valid) {
      console.log(this.formGroup)
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
        }
      )

      let locations = this.locationList.map(x => x.id);
      let costCenters = this.costCenterList.map(x => x.id);
      
      let institution_profile = this.userProfileList.map(
        (x: any) => {
          return { 
            institution_id: this.currentInstitution,
            profile_id: x.id
          }
        }
      )

      let institution_person_type = this.personTypeList.map(
        (x: any) => {
          return { institution_id: this.currentInstitution, person_type_id: x.id }
        }
      )

      let run = (this.formGroup.value.run) ? (this.formGroup.value.run as string).toUpperCase() : "";
      let person =
      {
        run: run,
        name: this.formGroup.value.name,

        last_name: this.formGroup.value.last_name,
        mother_last_name: this.formGroup.value.mother_last_name,
        gender: this.formGroup.value.gender,
        commune: this.formGroup.value.commune,
        address: this.formGroup.value.address,
        personal_phone: this.formGroup.value.personal_phone,
        mobile_phone: this.formGroup.value.mobile_phone,
        email: this.formGroup.value.email,
        birthdate: this.datePipe.transform(this.formGroup.value.birthdate, 'yyyy-MM-dd'),
        nationality: this.formGroup.value.nationality,
        institution_person_type: institution_person_type
      }


      let formData = {
        can_authorize_order: this.formGroup.value.can_authorize_order,
        active_session_time: this.formGroup.value.active_session_time,
        error_password: this.formGroup.value.error_password,

        // Deprecado
        locations: locations,
        cost_centers: costCenters,
        institution_profile: institution_profile,
        
        institution: this.currentInstitution,
        profile_locations: profile_locations,

        person: person,

        password: this.formGroup.value.password,

      };

      this.userService.update(formData, this.id).subscribe(
        (result) => {
          this.snackBar.open("usuario modificado con exito", null, {
            duration: 4000,
          });
        },
        (error) => {
          this.snackBar.open("Hubo un error al modificar el usuario.", null, {
            duration: 4000,
          });
          console.error(error);
        });

    }
    else {
      console.log(this.formGroup);
      this.snackBar.open("Por favor revise el formulario.", null, {
        duration: 4000,
      });
    }


  }

  add_person(array:any[],elementToAdd:any)
  {
    if(!array.find(x=>x.id==elementToAdd.id))
    {
      array.push(elementToAdd)
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

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserData();
    this.currentInstitution = this.authService.getCurrentUserInstitutionId();
    this.currentProfileData = this.authService.getCurrentProfile();

    this.isLoading = true;
    this.dataLoaded = false;

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('users/edit');

    this.route.paramMap.subscribe((success: any) => {
      this.id = success.params.id;


      var tasks$ = [];

      tasks$.push(this.userService.getLocationsCustom(this.currentInstitution));
      tasks$.push(this.userService.getCostCenters(this.currentInstitution));
      tasks$.push(this.userService.getPersonTypes());
      tasks$.push(this.userService.getUserProfiles(this.currentInstitution));
      tasks$.push(this.userService.getCommunes());
      tasks$.push(this.userService.getGenders());
      tasks$.push(this.userService.getNationalities());
      tasks$.push(this.userService.get(this.id));


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
          this.userData = results[7].data;

          this.isActive = this.userData.is_active;

          if ((this.userData.locations as []).length) {
            this.userProfileList = [];
            this.userProfileLocationsList = this.userData.locations.map((x: any) => {
              return {
                profile: {
                  id: x.profile,
                  name: x.profile_name
                },
                locations: x.locations.map((y: any) => {
                    return {
                      id: y.id,
                      name: y.name
                    }
                  }
                )
              }
            });
            this.dataSource = new MatTableDataSource<RowElement>(this.userProfileLocationsList);
          }

          let run = (this.userData.person && this.userData.person.run) ? (this.userData.person.run as string).toUpperCase() : "";
          this.ProfileGroups = this.fb.array(this.getProfilesControls().map(profile => this.fb.group(profile)))
          
          this.formGroup = this.fb.group({
            username: [{ value: this.userData.username, disabled: true }, null],
            password: [this.userData.password, Validators.minLength(10)],
            active_session_time: [this.userData.active_session_time, [Validators.required, Validators.pattern("^[0-9]*$")]],
            error_password: [this.userData.error_password, [Validators.required, Validators.pattern("^[0-9]*$")]],
            can_authorize_order: [this.userData.can_authorize_order, Validators.required],

            run: [(this.userData.person) ? (run) : (null), [Validators.required, this.rutValidator]],
            name: [(this.userData.person) ? this.userData.person.name : null, Validators.required],
            last_name: [(this.userData.person) ? this.userData.person.last_name : null, Validators.required],
            mother_last_name: [(this.userData.person) ? this.userData.person.mother_last_name : null, Validators.required],
            gender: [(this.userData.person) ? this.userData.person.gender : null, Validators.required],
            commune: [(this.userData.person) ? this.userData.person.commune : null, Validators.required],
            address: [(this.userData.person) ? this.userData.person.address : null, Validators.required],
            personal_phone: [(this.userData.person) ? this.userData.person.personal_phone : null, Validators.required],
            mobile_phone: [(this.userData.person) ? this.userData.person.mobile_phone : null, Validators.required],
            email: [(this.userData.person) ? this.userData.person.email : null, Validators.required],
            birthdate: [(this.userData.person) ? this.userData.person.birthdate : null, Validators.required],
            nationality: [(this.userData.person) ? this.userData.person.nationality : null, Validators.required],
            location_profile : this.ProfileGroups
          });

          
          let userLocations = this.authService.getUserLocations();
          if ((userLocations as []).length) {
            this.locationList = [];
            userLocations.map((x: any) => {
              let location = this.locations.find(y => y.id == x);
              if ( location )

                this.locationList.push(location);
            
              }
            );
          }


          if ((this.userData.cost_centers as []).length) {
            this.costCenterList = [];
            this.userData.cost_centers.map((x: any) => {
              let costCenter = this.costCenters.find(y => y.id == x);
              if (costCenter)
                this.costCenterList.push(costCenter);
            }
            );

          }

          if (this.userData.person && (this.userData.person.institution_person_type as []).length) {
            this.personTypeList = [];
            this.userData.person.institution_person_type.map((x: any) => {
              let pType = this.personTypes.find(y => y.id == x);
              if (pType)
                this.personTypeList.push(pType);
            }
            );

          }

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


          this.isLoading = false;
          this.dataLoaded = true;


        },
        (error) => {
          this.isLoading = false;
          this.dataLoaded = false;
        });


    });

  }

  getProfilesControls():any[]
  {
    let controlArray:any[] = [];

    for (let i = 0; i < this.userProfileLocationsList.length; i++) {

      let locations = this.userProfileLocationsList[i];
      controlArray.push(
        {
          locations:[ {value:(locations[0]), disabled:false }],
        }        
      );
    }
    console.log(controlArray)
    return controlArray;
  }

  equals(objOne, objTwo) {
    if (typeof objOne !== 'undefined' && typeof objTwo !== 'undefined') {
      return objOne.id === objTwo.id;
    }
  }

}
