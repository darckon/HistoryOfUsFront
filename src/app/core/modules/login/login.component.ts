import { Component } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginFormComponent {

  loginError: any = { status: false, msg: '' };
  institutionError: string = null;
  hide: boolean = true;

  currentUser: any = null;
  userIsLogged: boolean;
  profileIsLogged: boolean;

  userLoginFormGroup: FormGroup;
  institutionFormGroup: FormGroup;
  profileFormGroup: FormGroup;

  selectedInstitution: any = null;
  intitutionList: any[] = [];

  institutionControl: any = [];
  profileControl: any = [];

  selectedProfile: any = null;
  profileList: any[] = null;

  displayInstitutions = true;

  userLoginFormValidators =
    {
      username: [null, Validators.required],
      password: [null, Validators.required],
    };

  institutionLoginFormValidators =
    {
      institutionControl: [null, Validators.required]
    };

  private message = {
    message: "Establishing connection"
  };

  constructor(private fb: FormBuilder,
    private userService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {  }

  ngOnInit() {

    this.userLoginFormGroup = this.fb.group(this.userLoginFormValidators);
    this.institutionFormGroup = this.fb.group(this.institutionLoginFormValidators);

    this.userIsLogged = this.userService.currentUserIsLogged();
    this.profileIsLogged = this.userService.currentProfileIsLogged();

    if (this.userIsLogged) {
      let userData = JSON.parse(localStorage.getItem(environment.env_key + 'currentMe'));
      this.currentUser = userData;

      this.userLoginFormGroup = this.fb.group({
        username: [null, null],
        password: [null, null],
      });
      this.updateIntitutionList();

      if (this.intitutionList.length == 1) {

        this.selectedInstitution = this.intitutionList[0].id;
        this.updateIntitutionList();

        if (this.profileList.length == 1) {
          this.profileLoginFormGroupSubmit(this.profileList[0].id);
          return;
        }
        this.displayInstitutions = false;
      }
      else {
        this.displayInstitutions = true;
      }
    }
  }

  updateIntitutionList() {
    let data = this.currentUser.institution_profile as [];
    this.profileList = [];
    this.intitutionList = data.map(
      (element: any) => {

        let profiles = element.profiles;
        profiles.map(
          (profile: any) => {
            this.profileList.push({ institution_id: element.institution.id, profile_id: profile.id, profile_name: profile.name });
          }
        )
        return element.institution;
      }
    );

    this.profileList = this.profileList.filter(
      (profile: any) => {
        return profile.institution_id == this.selectedInstitution;
      }
    );
  }

  get aliases() {
    return this.userLoginFormGroup.get('aliases') as FormArray;
  }

  addAlias() {
    this.aliases.push(this.fb.control(''));
  }

  institutionLoginFormGroupSubmit(stepper: MatStepper, takeSelectValue = true) {
    let selectedInstitution = null;

    if (takeSelectValue == true)
      selectedInstitution = this.institutionFormGroup.value.institutionControl;
    else
      selectedInstitution = this.selectedInstitution;

    if (selectedInstitution != null) {
      this.selectedInstitution = selectedInstitution;

      this.updateIntitutionList();
      stepper.next();
    }
  }

  userLoginFormGroupSubmit(stepper: MatStepper) {
    if (this.userLoginFormGroup.valid) {
      this.userService.login(this.userLoginFormGroup.value.username, this.userLoginFormGroup.value.password).subscribe(
        (serverResponse) => {

          if (serverResponse.status == true) {
            let data = serverResponse.data;
            this.userService.saveUserToken(data);
           
            console.log(serverResponse);

            this.userService.getCurrentUser().subscribe(
              (userData) => {
                this.userService.saveUserData(userData.data);
              },
              (error) => {
                console.error(error);
              },
              () => {
                this.currentUser = this.userService.getCurrentUserData();
                this.userIsLogged = this.userService.currentUserIsLogged();
                this.profileIsLogged = this.userService.currentProfileIsLogged();
                this.updateIntitutionList();

                if (this.intitutionList.length == 1) {
                  this.selectedInstitution = this.intitutionList[0].id;
                  this.institutionLoginFormGroupSubmit(stepper, false);

                  if (this.profileList.length == 1) {
                    this.selectedProfile = this.profileList[0].profile_id;
                    this.profileLoginFormGroupSubmit(this.selectedProfile);
                    return;
                  }

                  this.displayInstitutions = false;
                  stepper.next();
                }
                else {
                  this.displayInstitutions = true;
                  stepper.next();
                }

              }
            )
          }
        },
        (errorData) => {
          let msg = errorData.message;
          this.loginError.status = true;

          if (msg.non_field_error) {
            this.loginError.msg = msg.non_field_errors;
          }
          else {
            this.loginError.msg = "Hubo un error al procesar los datos. Intente nuevamente.";
          }
        }
      );
    }
  }

  async profileLoginFormGroupSubmit(profileId: string) {
    this.userService.setCurrentUserInstitutionId(this.selectedInstitution);
    this.userService.setCurrentUserProfileId(profileId);
    this.router.navigate(['/']);
  }

  goBack(stepper: MatStepper) {
    stepper.previous();
  }

  goForward(stepper: MatStepper) {
    stepper.next();
  }

  logout() {
    this.userService.logout();
    location.reload();
  }

}