import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {

  constructor(private http: HttpClient) { }

  create(data: any) {
    let url: string = `${environment.backend_url}/core/api/v1/movimientos/`;
    return this.http.post(url, data);
  }
}
