import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';

import { environment } from 'src/environments/environment';
import { first, map, catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { Router, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {


  constructor(private router: Router, private userService: AuthService, private snackBar: MatSnackBar) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let currentUserToken = JSON.parse(localStorage.getItem(environment.env_key + 'currentUserToken'));

    let lastLoginTime:Date = new Date(parseInt(localStorage.getItem(environment.env_key + 'lastLoginTime'))); 
    let currentTime:Date =  new Date();
    let diffMs = (currentTime.getTime() - lastLoginTime.getTime());
    let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
    let userData = this.userService.getCurrentUserData();
    

    if(userData && lastLoginTime && userData.active_session_time < diffMins)
    {
      this.userService.logout();
      this.snackBar.open("Su sesión ha finalizado. Debe iniciar sesión nuevamente",null, {
        duration: 5000,
      });              
      this.router.navigate(['/login']);
      return;
    }
    

    if (currentUserToken) {
      request = request.clone({
        setHeaders: {
          'Authorization': `Bearer ${currentUserToken.token}`
        }
      });
    }
    return next.handle(request).pipe(
      map(event => {
        if (event instanceof HttpResponse) {
          let body = event.body;
          event = event.clone()
        }
        localStorage.setItem(environment.env_key + 'lastLoginTime', Date.now().toString() );
        return event;
      }),
      catchError(serverResponse => {

        if(serverResponse.status == 401)
        {
          this.userService.logout();
          this.snackBar.open("Su sesión ha finalizado. Debe iniciar sesión nuevamente",null, {
            duration: 5000,
          });              
          this.router.navigate(['/login']);
          return;
        }

        if (serverResponse.status != 400 || !("status" in serverResponse.error))
          return throwError(serverResponse);
        return throwError(serverResponse.error);

      })
    );
  }
}