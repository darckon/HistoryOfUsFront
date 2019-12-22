import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { filter, map, catchError } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { SupplyingConstants } from '../supplying-constants';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(
    private http: HttpClient,
    private datePipe: DatePipe) { }


  create(data: any) {
    let url: string = `${environment.backend_url}/supplying/movement/api/v1/movements/`;
    return this.http.post(url, data);
  }

  patch(data: any, idMovement: string) {
    let url: string = `${environment.backend_url}/supplying/movement/api/v1/movements/${idMovement}/`;
    return this.http.patch(url, data);
  }

  detail(mInfo: ModuleInfo, movementId: string) {
    if (mInfo == null)
      throw "No se cargó correctamente la información del submódulo:";

    let auxUrl = `${environment.backend_url}/${mInfo.api_url}`;
    auxUrl = auxUrl.replace("{$1}", movementId);
    return this.http.get(auxUrl).pipe(map((x: any) => x.data));
  }

  orders(mInfo: ModuleInfo, page: string = "1", filters = null, institution) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}`;

    if (filters) {

      if(filters.origin){
       url = url.replace("{$2}", filters.origin.id);
      }else{
        url = url.replace("{$1}", "0");
      }

      if(filters.destination){
        url = url.replace("{$1}", filters.destination.id);
      }else{
        url = url.replace("{$1}", "0");
      }

      if (filters.initDateInput) {
        url = url.replace("{$3}", this.datePipe.transform(filters.initDateInput, 'yyyy-MM-dd'));
      }else{
        url = url.replace("{$3}", "0");
      }


      if (filters.endDateInput) {
        url = url.replace("{$4}", this.datePipe.transform(filters.endDateInput, 'yyyy-MM-dd'));
      }else{
        url = url.replace("{$4}", "0");
      }

      if (filters.orderCodeInput) {
        url = url.replace("{$5}", filters.orderCodeInput);
      }
      else {
        url = url.replace("{$5}", "0");
      }

      if (filters.state_attribute) {
        url = url.replace("{$6}", filters.state_attribute);
      }else{
        url = url.replace("{$6}", "0");
      }

    }

    url = url.replace("{$7}", institution);

    url = url + `/?page=${page}`;

    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  searchDestinations(cellar: string, type: string, institution: string) {

    let url: string = `${environment.backend_url}/supplying/movement/api/v1/movements/search-cellar-destinations?p={"cellar": ${cellar}, "type" : ${type}, "institution": ${institution}}`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

  searchHealthNetworks() {
    let url: string = `${environment.backend_url}/core/api/v1/health-networks-dispatch`;
    return this.http.get(url)
      .pipe(
        catchError(err => of([]))
      );
  }

}
