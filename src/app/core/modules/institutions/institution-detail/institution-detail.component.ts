import { Component, OnInit } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { InstitutionService } from 'src/app/core/services/institution/institution.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-institution-detail',
  templateUrl: './institution-detail.component.html',
  styleUrls: ['./institution-detail.component.scss']
})
export class InstitutionDetailComponent implements OnInit {

  editMode: boolean = false;
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;

  isLoading: boolean = true;
  editModule: ModuleInfo;
  institutionData: any = {};
  communes: any[] = [];

  constructor(
    private userService: AuthService,
    private router: Router,
    private moduleManagerService: ModulemanagerService,
    private institutionService: InstitutionService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();


    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('institutions/detail');
    this.editModule = this.moduleManagerService.getModuleByInternalUrl('institutions/edit');

    var tasks$ = [];
    tasks$.push(this.institutionService.getDataCurrentInstitution(this.currentInstitution));
    tasks$.push(this.institutionService.getCommunes());

    forkJoin(...tasks$).subscribe(
      (results: any) => {
        this.institutionData = results[0].data;
        this.communes = results[1].data.results;

        this.formGroup = this.fb.group({
          name: [this.institutionData.name, Validators.required],
          commune: [this.communes.find(x => x.id == this.institutionData.commune), Validators.required],
          address: [this.institutionData.address, Validators.required],
          address_annex: [this.institutionData.address_annex, null],
          contact_phone: [this.institutionData.phone, null],
          code_institution: [this.institutionData.code, Validators.required],
          token_mp: [this.institutionData.token_mp, null],

        })

        this.isLoading = false;
        this.formGroup.disable();
      });

  }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }


  activeEditMode() {
    (this.editMode == false) ? this.editMode = true : this.editMode = false;
    if (this.editMode == true) {
      this.formGroup.enable();
    } else {
      this.formGroup.disable();
    }
  }

  edit() {
    let formData = {
      name: this.formGroup.value.name,
      commune: this.formGroup.value.commune.id,
      address: this.formGroup.value.address,
      address_annex: this.formGroup.value.address_annex,
      phone: this.formGroup.value.contact_phone,
      code: this.formGroup.value.code_institution,
      token_mp: this.formGroup.value.token_mp
    }

    this.institutionService.update(formData, this.currentModule, this.currentInstitution).subscribe(
      (result) => {
        this.snackBar.open("Institución modificada con exito", null, {
          duration: 4000,
        });
      },
      (error) => {
        this.snackBar.open("Hubo un error al modificar la institución.", null, {
          duration: 4000,
        });
        console.error(error);
      });
  }
}
