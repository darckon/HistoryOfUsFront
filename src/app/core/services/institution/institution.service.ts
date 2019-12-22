import { Injectable, Inject } from "@angular/core";
import { Subject } from "rxjs";
import { map, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';


export class InstitutionService {

  http: HttpClient = null;
  constructor(@Inject(HttpClient) http: HttpClient) {
    this.http = http;
  }

  getDataCurrentInstitution(institution: string) {
    return this.http.get(`${environment.backend_url}/core/api/v1/institutions/${institution}`)
  }

  getCommunes() {
    return this.http.get(`${environment.backend_url}/core/api/v1/communes/?page_size=300`)
  }

  update(data: any, mInfo: ModuleInfo, id: string) {
    let url: string = `${environment.backend_url}/${mInfo.api_url}/${id}`;
    return this.http.patch(url, data);
  }

}
