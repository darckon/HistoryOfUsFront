import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent, MatTreeNestedDataSource } from '@angular/material';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { TranslateService } from '@ngx-translate/core';
import { FilterSearchDataService } from 'src/app/core/services/general/filter-search-data.service';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { NestedTreeControl } from '@angular/cdk/tree';
import { AgreementService } from 'src/app/supplying/services/agreement.service';
import { forkJoin } from 'rxjs';
import { environment } from '../../../../../environments/environment';


@Component({
  selector: 'app-agreement-list',
  templateUrl: './agreement-list.component.html',
  styleUrls: ['./agreement-list.component.scss']
})
export class AgreementListComponent implements OnInit {
  pageEvent: any;
  currentProfileData: any;
  currentInstitution: string = null;
  isLoading: boolean = false;


  currentModule: ModuleInfo = null;
  createPrevilege: ModuleInfo = null;
  fineCreatePrevilege: ModuleInfo;
  fineEditPrevilege: ModuleInfo;

  dataList: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['code', 'name', 'rut_provider', 'provider', 'articles', 'n_oc', 'category', 'actions'];

  isLoadingData: boolean = false;
  noData: boolean = false;
  results: any[] = [];
  licitations: any[] = [];
  agreementCategories: any[] = [];
  currentFilterData: any = null;
  pageNumber: any;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  filterGroup: any;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private fb: FormBuilder,
    private agreementService: AgreementService,
    private filterSearchDataService: FilterSearchDataService,
  ) { }

  compareFn(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  ngOnInit() {
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();


    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements');
    this.createPrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/create');
    this.fineCreatePrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/create');
    this.fineEditPrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/detail');

    this.isLoading = true;
    var tasks$ = [];
    tasks$.push(this.agreementService.getLicitations());
    tasks$.push(this.agreementService.getCategories());

    this.filterGroup = this.fb.group({
      bidding: [null, null],
      agreement_category: [null, null],
      licitation: [null, null],
      provider: [null, null],
      article: [null, null],
      terminated: [null, null],
    })

    this.dataSource.paginator = this.paginator;

    forkJoin(...tasks$).subscribe(
      (results: any) => {
        this.licitations = results[0].data.results;
        this.agreementCategories = results[1].data.results;
      });

    this.dataSource.paginator = this.paginator;

    let savedData = this.filterSearchDataService.getFilterData(this.currentModule.name);
    if (savedData) {

      this.filterGroup.patchValue(savedData);
      this.isLoadingData = true;
      this.paginator.pageIndex = 0;

      this.loadData();
    }
    else {
      this.loadData();
    }

  }

  loadData() {
    this.isLoadingData = true;


    this.agreementService.getList(this.currentModule, this.currentInstitution, this.currentFilterData, (this.paginator.pageIndex + 1).toString()).
      subscribe(
        (dSuccess: any) => {

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
    this.loadData();
  }



  sendForm() {
    if (this.filterGroup.valid) {
      this.currentFilterData = this.filterGroup.value;

      this.filterSearchDataService.setFilterData(this.currentModule.name, this.currentFilterData, "0");
      this.loadData();
    }
  }

}
