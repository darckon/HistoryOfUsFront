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
  selector: 'app-cost-center-create',
  templateUrl: './cost-center-create.component.html',
  styleUrls: ['./cost-center-create.component.scss']
})
export class CostCenterCreateComponent implements OnInit {

  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  costcenterFormgroup: FormGroup;
  locationFormGroup: FormGroup;
  communes: any[] = [];
  locations: any[] = [];

  articleList: any[] = [];
  locationList: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  articleFormGroup: FormGroup;
  displayedColumns: string[] = ['article_code', 'article_name', 'actions'];
  isLoading:boolean = false;
  costCenters: any[] = [];
  percs: any[] = [];

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

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserData();
    this.currentInstitution = this.authService.getCurrentUserInstitutionId();
    this.currentProfileData = this.authService.getCurrentProfile();
    
    this.currentModule =       this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/cost-centers/create');

    this.costcenterFormgroup = this.fb.group({
      name: [null, Validators.required],
      cost_center: [null, null], 
      perc: [null, Validators.required], 
      location: [null, Validators.required],
      can_request: [false, null],
      is_active: [false, null],
      can_associate_recipe: [false, null], 


    });

    this.locationFormGroup = this.fb.group({
      location: [null, Validators.required],
    });

    this.articleFormGroup = this.fb.group({
      article: ["", Validators.required],
    })

    var tasks$ = [];
    tasks$.push(this.movementService.getCommunes());
    tasks$.push(this.movementService.getCostCenters());
    tasks$.push(this.movementService.getPercs());
    tasks$.push(this.userService.getLocations(this.currentInstitution));


    forkJoin(...tasks$).subscribe((results: any) => 
    {
      this.communes    = results[0].data.results; 
      this.costCenters = results[1].data; 
      this.percs       = results[2].data.results;
      this.locations   = results[3].data.results;
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

  removeArticle(ind: number) 
  {
    this.articleList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<any>(this.articleList);
  }

  clearForm() : void{
    this.costcenterFormgroup.reset();

  }

  send()
  {
    let data = this.costcenterFormgroup.value;
    let locations = data.location.map(x => x.id);

    let formData = {
      name: data.name,

      perc_data: data.perc,

      can_request: data.can_request,
      is_active: data.is_active,
      can_associate_recipe: data.can_associate_recipe,

      cost_center: (data.cost_center != undefined) ? (data.cost_center) : null,
      institution: this.currentInstitution,  
      location: locations,  
      articles: this.articleList.map((x:any) =>  x.article)
      
    };

    this.movementService.create(formData, this.currentModule).subscribe(
    (result)=>{
      this.snackBar.open("Centro de costo creado con exito", null, {
        duration: 4000,
      });
      this.router.navigateByUrl('/supplying/cost-centers');
    },
    (error)=>
    {
      this.snackBar.open("Hubo un error al crear el centro de costo.", null, {
        duration: 4000,
      });      
      console.error(error);
    });
  }

}
