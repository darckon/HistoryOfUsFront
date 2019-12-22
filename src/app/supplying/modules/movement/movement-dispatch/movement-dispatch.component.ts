import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService, StockInLocation } from 'src/app/supplying/services/movement.service';
import { ArticlesService } from 'src/app/supplying/services/articles.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { debounceTime, switchMap, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { DatePipe } from '@angular/common';
import { forkJoin, of, empty } from 'rxjs';
import { OrderService } from 'src/app/supplying/services/order.service';
import {merge} from "rxjs";
import { ArticleAutocompleteComponent } from '../../article/article-autocomplete/article-autocomplete.component';
import { saveAs } from 'file-saver';

export interface RowElement {
  article: string;
  article_code: string;
  article_name: string;
  quantity: string;
}

@Component({
  selector: 'app-movement-dispatch',
  templateUrl: './movement-dispatch.component.html',
  styleUrls: ['./movement-dispatch.component.scss']
})
export class MovementDispatchComponent implements OnInit {

  @ViewChild(ArticleAutocompleteComponent, { static: false }) articleAutocompleteComponent: ArticleAutocompleteComponent;

  isLoading: boolean = false;
  canRecept: boolean = true;

  currentModule: ModuleInfo = null;
  locations: any[] = [];
  costCenters: any[] = [];
  
  destinations$: any;
  movementType$:any;

  transactions: any[] = [];
  localMovementStates: any[] = [];
  movementTypes: any[] = [];
  currentUser: any;
  currentInstitution: number = null;
  currentProfileData: any;
  movementFormGroup: FormGroup;
  articleFormGroup: FormGroup;
  articlesFGroup: FormArray;
  dataSend: any = {};
  isLoadingDestinations:boolean = false;

  isService:boolean = false;

  dataSource = new MatTableDataSource<RowElement>([]);
  articleList: any[] = [];

  displayedColumns: string[] = ['article_code', 'article_name','stock', 'quantity', 'actions'];
  today: Date = new Date();
  articleInfo$: any;
  isLoadingArticleStockInfo: boolean;
  movementDefaultInfoSet: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private ordersService: OrderService,
    private articleService: ArticlesService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) { }


  getOrigins()
  {
    
    let origin        = this.movementFormGroup.get('origin').value;
    let movementType  = this.movementFormGroup.get('movementType').value;
    console.log(movementType);

    this.movementFormGroup.get('reverse_origin').setValue(false);

    if(movementType!=null && origin!=null)
    {

      this.movementFormGroup.controls["_origin"].setValue(origin);
      this.movementFormGroup.controls['_destination'].setValue(this.movementFormGroup.get('destination').value);
      this.isService = movementType.institution_movement_type[0].location_type == SupplyingConstants.ORIGIN_TYPE_COST_CENTER ? true : false;

      console.log(movementType);

      return this.movementService.searchDestinations(origin.id, movementType.institution_movement_type[0].location_type, this.currentInstitution.toString()).pipe(
        map( (result:any) => 
            {
              let aux:any = result;
              aux.data = result.data.map(
                (x) => {return  {...x, type: x.location_type} }
              )
              return aux;
            }
          
        )
      );
      
    }
    else
    {
      return of([]);
    }

  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();


    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/movement/create');

    this.isLoading = true;
    this.canRecept = true;


    this.userService.getUserLocations().map((x: any) => {
      if (x.type.id == SupplyingConstants.ORIGIN_TYPE_CELLAR && x.is_active == true) {
        this.locations.push(x);
      }
    });

    this.userService.getUserCostCenter().map((x: any) => {
      if (x.type.id == SupplyingConstants.ORIGIN_TYPE_COST_CENTER && x.is_active == true) {
        this.costCenters.push(x);
      }
    });

    this.movementFormGroup = this.fb.group({
      origin: [null,Validators.required],
      destination: [null,Validators.required],
      articles: this.fb.array([]),
      comment: [null, null],
      _origin: [null, null],
      _destination: [null, null],
      movementType: [null, Validators.required],
      reverse_origin: [false, null]
    });

    this.articleFormGroup = this.fb.group({
      article: ["", Validators.required],
      quantityInput: ["1", [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
    });

  
    var tasks$ = [];
    tasks$.push(this.movementService.movementType(this.currentInstitution));
    tasks$.push(this.movementService.movementStates());


    this.destinations$ = 
    merge(this.movementFormGroup.get('origin').valueChanges, 
          this.movementFormGroup.get('movementType').valueChanges)
    .pipe(
      tap( () => this.isLoadingDestinations = true),
      switchMap((value: string) => 
      {
        return this.getOrigins();
      }),
      tap( () => this.isLoadingDestinations = false),
    );

    this.movementFormGroup.get('destination').valueChanges.subscribe(
      (value)=>
      {

        if(value == null)
        {
          console.log("============");
          this.getOrigins();
          return;
        }
          

        let origin        = this.movementFormGroup.get('origin').value;
        let movementType  = this.movementFormGroup.get('movementType').value;
    
        if(movementType!=null && origin!=null)
        {
          this.movementFormGroup.controls["_origin"].setValue(origin);
          this.movementFormGroup.controls['_destination'].setValue(this.movementFormGroup.get('destination').value);
          this.isService = movementType.location_type == SupplyingConstants.ORIGIN_TYPE_COST_CENTER ? true : false;
        }
      }
    )

    forkJoin(...tasks$).subscribe(
      (results: any) => 
      {
        let mType          = results[0];
        results[1].data.filter((type: any) => !type.public_market_code).map(
          (status) => 
          {
            let searchType = status.movement_type_state.find(
              (type_state) => 
              {
                return (type_state.is_final == false)
              });
            if (searchType)
              this.localMovementStates.push(status);
            
        });

        for(let i=0; i < mType.data.count; i ++){
          if(mType.data.results[i].type_unique_accion == environment.MOVEMENT_TYPE_ORDER || mType.data.results[i].type_unique_accion == environment.MOVEMENT_TYPE_MOVEMENT){
            this.movementTypes.push(mType.data.results[i]);
          }
        }

        this.dataSource = new MatTableDataSource<RowElement>([]);

      },
      (error)=>
      {
        console.log("Error al procesar consulta: " + error);  
      },
      ()=>
      {
        this.isLoading = false;
      });

      this.articleInfo$ = this.articleFormGroup.get('article').valueChanges.pipe(
        tap(() => this.isLoadingArticleStockInfo = true),
        switchMap( (value:any) => 
        { 
          if(value && value != undefined)
          {
            let stockItems:StockInLocation[] = [{  location_id: this.movementFormGroup.get('origin').value.id , article_id:value.id}];
            return this.movementService.getArticlesInLocation(stockItems).pipe( map( (x:any) => (x.status==true)?x.data[0]:null ) );
          }
          this.isLoadingArticleStockInfo = false;
          return of(null);
        }),
        tap(() => this.isLoadingArticleStockInfo = false),
      );
  }

  addArticle(articleInfo: any) {

    let article = this.articleList.find(x => x.article == this.articleFormGroup.value.article.id);
    if (!article) {
      let quantity = this.articleFormGroup.value.quantityInput;
      this.articleList.push({ article: this.articleFormGroup.value.article.id, article_code: this.articleFormGroup.value.article.code, article_name: this.articleFormGroup.value.article.name, quantity: this.articleFormGroup.value.quantityInput, article_max_stock: articleInfo.real_stock , comment_mov_detail: null });
      this.articleFormGroup.get('article').setValue("");
      this.articleFormGroup.get('quantityInput').setValue("1");
      this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

      let FormGroup = this.fb.group(
        {
          quantity: [{ value: (quantity), disabled: false }, [Validators.min(0), Validators.max(articleInfo.real_stock) ,Validators.pattern("^[0-9]*$")]],
        });
      (this.movementFormGroup.get('articles') as FormArray).push(FormGroup);
      this.movementFormGroup.updateValueAndValidity();

      if (this.articleList.length == 1) {
        this.movementFormGroup.get('_origin').setValue(this.movementFormGroup.value.origin);
        this.movementFormGroup.get('_destination').setValue(this.movementFormGroup.value.destination);
      }

    }
    else {
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }

    if (this.articleList.length >= 1) 
    {
      this.movementDefaultInfoSet = true;
    }
    else 
    {
      this.movementDefaultInfoSet = false;
    }

  }

  removeArticle(ind: number) {

    (this.movementFormGroup.get('articles') as FormArray).removeAt(ind);
    this.articleList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

    if (this.articleList.length == 0) {
      this.movementFormGroup.get('origin').enable();
      this.movementFormGroup.get('destination').enable();
      this.movementFormGroup.get('movementType').enable();
      this.movementDefaultInfoSet = true;
    }

  }

  send() {

    let items = {}


    items = this.movementFormGroup.value.articles.map(
      (x: any, index) => {
        let article = this.articleList[index];
        article.quantity = x.quantity;
        return article;
      }
    )

    this.dataSend.is_service  = (this.movementFormGroup.value._origin.type == SupplyingConstants.ORIGIN_TYPE_COST_CENTER ? true : false );
    
    this.dataSend.movement_type_id = this.movementFormGroup.value.movementType.id;

    this.dataSend.user = this.currentUser.id;
    this.dataSend.institution = this.currentInstitution;
    this.dataSend.comment = this.movementFormGroup.value.comment; 

    let isReversed = this.movementFormGroup.value.reverse_origin;
    let state_id : number = 0;

    if (this.dataSend.movement_type_id  == SupplyingConstants.MOVEMENT_TYPE_CELLAR){
      state_id =  SupplyingConstants.MOVEMENT_STATE_ORDER_SENT;

    }else if (this.dataSend.movement_type_id  == SupplyingConstants.MOVEMENT_TYPE_LOAN){
      if(isReversed){
        state_id =  SupplyingConstants.MOVEMENT_STATE_LOAN_TO_CELLAR;
      }else{
        state_id =  SupplyingConstants.MOVEMENT_STATE_LOAN_TO_INSTITUTION;
      }
      
      
    }else if (this.dataSend.movement_type_id  == SupplyingConstants.MOVEMENT_TYPE_DEVOLUTION){
      if(isReversed){
        state_id =  SupplyingConstants.MOVEMENT_STATE_DEVOLUTION_TO_CELLAR;
      }else{
        state_id =  SupplyingConstants.MOVEMENT_STATE_DEVOLUTION_TO_INSTITUTION;
      }
      
    }else{
      state_id = SupplyingConstants.MOVEMENT_STATE_REQUESTED
    }

    this.dataSend.movement_state_id = state_id;

    if(isReversed)
    {
      this.dataSend.destination   = (this.movementFormGroup.value._origin.type.id == SupplyingConstants.ORIGIN_TYPE_CELLAR ? this.movementFormGroup.value._origin.id : this.movementFormGroup.value._origin.location_id );
      this.dataSend.origin        = this.movementFormGroup.value._destination.id;
      
    }
    else
    {
      this.dataSend.origin      = (this.movementFormGroup.value._origin.type.id == SupplyingConstants.ORIGIN_TYPE_CELLAR ? this.movementFormGroup.value._origin.id : this.movementFormGroup.value._origin.location_id );
      this.dataSend.destination = this.movementFormGroup.value._destination.id;
    }



    this.dataSend.movement_detail = items;
    this.dataSend.correlative = 0;
    this.dataSend.date        = this.datePipe.transform(this.today, 'yyyy-MM-dd HH:mm:ss');
    this.dataSend.state_date  = this.datePipe.transform(this.today, 'yyyy-MM-dd HH:mm:ss');

    this.ordersService.create(this.dataSend).subscribe(
      (successData:any) => {
        this.openDialog(successData);
        this.snackBar.open("¡Datos guardados con exito!", null, {
          duration: 4000,
        });
        this.router.navigate(['/supplying/dispatches/detail/' + successData.data.id]);      
      },
      (errorData) => {
        this.snackBar.open(errorData.error.message.detail, null, {
          duration: 4000,
        });
      });
    return this.dataSend;

  }

  clearForm() : void{

    this.movementFormGroup.reset();
    this.articleList = [];
    this.dataSource = new MatTableDataSource<RowElement>(this.articleList);
    this.movementDefaultInfoSet = false;

  }

  openDialog(data: any): void {
    const dialogRef = this.dialog.open(MovementNewDialog, {
      width: '450px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      this.snackBar.open("¡Datos guardados con exito!", null, {
        duration: 4000,
      });
      this.router.navigate(['/supplying/dispatches/detail/' + result.id]);
    });
  }

  removeMovementFilters() 
  {
    this.movementFormGroup.get('origin').setValue(null);
    this.movementFormGroup.get('destination').setValue(null);
    this.movementFormGroup.get('movementType').setValue(null);
  }

}

export interface MovementNewDialogData {
  orderId: any;
}

@Component({
  selector: 'movement-new-dialog',
  templateUrl: './movement-new-dialog.html',
})
export class MovementNewDialog {
  correlative: string;

  constructor(
    public dialogRef: MatDialogRef<MovementNewDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: MovementNewDialog) {
    this.correlative = data.correlative;
  }

  accept() {
    let data: any = this.data.data;
    this.correlative = data.correlative;
    this.dialogRef.close(data);
  }
  
}