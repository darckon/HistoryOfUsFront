import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { first, map, catchError, filter } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProviderService {


  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  searchProviders(provider: string) {
    let url: string = `${environment.backend_url}/supplying/movement/api/v1/providers?search=${provider}`;
    console.log(url);
    return this.http.get(url);
  }    

  
}
