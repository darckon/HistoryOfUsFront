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
export class HistoryService {

  constructor(private http: HttpClient) { }

  getHistorias() {
    return this.http.get(`${environment.backend_url}/core/api/v1/stories/?active=true`)
  }

  getPrologo() {
    return this.http.get(`${environment.backend_url}/core/api/v1/textos/?capitulo=3`)
  }

  getPreguntas(tipo) {
    return this.http.get(`${environment.backend_url}/core/api/v1/questions/?question_type=${tipo}`)
  }

}
