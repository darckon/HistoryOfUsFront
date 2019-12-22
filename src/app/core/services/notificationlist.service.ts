import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificationListService {

  constructor(
    private http: HttpClient
  ) { }

  getUserNotification(uuid) {
    return this.http.get<any>(`${environment.backend_url}/core/api/v1/users/me/notifications?is_read=false&user=${uuid}`);
  }

}
