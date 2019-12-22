import { Component, OnInit, ViewChild } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ArticlesService } from 'src/app/supplying/services/articles.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { ArticleAutocompleteComponent } from '../../article/article-autocomplete/article-autocomplete.component';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { debounceTime, switchMap, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';
import { DatePipe } from '@angular/common';
import { of, merge, forkJoin } from 'rxjs';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { AgreementService } from 'src/app/supplying/services/agreement.service';

export interface RowElement {
  article: string;
  article_code: string;
  article_name: string;
  quantity: string;
}

@Component({
  selector: 'app-manual-purchase-order',
  templateUrl: './manual-purchase-order.component.html',
  styleUrls: ['./manual-purchase-order.component.scss']
})
export class ManualPurchaseOrderComponent implements OnInit {

  @ViewChild(ArticleAutocompleteComponent, { static: false }) articleAutocompleteComponent: ArticleAutocompleteComponent;

  isLoading: boolean = false;
  isService: boolean = false;
  currentModule: ModuleInfo = null;

  dataSource = new MatTableDataSource<RowElement>([]);
  articleList: any[] = [];

  currentUser: any;
  currentInstitution: number = null;
  currentProfileData: any;

  movementFormGroup: FormGroup;
  articleFormGroup: FormGroup;
  articlesFGroup: FormArray;
  dataSend: any = {};
  tax: any[] = [];

  displayedColumns: string[] = ['article_code', 'article_name', 'quantity', 'unit_value', 'subtotal', 'actions'];
  today: Date = new Date();
  articleInfo$: any;
  isLoadingArticleStockInfo: boolean;

  totalSum:number = 0;
  currentTaxPerc: number = 0;
  totalTax: number = 0;
  taxDefault:any = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private articleService: ArticlesService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private agreementService: AgreementService,) { }

  recalculateSums()
  { 
    this.calculateSums();
  }

  calculateSums() {
    let id = this.movementFormGroup.value.tax_category;
    this.totalSum = 0;
    this.movementFormGroup.value.articles.map(
      (x: any, index) => {
        this.totalSum = this.totalSum + x.quantity * x.unit_value;
      }
    );

    if (id == SupplyingConstants.TAX_CATEGORY_EXENT) {
      this.totalTax = 0;
      this.movementFormGroup.value.iva_percentage = 0;
    } else if (id == SupplyingConstants.TAX_CATEGORY_IVA) {
      this.totalTax = parseInt((this.totalSum * 0.19).toFixed(0));
      this.movementFormGroup.value.iva_percentage = 19;
    } else if (id == SupplyingConstants.TAX_CATEGORY_10) {
      this.totalTax = parseInt((((this.totalSum / (0.90)) - this.totalSum)).toFixed(0));
      this.movementFormGroup.value.iva_percentage = 10;
    }

  }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    var tasks$ = [];
    tasks$.push(this.agreementService.getTax());
    forkJoin(...tasks$).subscribe(
      (results: any) => {
        this.tax = results[0].data.results;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      });

  

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/manual');

    this.isLoading = true;

    this.movementFormGroup = this.fb.group({
      provider: [null,Validators.required],
      comment: [null, null],
      name: [null, Validators.required],
      iva_percentage: [0, null],
      tax_category: [1, Validators.required],
      is_service: [false, Validators.required],
      articles: this.fb.array([]),
    });

    this.articleFormGroup = this.fb.group({
      article: ["", Validators.required],
      quantityInput: [1, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      unit_value: [0, [Validators.min(0) ,Validators.pattern("^[0-9]*$")] ],
    });

    this.dataSource = new MatTableDataSource<RowElement>([]);
    this.isLoading = false;

    this.articleInfo$ = this.articleFormGroup.get('article').valueChanges.pipe(
      tap(() => this.isLoadingArticleStockInfo = true),
      switchMap( (value:any) => 
      { 

        this.isLoadingArticleStockInfo = false;
        return of(null);
      }),
      tap(() => this.isLoadingArticleStockInfo = false),
    );


  


  }

  addArticle(articleInfo: any) {

    console.log(this.articleFormGroup.value);

    let article = this.articleList.find(x => x.article == this.articleFormGroup.value.article.id);
    if (!article) {


      let quantity = this.articleFormGroup.value.quantityInput;
      let unit_value =  this.articleFormGroup.value.unit_value;
  
      this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

      
      let FormGroup = this.fb.group(
        {
          unit_value: [{ value: (unit_value), disabled: false }, [Validators.min(0),Validators.required ,Validators.pattern("^[0-9]*$")] ],
          quantity: [{ value: (quantity), disabled: false }, [Validators.min(0), Validators.required ,Validators.pattern("^[0-9]*$")]],
          id: [this.articleFormGroup.value.article.id, null]
        });

 
      this.articleList.push({ article: this.articleFormGroup.value.article.id, article_code: this.articleFormGroup.value.article.code, article_name: this.articleFormGroup.value.article.name, quantity: this.articleFormGroup.value.quantityInput,comment_mov_detail: null });
      this.articleFormGroup.get('article').setValue("");
      this.articleFormGroup.get('quantityInput').setValue("1");
      this.articleFormGroup.get('unit_value').setValue("0");

      (this.movementFormGroup.get('articles') as FormArray).push(FormGroup);

      this.isService = this.movementFormGroup.value.is_service;
      this.movementFormGroup.updateValueAndValidity();
      this.recalculateSums();
    }
    else {
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }

  }

  removeArticle(ind: number) {

    (this.movementFormGroup.get('articles') as FormArray).removeAt(ind);
    this.articleList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

    this.recalculateSums();
  }

  send() {
    if(this.movementFormGroup.valid)
    {
      let items = {}
      let dataSend:any = {};
      let order:any = {};


      items = this.movementFormGroup.value.articles.map(
        (x: any, index) => {
          let article = this.articleList[index];
          article.quantity =  parseInt(x.quantity);
          article.p_unit =  parseInt(x.unit_value); //Math.floor(parseInt(x.unit_value)/(1+this.currentTaxPerc));
          article.id = x.id;
          return article;
        }
      );
     

      order.iva_percentage = parseInt(this.movementFormGroup.value.iva_percentage);
      order.comment = "";
      order.institution = this.currentInstitution;
      order.user = this.currentUser.id;

      let realSum = this.totalSum;
      
      let orderDetail = {
        name: this.movementFormGroup.value.name,
        comment: this.movementFormGroup.value.comment,
        provider_id: this.movementFormGroup.value.provider.id,
        is_article: !this.isService,
        purchase_amount: realSum,
        items: items
      };


      dataSend.order_detail = orderDetail;
      dataSend.order = order;
      


      console.log(dataSend);

      this.movementService.create(dataSend,this.currentModule).subscribe(
        (successData:any) => {
          this.router.navigate(['/supplying/purchase-orders/detail/' + successData.data.code]);
          this.snackBar.open("Orden de compra creada con éxito.", null, {
            duration: 4000,
          });
        },
        (errorData) => {
          this.snackBar.open(errorData.error.message.detail, null, {
            duration: 4000,
          });
        });
      return this.dataSend;



    }
  }

  clearForm() : void{

    this.articleList = [];
    this.dataSource = new MatTableDataSource<RowElement>(this.articleList);
    this.totalSum = 0;

    this.isService = false;


    this.movementFormGroup.reset();
    this.articleFormGroup.reset();
    this.movementFormGroup.get('is_service').setValue(false);
    

  }

}
