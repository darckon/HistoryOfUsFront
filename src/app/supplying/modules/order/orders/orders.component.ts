import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { TranslateService } from '@ngx-translate/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { OrderService } from 'src/app/supplying/services/order.service';
import { MatTabChangeEvent, MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { debounceTime, switchMap, filter, tap, finalize } from 'rxjs/operators';
import { FilterSearchDataService } from 'src/app/core/services/general/filter-search-data.service';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants';
import { of, empty } from 'rxjs';

export interface RowElement {
  id: number;
  destination: string;
  origin: string;
  created_at: string;
  movement_state_name: any;
  user:any;
  comment: string;
  destination_name: string;
  origin_name: string;
  is_arsenal: boolean;
  state_movement_historical:any;
  correlative:string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, AfterViewInit {

  filterGroup: FormGroup;
  currentUser: any;
  currentInstitution: any;
  currentProfileData: any;
  currentModule: ModuleInfo;
  
  isLoadingPage: boolean = true;
  isLoadingData: boolean = false;
  isLoadingDestinations: boolean = false;
  noData:boolean = true;

  results: any;
  page: any;

  currentTab:number = 0;
  currentFilterData:any = {};
  pageNumber: any;

  locations: any[] = [];
  costCenters: any[] = []; 
  destinations$: any;

  // permissions
  priv_detail: ModuleInfo;
  
  dataSource = new MatTableDataSource<RowElement>([]);
  displayedColumns: string[] = ['id','comment','status','origin_name','destination_name','created_at', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  createModule: ModuleInfo;
  
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private translate: TranslateService,
    private ordersService: OrderService,
    private filterSearchDataService: FilterSearchDataService
  ){ 
    translate.setDefaultLang('es');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('es');    
    this.currentUser          = this.userService.getCurrentUserData();
    this.currentInstitution   = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData   = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl("supplying/orders");
    this.createModule = this.moduleManagerService.getModuleByInternalUrl("supplying/orders/create");
    this.priv_detail = this.moduleManagerService.getModuleByInternalUrl("supplying/orders/detail");

    
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
  }

  ngOnInit() 
  {
    this.dataSource.paginator = this.paginator;
    let today = new Date();
    let date = new Date(today.setDate(today.getDate()-7));

    this.filterGroup = this.fb.group({
      origin: [null, Validators.required],
      destination: null,
      initDateInput: [date,Validators.required],
      endDateInput: [new Date(),Validators.required],
      orderCodeInput: null
    })

    this.isLoadingPage = false;

    this.destinations$ = this.filterGroup
    .get('origin')
    .valueChanges
    .pipe(
      tap(() => this.isLoadingDestinations = true),
      switchMap( (value:string) => 
                  { 
                    if(value)
                    {
                      let origin_id;
                      this.filterGroup.controls['destination'].setValue(null);
                      //if(this.filterGroup.value.origin.type == SupplyingConstants.ORIGIN_TYPE_CELLAR){
                        origin_id = this.filterGroup.value.origin.id;
                      //}else{
                      //  origin_id = this.filterGroup.value.origin.location_id;
                      //}
                      return this.ordersService.searchDestinations(origin_id,this.filterGroup.value.origin.type.id,this.currentInstitution);
                    }
                    this.isLoadingDestinations = false;
                    this.filterGroup.get('destination').setValue(null);
                    return empty();

                  }
                ),
      tap(() => this.isLoadingDestinations = false),
      );
  }

  ngAfterViewInit()
  {

    let savedData = this.filterSearchDataService.getFilterData(this.currentModule.name);
    let savedPage = this.filterSearchDataService.getFilterPage(this.currentModule.name);
    if(savedData && savedData.form)
    {
      this.isLoadingPage = true;
      this.filterGroup.patchValue( savedData.form );
      this.currentFilterData.state_attribute = savedData.state_attribute;
      this.filterGroup.get('initDateInput').setValue(new Date(savedData.form.initDateInput));
      this.filterGroup.get('endDateInput').setValue(new Date(savedData.form.endDateInput));

      if(savedPage)
        this.paginator.pageIndex = parseInt(savedPage);
      else
        this.paginator.pageIndex = 0;

      this.loadTable();
    }

  }

  loadPageData() {
    this.filterGroup.updateValueAndValidity();
    if( this.filterGroup.valid )
    {
      let formData = 
      {
        form: this.filterGroup.value,
        state_attribute: this.currentTab+1
      }
      this.filterSearchDataService.setFilterData(this.currentModule.name,formData,(this.paginator.pageIndex).toString());
      this.loadTable();
    }
  }


  loadTable()
  {
    this.isLoadingData = true;
    
    this.currentFilterData = this.filterGroup.value;
    this.currentFilterData.state_attribute = this.currentTab+1;
    if(this.currentFilterData)
    {
      if
      ( 
          this.currentFilterData.origin.id != this.filterGroup.value.origin.id  
          //|| this.currentFilterData.destination != this.filterGroup.value.destination 
          || this.currentFilterData.initDateInput != this.filterGroup.value.initDateInput
          ||  this.currentFilterData.endDateInput != this.filterGroup.value.endDateInput)
          //|| this.currentFilterData.state_attribute != this.filterGroup.value.state_attribute )
      {
        this.paginator.pageIndex = 0;
      }
    }


    
    //let formData = 
    //{
    //  origin: this.currentFilterData.destination.id,
    //  destination: this.currentFilterData.origin,
    //  initDateInput: this.currentFilterData.initDateInput,
    //  endDateInput: this.currentFilterData.endDateInput,
    //  state_attribute: this.currentFilterData.state_attribute
    //}

    this.ordersService.orders(this.currentModule,(this.paginator.pageIndex + 1).toString(), this.currentFilterData = this.filterGroup.value, this.currentInstitution).subscribe(
      (ocSuccess: any) => {
        if(ocSuccess.status){
          this.results    = ocSuccess.data.results;
          this.dataSource = new MatTableDataSource<RowElement>(this.results);
          this.pageNumber = (ocSuccess.data.count).toFixed(0);
          this.noData        = false;
          this.isLoadingData = false;
        }else{
          this.isLoadingData = false;
          this.noData        = true;
          this.paginator.pageIndex = 0;
        }
      },
      (error) => {
        this.isLoadingData = false;
        this.noData        = true;
        this.paginator.pageIndex = 0;
      },
      () => {
        this.isLoadingData = false;
      }
    );
  }

  sendForm()
  {
    if( this.filterGroup.valid )
    {
      
      let formData = 
      {
        form: this.filterGroup.value,
        state_attribute: this.currentTab+1
      }
      this.filterSearchDataService.setFilterData(this.currentModule.name,formData,(this.paginator.pageIndex).toString());
      this.loadTable();
    }
  }

  public tabChanged(tabChangeEvent: MatTabChangeEvent): void 
  {
    if( this.currentFilterData )
    {
      this.currentTab = tabChangeEvent.index;
      this.currentFilterData.state_attribute = this.currentTab+1;
      this.paginator.pageIndex = 0;
      this.pageNumber = 0;

      this.filterSearchDataService.setFilterData(this.currentModule.name,this.currentFilterData,(this.paginator.pageIndex).toString())
      this.loadTable();
    }
    
  }

  removeFilter( filter: FormControl )
  {
    filter.setValue(null);

  }

}
