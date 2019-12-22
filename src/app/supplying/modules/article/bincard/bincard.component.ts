import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, PageEvent } from '@angular/material';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { FormBuilder, Validators } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ArticlesService } from '../../../services/articles.service';
import { environment } from 'src/environments/environment';


export interface RowElement {
  id: string;
  code: string;
  comment: string;
  created_at: string;
  movement_document: any;
}

@Component({
  selector: 'app-bincard',
  templateUrl: './bincard.component.html',
  styleUrls: ['./bincard.component.scss']
})
export class BincardComponent implements OnInit {

  currentUser: any;
  currentLocation: any;
  currentInstitution: string = null;
  currentModule: ModuleInfo = null;

  dataSource = new MatTableDataSource<RowElement>([]);
  itemsPerpage: number = 10;
  pageNumber: any;
  page: any;
  displayedColumns: string[] = ['origin','destination', 'movement_type', 'n_order', 'movement_date', 'entry_stock', 'exit_stock', 'stock'];

  filters: any;
  filterGroup: any;
  filteredArticles: any;
  results: any[] = [];
  isLoading: boolean = false;
  articlesLoading: boolean = false;

  locations: any[] = [];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
    private userService: AuthService,
    private fb: FormBuilder,
    private articleService: ArticlesService) { }

  displayFnArticle(codeArticle?: any): string | undefined {
    return codeArticle ? codeArticle.name : undefined;
  }

  ngOnInit() {

    this.dataSource.paginator = this.paginator;
    this.currentUser = this.userService.getCurrentUserData();
    this.currentLocation = this.userService.getCurrentLocations();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();

    // Charge Cellars 

    this.userService.getUserLocations().map((x: any) => {
      if (x.type.id != environment.LOCATION_TYPE_COST_CENTER && x.is_active == true) {
        this.locations.push(x);
      }
    });
    //this.locations = this.locations.filter((x: any) => x.institution.id == this.currentInstitution);

    this.filterGroup = this.fb.group({
      cellarInput: [null, Validators.required],
      initDateInput: [null, Validators.required],
      endDateInput: [null, Validators.required],
      codeArticleInput: [null, Validators.required]
    })
    this.getTable("1", this.filters);

  }

  loadDataWithFilter() {
    this.filters = {
      cellar: this.filterGroup.value.cellarInput.id,
      initDate: this.filterGroup.value.initDateInput,
      endDate: this.filterGroup.value.endDateInput,
      codeArticle: this.filterGroup.value.codeArticleInput,
    }
    this.paginator.pageIndex = 0;
    this.getTable("1", this.filters);
  }

  loadPageData(pageEvent: PageEvent) {
    this.getTable((this.paginator.pageIndex + 1).toString(), this.filters);
  }

  getTable(page: string = "1", filters = null) {
    if (filters) {
      this.isLoading = true;
      this.articleService.getBincard(page, filters).subscribe(
        (ocSuccess: any) => {
          let aux: any[] = [];  //= ocSuccess.data;
          console.log(ocSuccess)
          aux.push({
                      destination: "",
                      destination_id: "",
                      destination_type: "",
                      entry_stock: "",
                      exit_stock: "",
                      movement_date: "",
                      movement_type: "",
                      n_order: "",
                      origin: "Stock inicial",
                      origin_id: "",
                      origin_type: "",
                      quantity: "",
                      stock: ocSuccess.data[0].stock_init,
                      user_id: "",
                      username:""
                    });

          ocSuccess.data[0].bincard.map(
            (row) =>
            {
              aux.push(row);
            }
          );

          
          this.results = aux;
          this.dataSource = new MatTableDataSource<RowElement>(this.results);
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

}
