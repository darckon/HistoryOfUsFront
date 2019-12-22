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
export class AgreementService {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  create(data: any, mInfo: ModuleInfo) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/`;
    return this.http.post(url, data);
  }

  patch(data: any, mInfo: ModuleInfo, id: string) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/${id}/`;
    return this.http.patch(url, data);
  }

  detail(mInfo: ModuleInfo, code: string) {
    return this.http.get(`${environment.backend_url}/${mInfo.api_url}/${code}`)
  }

  detailAgreementReception(id: string) {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/agreements/detail-agreement-reception/${id}/`)
  }

  getExecution(id_agreement: string, agreement_amount: number, id_bidding: number): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/agreements/execution-percentage/${id_agreement}/${agreement_amount}/${id_bidding}`)
  }

  getFines(agreement_id: string, page: number = 1): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/fines/?agreement=${agreement_id}&page=${page}&page_size=5`)
  }


  getFineCompliance(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/fine-states?no_page`)
  }
  getFineTypes(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/type-non-compliances?no_page`)
  }

  getList(mInfo: ModuleInfo, currentInstitution: string, filters: any, page: string) {
    let institution = (currentInstitution);
    if (filters) {
      let licitation = (filters.licitation) ? filters.licitation.id : "null";
      let agreement_category = (filters.agreement_category) ? filters.agreement_category.id : "null";
      let provider = (filters.provider) ? filters.provider.id : "null";
      let article = (filters.article) ? filters.article.id : "null";
      let terminated = (filters.terminated) ? filters.terminated : "null";
      return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/agreements/list/bidding/${licitation}/terminated/${terminated}/category_id/${agreement_category}/provider_id/${provider}/article_id/${article}/institution_id/${institution}/?page=${page}`)
    }
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/agreements/list/bidding/null/terminated/null/category_id/null/provider_id/null/article_id/null/institution_id/${institution}/?page=${page}`)
  }

  getLicitations(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/biddings/`)
  }

  getAgreementTypes(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/types/`)
  }

  getWarrantyTypes(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/warranty-types/`)
  }

  getBanksTypes(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/banks/`)
  }

  getResolutionApproval(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/resolution-approval-numbers/`)
  }

  getCategories(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/categories/`)
  }

  searchLicitation(value: string) {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/biddings/?search=${value}`);
  }

  getContractEndingTypes(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/anticipated-terms/`)
  }

  getResolutionApprovalNumbers(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/resolution-approval-numbers/`)
  }

  getTax(): any {
    return this.http.get(`${environment.backend_url}/supplying/agreement/api/v1/tax/`)
  }

}
