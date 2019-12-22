import { Injectable, Inject } from "@angular/core";
import { Subject } from "rxjs";
import { map, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';

export class NotificationsService {

  http: HttpClient = null;
  constructor(@Inject(HttpClient) http: HttpClient) {
    this.http = http;
  }

  getGroups() {
    return this.http.get(`${environment.backend_url}/core/api/v1/notifications-groups`)
  }
  
  getUsers() {
    return this.http.get(`${environment.backend_url}/core/api/v1/users?no_page`)
  }

  sendMessage(data: any){
    let url: string = `${environment.backend_url}/core/api/v1/notifications-groups/send/`;
    console.log(data)
    return this.http.post(url, data);
  }
}