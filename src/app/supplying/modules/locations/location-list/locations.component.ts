import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { TranslateService } from '@ngx-translate/core';
import { FilterSearchDataService } from 'src/app/core/services/general/filter-search-data.service';
import { MovementService } from 'src/app/supplying/services/movement.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {

  pageEvent: any;
  currentProfileData: any;
  currentInstitution: string = null;
  
  filterGroup: any;
  isLoading: boolean = false;
  filters: any = null;

  currentModule: ModuleInfo = null;
  createPrevilege: ModuleInfo = null;

  dataList:any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name','receive_from_provider','can_dispatch_to_cellar','can_dispatch_to_cost_center','active','actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  currentFilterData: any = null;

  isLoadingData:boolean = false;
  noData: boolean = false;
  results: any[] = [];
  pageNumber: any = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private fb: FormBuilder,
    private movementService: MovementService,
    private filterSearchDataService: FilterSearchDataService,
  ) { }

  ngOnInit() {
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/locations');
    this.createPrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/locations/create'); 

    this.filterGroup = this.fb.group({
      name: [null,null],
    })
    this.dataSource.paginator = this.paginator;
    
    let savedData = this.filterSearchDataService.getFilterData(this.currentModule.name);
    let savedPage = this.filterSearchDataService.getFilterPage(this.currentModule.name);
    if (savedData) {
      
      this.filterGroup.patchValue(savedData);
      this.isLoadingData = true;
      if (savedPage)
        this.paginator.pageIndex = parseInt(savedPage);
      else
        this.paginator.pageIndex = 0;

      this.loadTable();
    }
    else
    {
      this.loadTable();
    }

  }


  loadTable() {
    this.isLoadingData = true;
    console.log(this.currentFilterData);

    if (this.currentFilterData) {
      
      if
        (
        this.currentFilterData.name != this.filterGroup.value.name) {
        this.paginator.pageIndex = 0;
      }
    }


    this.movementService.getLocations(this.currentModule, (this.paginator.pageIndex + 1).toString(), this.currentFilterData, this.currentInstitution).
      subscribe(
        (dSuccess: any) => {
          console.log(dSuccess);
          this.dataList = dSuccess.data.results;
          this.dataSource = new MatTableDataSource<any>(this.dataList);
          this.pageNumber = (dSuccess.data.count).toFixed(0);
          this.noData = false;
          this.isLoadingData = false;
        },
        (error) => {
          this.dataList = [];
          this.dataSource = new MatTableDataSource<any>(this.dataList);
          this.pageNumber = 0;
          this.noData = true;
          this.isLoadingData = false;
        });
  }


  loadPageData(pageEvent: PageEvent) {

    this.currentFilterData = this.filterGroup.value;
    this.filterSearchDataService.setFilterData(this.currentModule.name, this.currentFilterData, pageEvent.pageIndex.toString());
    this.loadTable();
  }

  sendForm() {
    if (this.filterGroup.valid) {

      this.currentFilterData = this.filterGroup.value;

      this.filterSearchDataService.setFilterData(this.currentModule.name, this.currentFilterData, "0");
      this.loadTable();
    }
  }

}
