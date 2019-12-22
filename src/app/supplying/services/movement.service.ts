import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { first, map, catchError, filter, switchMap } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MovementService {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  create(data: any, mInfo: ModuleInfo) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/`;
    return this.http.post(url, data);
  }

  update(data: any, mInfo: ModuleInfo, id: string) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/${id}/`;
    return this.http.patch(url, data);
  }

  documents(mInfo: ModuleInfo, institution: string, page: string = "1", filters = null) {

    let url: string = `${environment.backend_url}/${mInfo.api_url}?document_type=${environment.DOCUMENT_TYPE_OC}&institution=${institution}&page=${page}`;



    if (filters) {
      if (filters.provider) {
        url = url + `&movement_document_set__provider=${filters.provider.id}`;
      }
      if (filters.status) {
        url = url + `&movement_document_set__movement__movement_state=${filters.status}`;
      }
      if (filters.startDate || filters.endDate) {
        if (!filters.startDate)
          filters.startDate = new Date(1900, 0, 0);
        if (!filters.endDate)
          filters.endDate = new Date();

        let startDate: Date = filters.startDate;
        let endDate: Date = filters.endDate;

        url = url + `&created_at__range=${this.datePipe.transform(startDate, 'yyyy-MM-dd')},${this.datePipe.transform(endDate, 'yyyy-MM-dd')}`;
      }
      if (filters.code) {
        url = url + `&code=${filters.code}`;
      }
      if (filters.codeArticleService) {
        if (filters.is_article)
        {
          url = url + `&movement_document_set__movement__artmov_set__article=${filters.codeArticleService.id}`;
        }else{
          console.log(filters.codeArticleService.id)
          url = url + `&movement_document_set__movement__sermov_set__service=${filters.codeArticleService.id}`;
        }
      }
      if (filters.buyer) {
        url = url + `&movement_document_set__movement__user=${filters.buyer}`;
      }
    }

    return this.http.get(url);
  }

  searchOc(institution: string, code: string) {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/document?document_type=1&institution=${institution}&code__contains=${code}`)
  }

  detail(mInfo: ModuleInfo, code: string) {
    return this.http.get(`${environment.backend_url}/${mInfo.api_url}?document__code=${code}`)
  }

  searchProvider(name: string, page: number) {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/providers?search=${name}`)
  }


  getProviders(mInfo: ModuleInfo, page: string, filters: any) {

    if (filters && filters.provInput) {
      return this.http.get(`${environment.backend_url}/${mInfo.api_url}/?id=${filters.provInput.id}&page=${page}`);
    }
    return this.http.get(`${environment.backend_url}/${mInfo.api_url}/?page=${page}`)
  }


  getCostCentersList(mInfo: ModuleInfo, institution: string) {
    return this.http.get(`${environment.backend_url}/${mInfo.api_url}/?location_type__name__in=Bodega,Farmacia&institution=${institution}`)
  }

  getLocations(mInfo: ModuleInfo, page: string, filters: any, institution: string) {

    if (filters && filters.name) {
      return this.http.get(`${environment.backend_url}/${mInfo.api_url}/?search=${filters.name}&location_type__name__in=Bodega,Farmacia&institution=${institution}&page=${page}`);
    }
    return this.http.get(`${environment.backend_url}/${mInfo.api_url}/?location_type__name__in=Bodega,Farmacia&institution=${institution}&page=${page}`)
  }

  getServices(mInfo: ModuleInfo, page: string, filters: any) {

    if (filters && filters.name) {
      return this.http.get(`${environment.backend_url}/${mInfo.api_url}/?search=${filters.name}&page=${page}`);
    }
    return this.http.get(`${environment.backend_url}/${mInfo.api_url}/?page=${page}`)
  }


  searchCostCenters(name: string) {
    return this.http.get(`${environment.backend_url}/core/api/v1/cost-center/?search=${name}&location_type__name__in=Bodega,Farmacia`);
  }

  searchArticles(name: string, page: number) {
    return this.http.get(`${environment.backend_url}/supplying/article/api/v1/articles/?search=${name}`)
  }

  searchServices(name: string, page: number) {
    return this.http.get(`${environment.backend_url}/supplying/api/v1/services/?search=${name}`)
  }

  movementStates() {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/movement-states`)
  }

  documentType() {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/document-type`)
  }

  intermeditationTypes() {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/intermediation`)
  }

  articleTransactions(movementId: string) {
    return this.http.get(`${environment.backend_url}/supplying/api/v1/transaction-article?movement__id=${movementId}`)
  }

  fatherArticleTransactions(movementId: string) {
    return this.http.get(`${environment.backend_url}/supplying/api/v1/transaction-article?father_movement__id=${movementId}`)
  }

  massiveCodification(data: any) {
    return this.http.post(`${environment.backend_url}/supplying/api/v1/massive-coding/`, { data: data })
  }

  massiveSystemCodification(mInfo: ModuleInfo, data: any) {
    return this.http.post(`${environment.backend_url}/${mInfo.api_url}/`, data)
  }

  massiveRecodification(mInfo: ModuleInfo, data: any[]) {
    console.log(data);
    if (data.length == 0) return of([]);
    return this.http.post(`${environment.backend_url}/${mInfo.api_url}/`, data)
  }

  massiveRevert(mInfo: ModuleInfo, data: any[]) {
    console.log(data);
    if (data.length == 0) return of([]);
    return this.http.post(`${environment.backend_url}/${mInfo.api_url}/`, data)
  }

  getOrderDebts(movementId: string, ocType: string) {
    let type = (ocType == "SERVICE") ? "1" : "0";
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/movements/order_debt/movement/${movementId}/type/${type}/`)
  }


  getArticlesInLocation(data: StockInLocation[]) {
    return this.http.post(`${environment.backend_url}/supplying/article/api/v1/locations/real-stock-article-location/`, data);
  }

  getNextbatchExpire(locationId: string, articleId: string) {
    return this.http.get(`${environment.backend_url}/supplying/article/api/v1/locations/next-batch-expire/article/${articleId}/location/${locationId}/`);
  }

  purchaseOrderReception(mInfo: ModuleInfo, data: any, uploadFile: boolean = false) {
    let end_point = 'article'
    console.log(data.is_service);
    if (data.is_service){
      end_point='service'
    }
    if (uploadFile == true) {
      let httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
      return this.http.post(`${environment.backend_url}/${mInfo.api_url}/${end_point}/`, data, httpOptions)
    }

    return this.http.post(`${environment.backend_url}/${mInfo.api_url}/${end_point}/`, data)
  }

  listBuyers() {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/movements/buyers/`)
  }

  movementType(institution: number) {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/movement-types/?institution=${institution}&page_size=200`)
  }

  movementTypeByUnique(institution: number, unique: number) {
    return this.http.get(`${environment.backend_url}/supplying/movement/api/v1/movement-types/?institution=${institution}&type_unique_accion=${unique}`)
  }


  getPendingOrderTransfer(mInfo: ModuleInfo, page: string = "1", filters = null, institution) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}`;
    console.log(mInfo.api_url);

    if (filters) {
      
      if (filters.origin) {
        url = url.replace("{$1}", filters.origin.id);
      }else{
        url = url.replace("{$1}", "0");
      }

      if (filters.movementType) {
        url = url.replace("{$2}", filters.movementType.id);
      }else{
        url = url.replace("{$2}", "0");
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
      } else {
        url = url.replace("{$5}", "0");
      }

      url = url.replace("{$6}", institution);

      if (filters.state_attribute) {
        url = url.replace("{$7}", filters.state_attribute);
      }else{
        url = url.replace("{$7}", "0");
      }
     
    }
    url = url + `/?page=${page}`;
    return this.http.get(url);
  }

  searchDestinations(origin: string, location_type: string, institution: string) {
    let url: string = `${environment.backend_url}/supplying/movement/api/v1/movements/search-destination_location/origin/${origin}/location_type/${location_type}/institution/${institution}/`;
    return this.http.get(url);
  }

  dispatch(mInfo: ModuleInfo, movementId: string, articles: any[], userId: string, packing_factor: boolean) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/`;
    let data = {}
    if (!packing_factor)
    {
      data = {
        movement_id: movementId,
        user: userId,
        transaction: articles
      };
    }else{
      data = {
        movement_id: movementId,
        user: userId,
        transaction: articles,
        movement_detail:articles
      };
    };
    
    return this.http.post(url, data);
  }

  acceptDispatch(mInfo: ModuleInfo, movementId: number, articles: any[], userId: string) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/`;
    let data = {
      movement_id: movementId,
      user: userId,
      transaction: articles
    };
    return this.http.post(url, data);
  }

  dispatchList(mInfo: ModuleInfo, transactionid: string) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/${transactionid}`;
    return this.http.get(url);
  }

  getListProductPendingCodification(mInfo: ModuleInfo, institution: string, page: string = "1", currentOption: number) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}`;
    url = url.replace("{$1}", currentOption.toString());
    url = url.replace("{$2}", institution);
    url = url + `/?page=${page}`;
    return this.http.get(url);
  }


  getPurchaseOrderDispatches(code: string) {

    let url: string = `${environment.backend_url}/supplying/movement/api/v1/document/list-dispatch/${code}/`;
    console.log(url);
    return this.http.get(url);
  }

  returnToProvider(mInfo: ModuleInfo, returnData: any) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/`;
    return this.http.post(url, returnData);
  }


  getConsolidatedList(movementArray: any) {
    let url: string = `${environment.backend_url}/supplying/movement/api/v1/movements/dispatch-consolidate/`;
    return this.http.post(url, movementArray).pipe(
      switchMap((value: any) => {
        if (value.data && value.status == true) {
          let consolidated = value.data.data_1;
          let resume = value.data.data_2;
          return of({ consolidated: consolidated, resume: resume });
        }
        return of([]);
      }),
    );
  }

  ExportExcel(data: any, option) {
    let url: string = `${environment.backend_url}/supplying/movement/api/v1/movements/dispatch-consolidate-export/`;
    var HTTPOptions: Object = {
      headers: new HttpHeaders({
        'Accept': 'text/html, application/xhtml+xml, */*'
      }),
      responseType: 'blob'
    }
    option = (option) ? 1 : 0;
    console.log(option)
    let sendData = {
      movements: [data],
      options: option
    }
    return this.http.post(url, sendData, HTTPOptions)
  }

  getDetail(mInfo: ModuleInfo, id: any) {
    return this.http.get(`${environment.backend_url}/${mInfo.api_url}/${id}`)
  }

  getLocationTypes() {
    return this.http.get(`${environment.backend_url}/supplying/article/api/v1/location-types/?name__in=Bodega,Farmacia`)
  }


  getCostCenters() {
    return this.http.get(`${environment.backend_url}/core/api/v1/cost-center/`)
  }

  getCommunes() {
    return this.http.get(`${environment.backend_url}/core/api/v1/communes/`)
  }

  getPercs() {
    return this.http.get(`${environment.backend_url}/core/api/v1/perc-data/`)
  }

  setAdjustStock(data: any, mInfo: ModuleInfo){
    let url: string = `${environment.backend_url}/${mInfo.api_url}/`;
    return this.http.post(url, data);
  }

}

export interface StockInLocation {
  location_id: string,
  article_id: string
}