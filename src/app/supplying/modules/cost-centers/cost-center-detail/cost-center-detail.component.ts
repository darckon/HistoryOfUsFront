import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { UserService } from 'src/app/core/services/users/user.service';
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
  selector: 'app-cost-center-detail',
  templateUrl: './cost-center-detail.component.html',
  styleUrls: ['./cost-center-detail.component.scss']
})
export class CostCenterDetailComponent implements OnInit {

  editMode: boolean = false;
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  formGroup: FormGroup;
  locationTypes: any[] = [];
  locations: any[] = [];

  isLoading: boolean = true;
  editModule: ModuleInfo;
  id: any;

  costCenters: any[] = [];
  communes: any[] = [];
  articleFormGroup: FormGroup;
  costCenterData: any;
  articleList: any[] = [];
  percs: any[] = [];

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['article_code', 'article_name', 'actions'];
  isActive: boolean = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
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

  activeEditMode() {
    (this.editMode == false) ? this.editMode = true : this.editMode = false;
    if (this.editMode == true) {
      this.formGroup.enable();
      this.articleFormGroup.enable();
    }
    else {
      this.formGroup.disable();
      this.articleFormGroup.disable();
    }
  }

  edit() {
    
    let formData = {
      name: this.formGroup.value.name,
      can_request: this.formGroup.value.can_request,

      
      perc_data: this.formGroup.value.perc.id,
      can_associate_recipe: this.formGroup.value.can_associate_recipe,

      articles: this.articleList.map((x: any) => x.article),
      institution: this.currentInstitution,

      cost_center: (this.formGroup.value.cost_center) ? (this.formGroup.value.cost_center.id) : null
    };

    this.movementService.update(formData, this.currentModule, this.id).subscribe(
      (result) => {
        this.snackBar.open("Centro de costo modificado con exito", null, {
          duration: 4000,
        });
      },
      (error) => {
        this.snackBar.open("Hubo un error al moficiar el centro de costo.", null, {
          duration: 4000,
        });
        console.error(error);
      });
  }

  ngOnInit() {
    this.isLoading = true;

    this.route.paramMap.subscribe((success: any) => {
      this.id = success.params.id;

      this.currentUser = this.authService.getCurrentUserData();
      this.currentInstitution = this.authService.getCurrentUserInstitutionId();
      this.currentProfileData = this.authService.getCurrentProfile();

      this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/cost-centers/detail');
      this.editModule = this.moduleManagerService.getModuleByInternalUrl('supplying/cost-centers/edit');


      var tasks$ = [];
      tasks$.push(this.movementService.getCommunes());
      tasks$.push(this.movementService.getCostCenters());
      tasks$.push(this.movementService.getDetail(this.currentModule, this.id));
      tasks$.push(this.movementService.getPercs());
      tasks$.push(this.userService.getLocations(this.currentInstitution));

      forkJoin(...tasks$).subscribe(
        (results: any) => {

          this.communes = results[0].data.results;

          this.costCenters = results[1].data.filter((x: any) => x.id != this.id);
          this.costCenterData = results[2].data;
          this.percs = results[3].data.results;
          this.locations = results[4].data.results;

          this.isActive = this.costCenterData.is_active;
          this.formGroup = this.fb.group({
            name: [this.costCenterData.name, Validators.required],
            can_request: [this.costCenterData.can_request, null],
            perc: [this.percs ? this.percs.find(x => x.id == this.costCenterData.perc_id) : null, null],

            can_associate_recipe: [this.costCenterData.can_associate_recipe, null],
            cost_center: [this.costCenters.find(x => x.id == this.costCenterData.cost_center), null],
          })


          this.articleList = this.costCenterData.articles.map(
            (article: any) => {
              return { article: article.id, article_code: article.code, article_name: article.name };
            }
          );
          if (this.articleList.length > 0) {
            this.dataSource = new MatTableDataSource<any>(this.articleList);
          }

          this.articleFormGroup = this.fb.group({
            article: ["", Validators.required],
          })

          this.isLoading = false;
          this.formGroup.disable();
          this.articleFormGroup.disable();
        });

    });

  }

  addArticle() {

    let article = this.articleList.find(x => x.article == this.articleFormGroup.value.article.id);
    if (!article) {

      this.articleList.push({ article: this.articleFormGroup.value.article.id, article_code: this.articleFormGroup.value.article.code, article_name: this.articleFormGroup.value.article.name });
      this.articleFormGroup.get('article').setValue("");
      this.dataSource = new MatTableDataSource<any>(this.articleList);
    }
    else {
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }
  }


  removeArticle(ind: number) {
    this.articleList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<any>(this.articleList);
  }

  equals(objOne, objTwo) {
    if (typeof objOne !== 'undefined' && typeof objTwo !== 'undefined') {
      return objOne.id === objTwo.id;
    }
  }
  
  toggleStatus() {

    let formData =
    {
      is_active: !this.isActive
    };

    this.movementService.update(formData, this.currentModule, this.id).subscribe(
      (result) => {
        this.isActive = !this.isActive;
        this.snackBar.open("Centro de costo desactivado con exito", null, {
          duration: 4000,
        });

      },
      (error) => {
        this.snackBar.open("Hubo un error al modificar el Centro de costo.", null, {
          duration: 4000,
        });
        console.error(error);
      });
  }

}
