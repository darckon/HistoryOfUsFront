import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ArticlesService } from '../../../services/articles.service';
import { MatTableDataSource, MatPaginator, PageEvent, MatSnackBar } from '@angular/material';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { forkJoin } from 'rxjs';


export interface RowElement {
  id: number;
  critical_stock: number;
  actual_stock: number;
  initial_stock: number;
  max_stock: number;
  min_stock: number;
  location: any;
}

@Component({
  selector: 'app-articles-detail',
  templateUrl: './articles-detail.component.html',
  styleUrls: ['./articles-detail.component.scss']
})
export class ArticlesDetailComponent implements OnInit {
  currentProfileData: any;
  currentInstitution: string = null;
  currentModule: ModuleInfo = null;
  displayedColumns: string[] = ['location', 'min_stock', 'critical_stock', 'max_stock', 'actual_stock','assignation'];
  dataSource = new MatTableDataSource<RowElement>([]);
  article: any = {};
  editMode: boolean = false;
  drugs: any = null;
  locations: any = {};
  locationsData: any = {};
  isLoading: boolean = false;
  code: any;
  articleFormGroup: FormGroup;
  locationFGroup: FormArray;

  controlTypes:any[];
  activePrinciples: any;
  administrationUnits: any;
  budgetItems: any;
  administrationWays: any;
  unities: any;
  priorities: any;
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private articleService: ArticlesService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {

    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/articles/detail');

    this.isLoading = true;
    this.loadOrderData()
  }

  loadOrderData() {
    this.route.paramMap.subscribe((success: any) => {
        this.code = success.params.code;

        var tasks$ = [];
        tasks$.push(this.articleService.getDetail(this.currentModule, this.code));
        tasks$.push(this.articleService.getLocation(this.currentInstitution, 1));
        tasks$.push(this.articleService.getControlTypes());
        tasks$.push(this.articleService.getAdministrationUnits());
        tasks$.push(this.articleService.getAdministrationWays());
        tasks$.push(this.articleService.getActivePrinciples());
        tasks$.push(this.articleService.getBudgetItems());
        tasks$.push(this.articleService.getUnities());
        tasks$.push(this.articleService.getPriorities());

        forkJoin(...tasks$).subscribe((results: any) => 
        {
          console.log(this.currentInstitution);
          let successData           = results[0];
          let locationsData         = results[1];
          this.controlTypes         = results[2].data.results;
          this.administrationUnits  = results[3].data.results;
          this.administrationWays   = results[4].data.results;
          this.activePrinciples     = results[5].data.results;
          this.budgetItems          = results[6].data;
          this.unities              = results[7].data.results;
          this.priorities           = results[8].data.results;

          console.log(this.budgetItems);

    
          if (successData.status) {

            this.article = successData.data;
            console.log(this.article);
            this.locationsData = locationsData.data.results;

            if (this.article.drugs[0]) {
              this.drugs = this.article.drugs[0];
            }
            if (this.article.locations[0]) 
            {
              this.locations = this.article.locations.map( (x) => { x.assigned = true; return x; } )
                

              this.locationsData.map(
                (potentialLocation:any)=>
                {
                  if( !this.locations.find( (x) => x.location.id==potentialLocation.id ) )
                  {
                    this.locations.push(
                      {
                        id: null,
                        initial_stock: null,
                        critical_stock: null,
                        actual_stock: null,
                        max_stock: null,
                        min_stock: null,
                        location: {id:potentialLocation.id,name:potentialLocation.name},
                        assigned: false
                      }
                    );
                  }
                }
              );
              this.dataSource = new MatTableDataSource<RowElement>(this.locations);
              
            }
          }



          this.locationFGroup = this.fb.array(this.getLocationControls().map(loc => this.fb.group(loc)));
          this.articleFormGroup = this.fb.group({
            code: [{value:this.article.code, disabled:true }, Validators.required],
            name: [{value:this.article.name, disabled:true } , Validators.required],
            description: [{value:this.article.description, disabled:true }, Validators.required],
            budget_item: [{value:this.article.budget_item.id, disabled:false } , Validators.required],
            controlType : [{value:(this.drugs?this.drugs.control_type_set.id:null), disabled:false } ],
            activePrinciple : [{value:(this.drugs?this.drugs.active_principle_set.id:null), disabled:false } ],
            administrationUnit : [{value:(this.drugs?this.drugs.administration_unit_set.id:null), disabled:false } ],
            administrationWay : [{value:(this.drugs?this.drugs.administration_way_set.id:null), disabled:false } ],
            unity : [{value:this.article.unity.id, disabled:false } , Validators.required],
            priority : [{value:this.article.priority.id, disabled:false } , Validators.required],
            is_refrigerated : [{value:this.article.is_refrigerated, disabled:false } , null],
            is_arsenal : [{value:this.article.is_arsenal, disabled:false } , null],
            is_perishable : [{value:this.article.is_perishable, disabled:false } , null],
            locations: this.locationFGroup
          });
          this.editMode = false;
          for (let i = 0; i < this.locations.length; i++) 
          {
            this.changeLocationAsignation(i);
          }
          this.articleFormGroup.disable();
          this.isLoading = false;
          

        });

      });
   
  }

  getLocationControls():any[]
  {
    let locationControlArray = [];

    for (let i = 0; i < this.locations.length; i++) {

      let location = this.locations[i];
      let isEnabled = location.assigned;

      locationControlArray.push(
        {
          min_stock:[ {value:(location.min_stock?location.min_stock:0), disabled:isEnabled }  ,  [Validators.min(0),Validators.pattern("^[0-9]*$")] ],
          max_stock:[ {value:(location.max_stock?location.max_stock:0), disabled:isEnabled } ,  [Validators.min(0),Validators.pattern("^[0-9]*$")] ],
          critical_stock:[{value:(location.critical_stock?location.critical_stock:0), disabled:isEnabled } ,  [Validators.min(0),Validators.pattern("^[0-9]*$")] ],
          actual_stock:[ {value:(location.actual_stock?location.actual_stock:0), disabled:isEnabled } ,  [Validators.min(0),Validators.pattern("^[0-9]*$")] ],
          assigned:[ location.assigned ,  null ],
          id: [ location.location.id?location.location.id:null , null]
        }        
      );
    }
    

    return locationControlArray;
  }

  changeLocationAsignation(locIndex:number)
  {
    let formControls:any = (this.articleFormGroup.controls['locations'] as FormArray).controls[locIndex] ;
    let checkBoxValue = formControls.controls.assigned.value;

    if(checkBoxValue == true)
    {
      (formControls.controls.actual_stock as FormGroup).enable();
      (formControls.controls.critical_stock as FormGroup).enable();
      (formControls.controls.min_stock as FormGroup).enable();
      (formControls.controls.max_stock as FormGroup).enable();
    }
    else
    {
      (formControls.controls.actual_stock as FormGroup).disable();
      (formControls.controls.critical_stock as FormGroup).disable();
      (formControls.controls.min_stock as FormGroup).disable();
      (formControls.controls.max_stock as FormGroup).disable();
    }

  }

  sendArticle() {

    if(!this.articleFormGroup.invalid)
    {
      console.log(this.articleFormGroup.value);
      let formData = this.articleFormGroup.value;

 
      let locations = [];
      (formData.locations as []).filter( (x:any) => x.assigned == true).map(
        (auxLoc:any) =>
        {
          locations.push(
            {
              location: auxLoc.id,
              actual_stock: auxLoc.actual_stock,
              critical_stock: auxLoc.critical_stock,
              max_stock: auxLoc.max_stock,
              min_stock: auxLoc.min_stock,            
            }
          )
        }
      );

      let articleData =
      {
        code: this.article.code,
        description : this.article.description,
        budget_item : formData.budget_item,
        administration_unit: formData.administrationUnit,
        name: this.article.name,
        group: null,
        active_principle: formData.activePrinciple,
        administration_way: formData.administrationWay,
        control_type: formData.controlType,
        is_refrigerated: formData.is_refrigerated,
        is_arsenal: formData.is_arsenal,        
        is_perishable: formData.is_perishable,
        locations: locations,
        unity: formData.unity,
        priority: formData.priority
      }
      console.log(articleData);


      this.articleService.updateDetail(this.currentModule,this.code,articleData).subscribe(
        (successData) =>
        {
          this.snackBar.open("¡Datos guardados con exito!",null, {
            duration: 4000,
          });        
          this.router.navigate(['/supplying/articles/detail/' + this.code]);
        },
        (error) =>
        {
          this.snackBar.open("ERROR:" + error.error.message.detail,null, {
            duration: 4000,
          });     

          console.error(error);
        }
      )
    }
    else
    {
      this.snackBar.open("Revise los campos del formulario para poder enviar",null, {
        duration: 4000,
      });      
    }

    
  }

  activeEditMode(){
    (this.editMode==false) ? this.editMode = true : this.editMode = false;
    if(this.editMode == true)
    {
      this.articleFormGroup.enable(); 
      for (let i = 0; i < this.locations.length; i++) 
      {
        this.changeLocationAsignation(i);
      }
      (this.articleFormGroup.controls.code as FormControl).disable();
      (this.articleFormGroup.controls.name as FormControl).disable();
      (this.articleFormGroup.controls.description as FormControl).disable();
    }
    else
    {
      this.articleFormGroup.disable();
    }
  }  

  return() {
    this.router.navigate(['/supplying/articles/']);
  }

}
