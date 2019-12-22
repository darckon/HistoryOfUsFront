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
import { ProfileService } from 'src/app/core/services/profiles/profiles/profile.service';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss']
})
export class ProfileEditComponent implements OnInit {

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

  previlegieFormGroup: FormGroup;
  communes: any[] = [];
  genders: any[] = [];
  nationalities: any[] = [];
  personTypesFormGroup: FormGroup;
  dataLoaded: boolean = false;
  id: string = "";
  userData: any = null;
  editPrevilege: ModuleInfo = null;
  profileData: any;
  previlegies: any[] = [];
  previlegeCategory: any[] = [];
  categories: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private profileService: ProfileService,
    private datePipe: DatePipe
  ) { }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserData();
    this.currentInstitution = this.authService.getCurrentUserInstitutionId();
    this.currentProfileData = this.authService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('profiles/detail');
    this.editPrevilege = this.moduleManagerService.getModuleByInternalUrl('profiles/edit');

    this.isLoading = true;
    this.dataLoaded = false;

    this.previlegieFormGroup = this.fb.group({
      previlegie: [null, null],
    });
    this.formGroup = this.fb.group({
      name: [null, Validators.required]
    });


    this.route.paramMap.subscribe(
      (success: any) => {
        this.id = success.params.id;


        var tasks$ = [];
        tasks$.push(this.profileService.get(this.id));
        tasks$.push(this.profileService.getPrevilegies(this.currentInstitution));
        tasks$.push(this.profileService.getCategoryPrevilegies());

        forkJoin(...tasks$).subscribe(
          (results: any) => {
            this.profileData = results[0].data;
            this.previlegies = results[1].data.results;
            this.categories = results[2].data;

            this.formGroup = this.fb.group({
              name: [(this.profileData) ? (this.profileData.name) : (null), Validators.required]
            });

            this.previlegieFormGroup.get('previlegie').patchValue(this.profileData.privilege);

            this.isLoading = false;
            this.dataLoaded = true;

          },
          (error) => {
            this.isLoading = false;
            this.dataLoaded = false;

            console.error(error);
          }
        );


      },
      (error) => {
        console.error(error);
        this.isLoading = false;
        this.dataLoaded = false;
      });


  }



  edit() {
    if (this.formGroup.valid) {
      let data =
      {
        "name": this.formGroup.value.name,
        "privileges": this.previlegieFormGroup.value.previlegie.map(x => x.id),
        "institution_id": this.currentInstitution
      }
      this.profileService.update(data, this.id).subscribe(
        (result) => {
          this.snackBar.open("perfil de usuario modificado con exito", null, {
            duration: 4000,
          });
        },
        (error) => {
          this.snackBar.open("Hubo un error al modificar el perfil de usuario.", null, {
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
