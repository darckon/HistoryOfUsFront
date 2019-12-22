import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { filter, catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe) { }

  articles(mInfo: ModuleInfo, page: string = "1", filters = null) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}?page=${page}`;

    if (filters) {
      if (filters.code) {
        url = `${environment.backend_url}/${mInfo.api_url}/?search=${filters.code.code}`;
      }
    }
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  locations(institution: number) {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/location/?institution=${institution}`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );;
  }

  searchArticles(name: string, page: number, filters: any = null) {
    let returnService = null;
    if (!filters)
      returnService = this.http.get(`${environment.backend_url}/supplying/article/api/v1/articles/?search=${name}`)
    else {
      console.log(filters)
      returnService = this.http.get(`${environment.backend_url}/supplying/article/api/v1/articles/origin/${filters.origin}/destination/${filters.destination}/type/${filters.type}/institution/${filters.institution}/article/${name}/`);
    }
    return returnService
      .pipe(
        catchError(err => of([]))
      );

  }

  getDetail(mInfo: ModuleInfo, id: number) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/${id}`;
    return this.http.get(url)
  }

  updateDetail(mInfo: ModuleInfo, id: number, data: any) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/${id}/`;
    return this.http.patch(url, data);
  }

  getArticle(idArticle: string) {
    return this.http.get(`${environment.backend_url}/supplying/article/api/v1/articles/${idArticle}`)
  }

  getArticleByLocation(mInfo: ModuleInfo, filters = null) {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/locations/${filters.cellar}/articles/?article__code=${filters.codeArticle.code}`;
    console.log(url);
    if (filters) {
      if (filters.dateInit) {
        url = url + `&created_at=${filters.dateInit}`;
      }
      if (filters.dateEnd) {
        url = url + `&created_at=${filters.dateEnd}`;
      }
    }
    console.log(url);
    return this.http.get(url);
  }

  getBincard(page, filters) {
    return this.http.get(`${environment.backend_url}/supplying/article/api/v1/locations/article-bincard/article/${filters.codeArticle.id}/location/${filters.cellar}/date_init/${this.datePipe.transform(filters.initDate, 'yyyy-MM-dd')}/date_end/${this.datePipe.transform(filters.endDate, 'yyyy-MM-dd')}?page=${page}`)
      .pipe(
        catchError(err => of([]))
      );
  }

  getLocation(institution: any, location_type: number) {
    return this.http.get(`${environment.backend_url}/supplying/article/api/v1/locations/?location_type__id=${location_type}&institution__id=${institution}`)
  }

  getControlTypes() {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/control-types`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );;
  }

  getAdministrationUnits() {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/administration-units `;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  getAdministrationWays() {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/administration-ways`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  getActivePrinciples() {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/active-principle`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  getBudgetItems() {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/budget-items`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  getUnities() {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/unities`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  getPriorities() {
    let url: string = `${environment.backend_url}/supplying/article/api/v1/priority`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

}
