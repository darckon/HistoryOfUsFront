import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FilterSearchDataService {

  constructor() { }

  getFilterData(filterName: string): any {
    let data = JSON.parse(localStorage.getItem(environment.env_key + "_FILTER_" + filterName));
    if (data) {
      return data;
    }
    else {
      return null;
    }
  }

  getFilterPage(filterName: string): string {
    let data = localStorage.getItem(environment.env_key + "_FILTER_PAGE_" + filterName);
    if (data) {
      return data;
    }
    else {
      return null;
    }
  }

  setFilterData(filterName: string, data: any, page: string) {
    localStorage.setItem(environment.env_key + "_FILTER_" + filterName, JSON.stringify(data));
    localStorage.setItem(environment.env_key + "_FILTER_PAGE_" + filterName, page);
  }

}
