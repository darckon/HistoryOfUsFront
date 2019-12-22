import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MovementService } from '../../../services/movement.service';
import { FormBuilder } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ArticlesService } from '../../../services/articles.service';


export interface RowElement {
  id: string;
  code: string;
  comment: string;
  created_at: string;
  movement_document: any;
}

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.scss']
})
export class PurchaseOrdersComponent implements OnInit {

  currentProfileData: any;
  currentInstitution: string = null;
  displayedColumns: string[] = ['code', 'status', 'comment', 'provider', 'purchase_amount', 'created_at', 'actions'];
  dataSource = new MatTableDataSource<RowElement>([]);
  itemsPerpage: number = 10;
  pageNumber: any;

  currentModule: ModuleInfo = null;
  providerReturnModule: ModuleInfo = null;


  manualPage = null;

  page: any;
  results: any[] = [];

  applyFilter: any;
  filters: any = null;
  filteredProviders: any;
  filteredArticles: any;
  filterGroup: any;

  option: string = 'ARTICLE';

  selectedTransfer: any = null;

  localMovementStates: any[] = [];
  PublicMarketStates: any[] = [];
  Buyers: any[] = [];

  isLoading: boolean = false;
  articlesLoading: boolean = false;
  providersLoading: boolean = false;

  withIva: boolean = false;

  // permissions
  can_viewDetail: ModuleInfo = null;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  manualOcModule: ModuleInfo;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private translate: TranslateService,
    private purchaseOrderService: MovementService
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('es');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('es');
  }

  displayFn(provider?: any): string | undefined {
    return provider ? provider.business_name : undefined;
  }

  displayFnArticle(codeArticle?: any): string | undefined {
    return codeArticle ? codeArticle.name : undefined;
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.currentProfileData   = this.userService.getCurrentProfile();
    this.currentInstitution   = this.userService.getCurrentUserInstitutionId();

    this.currentModule        = this.moduleManagerService.getModuleByInternalUrl("supplying/purchase-orders");
    this.providerReturnModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/return'); 
    this.manualOcModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/manual'); 
    this.can_viewDetail = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/detail'); 

    this.filterGroup = this.fb.group({
      provInput: null,
      initDateInput: null,
      endDateInput: null,
      statusInput: null,
      codeInput: null,
      codeArticleInput: null,
      buyerInput: null,
      transferRadioButton: null
    })
    this.getTable("1", this.filters);

    this.purchaseOrderService.movementStates().subscribe(
      (successData: any) => {
        let data = successData.data;

        data.map(
          (status) => {
            if (status.public_market_code) {
              this.PublicMarketStates.push(status);
            }
            else {
              this.localMovementStates.push(status);
            }

          }
        );
      },
      (errorData) => {

      },
      () => {

      }
    );

    this.purchaseOrderService.listBuyers().subscribe(
      (successData: any) => {
        let data = successData.data;
        data.map(
          (status) => {
            this.Buyers.push(status);
          }
        );
      },
      (errorData) => {

      },
      () => {

      }
    );

  }

  loadDataWithFilter() {
    this.filters = {
      provider: this.filterGroup.value.provInput,
      startDate: this.filterGroup.value.initDateInput,
      endDate: this.filterGroup.value.endDateInput,
      status: this.filterGroup.value.statusInput,
      code: this.filterGroup.value.codeInput,
      codeArticleService: this.filterGroup.value.codeArticleInput,
      buyer: this.filterGroup.value.buyerInput,
      is_article: (this.option=='ARTICLE')?true:false
    }
    
    
    this.getTable("1", this.filters);
  }

  loadPageData(pageEvent: PageEvent) {
    this.getTable((this.paginator.pageIndex + 1).toString(), this.filters);
  }

  getTable(page: string = "1", filters = null) {
    this.isLoading = true;
    this.purchaseOrderService.documents(this.currentModule, this.currentInstitution, page, filters).subscribe(
      (ocSuccess: any) => {
        console.log(ocSuccess);
        this.results = ocSuccess.data.results;
        this.dataSource = new MatTableDataSource<RowElement>(this.results);
        this.pageNumber = (ocSuccess.data.count).toFixed(0);
      },
      (error) => {
        this.isLoading = false;
        console.log("Error al procesar consulta");
      },
      () => {
        this.isLoading = false;
      }

    );
  }
}
