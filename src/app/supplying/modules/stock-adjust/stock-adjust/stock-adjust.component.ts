import { Component, OnInit, ViewChild } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService, StockInLocation } from 'src/app/supplying/services/movement.service';
import { ArticlesService } from 'src/app/supplying/services/articles.service';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, Validators, FormGroup, FormArray, FormControl } from '@angular/forms';
import { switchMap, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { OrderService } from 'src/app/supplying/services/order.service';
import {merge} from "rxjs";
import { ArticleAutocompleteComponent } from '../../article/article-autocomplete/article-autocomplete.component';

export interface RowElement {
  article: string;
  article_code: string;
  article_name: string;
  quantity: string;
}

@Component({
  selector: 'app-stock-adjust',
  templateUrl: './stock-adjust.component.html',
  styleUrls: ['./stock-adjust.component.scss']
})
export class StockAdjustComponent implements OnInit {

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
  movementDetailFormGroup: FormGroup;
  articleFormGroup: FormGroup;
  articlesFGroup: FormArray;
  dataSend: any = {};
  isLoadingDestinations:boolean = false;

  isService:boolean = false;

  dataSource = new MatTableDataSource<RowElement>([]);
  internal_location: any;
  articleList: any[] = [];

  displayedColumns: string[] = ['article', 'expire_date', 'batch', 'n_serie', 'quantity', 'active', 'actions'];
  today: Date = new Date();
  articleInfo$: any;
  datatable$: any;
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


  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/stock-adjust');

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

    this.articleService.getLocation(this.currentInstitution, SupplyingConstants.ORIGIN_TYPE_INTERNAL).subscribe(
      (results: any) => {
      this.internal_location = results.data.results[0].id
    });

    this.movementFormGroup = this.fb.group({
      origin: [null,Validators.required],
      destination: [null, null],
      articles: this.fb.array([]),
      comment: [null, Validators.required],
      movementType: [null, Validators.required]
    });

    this.articleFormGroup = this.fb.group({
      article: ["", Validators.required],
      batch: ["1", [Validators.pattern("^[0-9]*$")]],
      active: [true],
      quantityInput: ["1", [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
    });

  
    var tasks$ = [];
    tasks$.push(this.movementService.movementTypeByUnique(this.currentInstitution, environment.MOVEMENT_TYPE__UNIQUE_ACCION__STOCK_ADJUST));
    tasks$.push(this.movementService.movementStates());

    forkJoin(...tasks$).subscribe(
      (results: any) => 
      {

        let mType = results[0];
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
          this.movementTypes.push(mType.data.results[i]);
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

      this.articleInfo$ = 
      merge(this.articleFormGroup.get('article').valueChanges,
            this.movementFormGroup.get('movementType').valueChanges).pipe(
        tap(() => this.isLoadingArticleStockInfo = true),
        switchMap( (value:any) => 
        { 
          if(value && value != undefined)
          { 
            console.log('test0');
            console.log(this.movementFormGroup.get('articles'));
            let location_id =  this.movementFormGroup.get('origin').value.id;
            let article_id = value.id;
            let stock = this.movementService.getNextbatchExpire(location_id, article_id).pipe( map( (x:any) => x ));
            return stock
          }
          this.isLoadingArticleStockInfo = false;
          return of(null);
        }),
        tap(() => this.isLoadingArticleStockInfo = false),
      );
    }

    clearForm() : void{

      this.movementFormGroup.reset();
      this.movementFormGroup.updateValueAndValidity();
      this.movementFormGroup = this.fb.group({
        origin: [null,Validators.required],
        destination: [null,Validators.required],
        articles: this.fb.array([]),
        comment: [null, Validators.required],
        movementType: [null, Validators.required]
      });
      this.articleList = [];
      this.dataSource = new MatTableDataSource<RowElement>([]);
      this.movementDefaultInfoSet = false;

    }

    addArticle(articleInfo: any) {
      let article = this.articleList.find(x => x.article == this.articleFormGroup.value.article.id);
      if (!article) {
        for(let i=0; i < articleInfo.data.length; i++){
          let data = articleInfo.data[i];
          console.log(data.expiration_date);
          this.articleList.push(
            { 
              article: this.articleFormGroup.value.article.id, 
              article_name: this.articleFormGroup.value.article.name, 
              article_code: this.articleFormGroup.value.article.code,
              batch: data.batch,
              n_serie: data.n_serie, 
              quantity: data.quantity,
              expire_date: data.expiration_date,
              active: true
            });

            this.movementType$ = this.movementFormGroup.value.movementType.id
            this.movementDetailFormGroup = this.fb.group({
              article:  [{ value: (this.articleFormGroup.value.article.id), disabled: false }, [Validators.min(0), Validators.pattern("^[0-9]*$")]],
              quantity: [{ value: (data.quantity), disabled: false }, [Validators.min(0), Validators.pattern("^[0-9]*$")]],
              batch: [{ value: (data.batch), disabled: false } ],
              n_serie: [{ value: (data.n_serie), disabled: false } ],
              expire_date : [{ value: (data.expiration_date), disabled: false } ],
              unit_value: [{ value: (data.unit_value), disabled: false } ],
              new_quantity: [{ value: (data.quantity), disabled: false }, [Validators.min(0), Validators.pattern("^[0-9]*$")]],
              new_batch: [{value: (data.batch), disabled: false }],
              new_n_serie: [{ value: (data.n_serie), disabled: false }],
              new_expire_date: [{value: (this.datePipe.transform(data.expiration_date, 'yyyy-MM-ddTHH:mm:ss')), disabled: false }],
              new_unit_value: [{ value: (data.unit_value), disabled: false } ],
              active: [{ value: true , disabled: false } ]
            });
            (this.movementFormGroup.get('articles') as FormArray).push(this.movementDetailFormGroup);
            this.movementFormGroup.updateValueAndValidity();
          }

        if(!this.articleList.length){
          this.snackBar.open("Error: Este articulo no tiene stock, favor seguir el flujo de abastecimiento.", null, {
            duration: 4000,
          });
        }
        this.dataSource = new MatTableDataSource<RowElement>(this.articleList);
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
  
    }

    deactivateArticle(ind: number) {
      let i=0;
      for (let val of (this.movementFormGroup.get('articles') as FormArray).value)
      {
        if (ind==i) 
        {
          val.active=false;
        }
        i++
      }
      this.articleList.map((x:any, j) => 
      {
        if(ind==j){
          x.active=false
        }
      });
      this.dataSource = new MatTableDataSource<RowElement>(this.articleList);
    }

    activateArticle(ind: number) {
      let i=0;
      for (let val of (this.movementFormGroup.get('articles') as FormArray).value)
      {
        if (ind==i) 
        {
          val.active=true;
        }
        i++
      }
      this.articleList.map((x:any, i) => 
      {
        if(ind==i){
          x.active=true
        }
      });
      this.dataSource = new MatTableDataSource<RowElement>(this.articleList);
    }

    // send form
    send() {
      let items = {}
      let articles = [];
      items = (this.movementFormGroup.value.articles as []).map(
        (x:any) =>
        { 
          if(x.active){
            articles.push(
              {
                article: x.article,
                quantity: x.quantity,
                batch: x.batch,
                expire_date : x.expire_date,
                n_serie: x.n_serie,
                unit_value: x.unit_value,
                new_quantity: x.new_quantity,
                new_batch: x.new_batch,
                new_n_serie: x.new_n_serie,
                new_expire_date : x.new_expire_date,
                new_unit_value: x.new_unit_value,
                comment_mov_detail: "Ajuste de stock"
            })
          }
          return articles
        }
      );
      this.dataSend = {};
      this.dataSend.is_service  = false;
      this.dataSend.movement_state_id = SupplyingConstants.MOVEMENT_STATE_ORDER_SENT;
      this.dataSend.movement_type_id = this.movementFormGroup.value.movementType.id;
      this.dataSend.user = this.currentUser.id;
      this.dataSend.institution = this.currentInstitution;
      this.dataSend.comment = this.movementFormGroup.value.comment; 
      
      this.dataSend.destination = this.internal_location;
      this.dataSend.origin = this.movementFormGroup.value.origin.id;
      this.dataSend.movement_detail = articles
      this.dataSend.correlative = 0;
      this.dataSend.date        = this.datePipe.transform(this.today, 'yyyy-MM-dd HH:mm:ss');
      this.dataSend.state_date  = this.datePipe.transform(this.today, 'yyyy-MM-dd HH:mm:ss');
      this.dataSend.dispatch = true
      
      if(this.articleList.length > 0){
        if(this.movementFormGroup.get('movementType')){
          console.log('seteando...')
          this.movementService.setAdjustStock(this.dataSend, this.currentModule).subscribe(
            (successData:any) => {
              this.snackBar.open("¡Datos guardados con exito!", null, {
                duration: 4000,
              });
              console.log('borrandooo...');
              this.movementFormGroup.reset();
              this.movementFormGroup = this.fb.group({
                origin: [null,Validators.required],
                destination: [null,null],
                articles: this.fb.array([]),
                comment: [null, Validators.required],
                movementType: [null, Validators.required]
              });
              this.articleList = [];
              this.dataSource = new MatTableDataSource<RowElement>([]);
              this.movementDefaultInfoSet = false;
              this.movementFormGroup.updateValueAndValidity();
              this.router.navigate(['/supplying/stock-adjust']);      
            },
            (errorData) => {
              this.snackBar.open(errorData.error.message.detail, null, {
                duration: 4000,
              });
            });
        }else{
          this.snackBar.open("Error: Debe seleccionar un tipo de movimiento", null, {
            duration: 4000,
          });
        }
      }else{
        this.snackBar.open("Error: Se debe enviar almenos 1 artículo para ajustar", null, {
          duration: 4000,
        });
      }

      return this.dataSend;
  
    }


    removeFilter( filter: FormControl )
    {
      filter.setValue(null);
    }

  }