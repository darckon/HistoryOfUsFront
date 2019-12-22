import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { FormBuilder } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { ArticlesService } from '../../../services/articles.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';

export interface RowElement {
  id: number;
  code: string;
  name: string;
  is_auge: boolean;
  is_arsenal: boolean;
  priority: any;
  is_perishable: boolean;
  locations: any;
  budget_item: any;
  unity: any;
  group: any;
  bar_code: any;
  drugs: any;
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit {

  currentProfileData: any;
  currentInstitution: string = null;
  displayedColumns: string[] = ['code', 'name', 'priority', 'budget_item', 'actions'];
  dataSource = new MatTableDataSource<RowElement>([]);
  itemsPerpage: number = 10;
  pageNumber: any;
  currentModule: ModuleInfo = null;
  manualPage = null;

  page: any;
  results: any[] = [];

  applyFilter: any;
  filters: any = null;
  filterGroup: any;

  isLoading: boolean = false;
  articlesLoading: boolean = false;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private articleService: ArticlesService
  ) { }

  displayFn(code?: any): string | undefined {
    return code ? code.name : undefined;
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/articles');

    this.filterGroup = this.fb.group({
      codeInput: null
    })

    this.getTable("1", this.filters);

  }

  loadDataWithFilter() {
    this.filters = {
      code: this.filterGroup.value.codeInput
    }
    this.paginator.pageIndex = 0;
    this.getTable("1", this.filters);

  }

  loadPageData(pageEvent: PageEvent) {
    this.getTable((this.paginator.pageIndex + 1).toString(), this.filters);
  }

  getTable(page: string = "1", filters = null) {
    this.isLoading = true;
    this.articleService.articles(this.currentModule, page, filters).subscribe(
      (ocSuccess: any) => {
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
