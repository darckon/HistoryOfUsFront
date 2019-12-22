import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent } from '@angular/material';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { TranslateService } from '@ngx-translate/core';
import { FilterSearchDataService } from 'src/app/core/services/general/filter-search-data.service';
import { MovementService } from 'src/app/supplying/services/movement.service';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {
  pageEvent: any;
  currentProfileData: any;
  currentInstitution: string = null;

  filterGroup: any;
  isLoading: boolean = false;
  filters: any = null;

  currentModule: ModuleInfo = null;
  createPrivilege: ModuleInfo = null;

  serviceList: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id', 'name', 'code', 'budget_item', 'actions'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  currentFilterData: any = null;

  isLoadingData: boolean = false;
  noData: boolean = false;
  results: any[] = [];
  pageNumber: any = 0;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private translate: TranslateService,
    private movementService: MovementService,
    private filterSearchDataService: FilterSearchDataService,
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('es');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('es');
  }

  ngOnInit() {
    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/articles/services');
    this.createPrivilege = this.moduleManagerService.getModuleByInternalUrl('supplying/articles/services/create');

    this.filterGroup = this.fb.group({
      name: [null, null],
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
    } else {
      this.loadTable();
    }
  }

  loadTable() {
    this.isLoadingData = true;

    if (this.currentFilterData) {
      if (this.currentFilterData.name != this.filterGroup.value.name) {
        this.paginator.pageIndex = 0;
      }
    }


    this.movementService.getServices(this.currentModule, (this.paginator.pageIndex + 1).toString(), this.currentFilterData).
      subscribe(
        (dSuccess: any) => {
          console.log(dSuccess);
          this.serviceList = dSuccess.data.results;
          this.dataSource = new MatTableDataSource<any>(this.serviceList);
          this.pageNumber = (dSuccess.data.count).toFixed(0);
          this.noData = false;
          this.isLoadingData = false;
        },
        (error) => {
          this.serviceList = [];
          this.dataSource = new MatTableDataSource<any>(this.serviceList);
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
