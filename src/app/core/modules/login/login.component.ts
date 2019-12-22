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

    this.userIsLogged = this.userService.currentUserIsLogged();

    if (this.userIsLogged) {
      let userData = JSON.parse(localStorage.getItem(environment.env_key + 'currentMe'));
      this.currentUser = userData;

      this.userLoginFormGroup = this.fb.group({
        username: [null, null],
        password: [null, null],
      });
    }
  }

  get aliases() {
    return this.userLoginFormGroup.get('aliases') as FormArray;
  }

  addAlias() {
    this.aliases.push(this.fb.control(''));
  }

  userLoginFormGroupSubmit(stepper: MatStepper) {
    if (this.userLoginFormGroup.valid) {
      this.userService.login(this.userLoginFormGroup.value.username, this.userLoginFormGroup.value.password).subscribe(
        (serverResponse) => {
          console.log('flag 1')
          console.log(serverResponse.status)

          if (serverResponse.status == true) {
            let data = serverResponse.data;
            this.userService.saveUserToken(data);
           
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
                this.router.navigate(['/']);
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