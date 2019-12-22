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

  get_purchase_orders(institution) {
    return this.http.get(`${environment.backend_url}/supplying/dashboard/api/v1/graphs/purchase-orders/${institution}`)
  }

  get_provider_ranking(institution) {
    return this.http.get(`${environment.backend_url}/supplying/dashboard/api/v1/graphs/provider-ranking/${institution}`)
  }

  get_article_timeline(institution) {
    return this.http.get(`${environment.backend_url}/supplying/dashboard/api/v1/graphs/artilces-timeline/${institution}`)
  }

}
