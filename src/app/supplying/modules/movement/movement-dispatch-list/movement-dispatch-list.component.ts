import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatTabChangeEvent, MatTableDataSource, MatPaginator, PageEvent, MatSnackBar, MatDialog } from '@angular/material';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { TranslateService } from '@ngx-translate/core';
import { OrderService } from 'src/app/supplying/services/order.service';
import { environment } from 'src/environments/environment';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { FilterSearchDataService } from 'src/app/core/services/general/filter-search-data.service';
import { MovementDispatchListConsolidatedDialog } from './movement-dispatch-list-consolidated-dialog.component';

export interface RowElement {
  id: number;
  destination: string;
  origin: string;
  created_at: string;
  movement_type: any;
  user: any;
  comment: string;
  destination_name: string;
  origin_name: string;
  is_arsenal: boolean;
  state_movement_historical: any;
}

@Component({
  selector: 'app-movement-dispatch-list',
  templateUrl: './movement-dispatch-list.component.html',
  styleUrls: ['./movement-dispatch-list.component.scss']
})
export class MovementDispatchListComponent implements OnInit {
  pageEvent: any;
  filterGroup: FormGroup;
  currentUser: any;
  currentInstitution: any;
  currentProfileData: any;
  currentModule: ModuleInfo;

  isLoadingPage: boolean = true;
  isLoadingData: boolean = false;
  noData: boolean = true;

  results: any;
  page: any;
  
  currentTab:number = 0;
  currentFilterData: any = null;
  pageNumber: any;
  nextEnumeratorPage: number = 0;

  locations: any = [];
  movementType: any = [];

  consolidatedList:any[] = [];

  // permissions
  priv_canDispatch: ModuleInfo = null;
  priv_canConsilidate: ModuleInfo = null;

  dataSource = new MatTableDataSource<RowElement>([]);
  displayedColumns: string[] = ['n_order', 'comment', 'type', 'status', 'origin_name', 'destination_name', 'created_at', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  createPrevilege: ModuleInfo;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private userService: AuthService,
    private movementService: MovementService,
    private moduleManagerService: ModulemanagerService,
    private translate: TranslateService,
    private filterSearchDataService: FilterSearchDataService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {
    translate.setDefaultLang('es');
    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('es');

    let today = new Date();
    let date = new Date(today.setDate(today.getDate() - 7));
    this.filterGroup = this.fb.group({
      origin: [null, Validators.required],
      movementType: null,
      initDateInput: [date, Validators.required],
      endDateInput: [new Date(), Validators.required],
      orderCodeInput: null
    });
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;

    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();


    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches');
    this.createPrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/movement/create');
    this.priv_canDispatch = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/button');
    this.priv_canConsilidate = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/consolidate');

    this.movementService.movementType(this.currentInstitution).subscribe(
      (mType: any) => {

        this.userService.getUserLocations().map((x: any) => {
          if ((x.can_dispatch_to_cellar == true || x.can_dispatch_to_cost_center == true) && x.is_active == true) {
            this.locations.push(x);
          }
        });

        for (let i = 0; i < mType.data.count; i++) {
          if (mType.data.results[i].type_unique_accion == environment.MOVEMENT_TYPE_ORDER || mType.data.results[i].type_unique_accion == environment.MOVEMENT_TYPE_MOVEMENT) {
            this.movementType.push(mType.data.results[i]);
          }
      }

      let today = new Date();
      let date = new Date(today.setDate(today.getDate()-7));

      this.filterGroup = this.fb.group({
        origin: [null, Validators.required],
        movementType: null,
        initDateInput: [date, Validators.required],
        endDateInput: [new Date(),Validators.required],
        orderCodeInput: null
      });

      let savedData = this.filterSearchDataService.getFilterData(this.currentModule.name);
      let savedPage = this.filterSearchDataService.getFilterPage(this.currentModule.name);
      if (savedData) {
        this.isLoadingPage = true;
        this.filterGroup.patchValue(savedData);

        if (savedPage)
          this.paginator.pageIndex = parseInt(savedPage);
        else
          this.paginator.pageIndex = 0;

        this.loadTable();
      }
    }, (error) => {
      this.isLoadingPage = false;
      console.log("Error al procesar consulta: " + error);
    }, () => {
      this.isLoadingPage = false;
    });

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

  loadPageData(pageEvent: PageEvent) {
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

  sendForm() {
    if (this.filterGroup.valid) {
      this.currentFilterData = this.filterGroup.value;
      this.filterSearchDataService.setFilterData(this.currentModule.name, this.filterGroup.value, "0");
      this.loadTable();
    }
  }

  addToList(element:any)
  {

    let hasElement:Boolean = this.consolidatedList.find((a)=>a.id==element.id);
    if(!hasElement)
    {
      this.consolidatedList.push(element);

    }
    else
    {
      this.snackBar.open("El elemento ya existe en el listado de consolidados.", null, {
        duration: 4000,
      });
    }
    
  }

  loadTable() {
    this.isLoadingData = true;
    this.currentFilterData = this.filterGroup.value;
    this.currentFilterData.state_attribute = this.currentTab+1;
    if (this.currentFilterData) {

      if
        (
          this.currentFilterData.origin.id != this.filterGroup.value.origin.id
      //  || this.currentFilterData.movementType.id != this.filterGroup.value.movementType.id
          || this.currentFilterData.initDateInput != this.filterGroup.value.initDateInput
          || this.currentFilterData.endDateInput != this.filterGroup.value.endDateInput
          || this.currentFilterData.state_attribute != this.filterGroup.value.state_attribute){
      //|| this.currentFilterData.orderCodeInput != this.filterGroup.value.orderCodeInput){
        this.paginator.pageIndex = 0;
      }
    }

    this.currentFilterData = this.filterGroup.value;


    this.movementService.getPendingOrderTransfer(this.currentModule, (this.paginator.pageIndex + 1).toString(), this.currentFilterData, this.currentInstitution).
      subscribe(
        (dSuccess: any) => {
          if (dSuccess.status){
            this.results = dSuccess.data.results;
            this.dataSource = new MatTableDataSource<RowElement>(this.results);
            this.pageNumber = (dSuccess.data.count).toFixed(0);
            this.noData = false;
            this.isLoadingData = false;
          }else{
            this.results = [];
            this.dataSource = new MatTableDataSource<RowElement>(this.results);
            this.pageNumber = 0;
            this.noData = true;
            this.isLoadingData = false;
          }
        },
        (error) => {
          this.results = [];
          this.dataSource = new MatTableDataSource<RowElement>(this.results);
          this.pageNumber = 0;
          this.noData = true;
          this.isLoadingData = false;
        });
  }

  removeFilter(filter: FormControl) {
    filter.setValue(null);
  }

  clearConsolidated()
  {
    this.consolidatedList = [];
  }

  removeFromList(element)
  {
    this.consolidatedList.splice( this.consolidatedList.findIndex(a=>a.id==element.id), 1  );
  }

  consolidated()
  {
    let consolidatedData = this.consolidatedList.map((x)=> {return x.id});
    const dialogRef = this.dialog.open(MovementDispatchListConsolidatedDialog, {
      width: '650px',
      data: consolidatedData
    });

  }

}
