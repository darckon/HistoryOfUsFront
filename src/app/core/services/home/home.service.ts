import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';


export interface Message {
  message: string;
}

@Injectable({
  providedIn: 'root'
})

export class HomeService {

  constructor(private http: HttpClient) { }

  start() {
    return this.http.get(`${environment.backend_url}/core/api/v1/stories/?active=true`)
  }

}
