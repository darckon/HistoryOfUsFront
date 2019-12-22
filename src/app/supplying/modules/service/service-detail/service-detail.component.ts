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
import { ArticlesService } from 'src/app/supplying/services/articles.service';
import { MovementService } from 'src/app/supplying/services/movement.service';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  editMode: boolean = false;
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;
  budgetItem: any[] = [];

  isLoading: boolean = true;
  serviceData: any = {};
  editModule: ModuleInfo;
  id: any;
  isActive: boolean = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private articleService: ArticlesService,
    private movementService: MovementService
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


      this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/articles/services/detail');
      this.editModule = this.moduleManagerService.getModuleByInternalUrl('supplying/articles/services/edit');

      var tasks$ = [];
      tasks$.push(this.articleService.getBudgetItems());
      tasks$.push(this.movementService.getDetail(this.currentModule, this.id));


      forkJoin(...tasks$).subscribe(
      (results: any) => 
      {
        this.budgetItem = results[0].data; 
        this.serviceData  = results[1].data;
        this.isActive = this.serviceData.is_active;
        
        this.formGroup = this.fb.group({
          name: [{ value:this.serviceData.name, disabled:true }, null],
          budget_item: [ (this.serviceData.budget_item ? this.budgetItem.find( x => this.serviceData.budget_item.id == x.id): null) , Validators.required],
          code: [{ value:this.serviceData.code, disabled:true }, null],
          description: [this.serviceData.description, null],
          is_active: [this.serviceData.is_active, null],
        })
        
        this.isLoading = false;
        this.formGroup.disable();
      });

    });
  }

  edit() {

    this.formGroup.controls.budget_item.enable();
    this.formGroup.controls.code.enable();
    this.formGroup.controls.name.enable();

    let formData = {
      name: this.formGroup.value.name,
      budget_item: this.formGroup.value.budget_item.id,
      code: this.formGroup.value.code,
      description: this.formGroup.value.description,
    };
    this.isLoading = true;

    this.movementService.update(formData, this.currentModule, this.id).subscribe(
      (result) => {
        this.isLoading = false;
        this.snackBar.open("Servicio modificada con exito", null, {
          duration: 4000,
        });
        this.router.navigateByUrl('/supplying/articles/services');
      },
      (error) => {
        this.isLoading = false;
        this.snackBar.open(error.error.message.detail, null, {
          duration: 4000,
        });
      });
  }

  activeEditMode() {
    (this.editMode == false) ? this.editMode = true : this.editMode = false;
    if (this.editMode == true) {
      this.formGroup.controls.description.enable();
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
          this.snackBar.open("Servicio desactivado con exito", null, {
          duration: 4000,
          });
          
        },
        (error)=>
        {
          this.snackBar.open("Hubo un error al modificar el servicio.", null, {
          duration: 4000,
          });      
        }); 
  }

}
