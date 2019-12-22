import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PreviousRouteServiceService {
  private history = [];
  private previousUrl: string;
  private currentUrl: string;

  constructor(private router: Router) {
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({ urlAfterRedirects }: NavigationEnd) => {
        //this.history = [...this.history, urlAfterRedirects];
        this.history.push(urlAfterRedirects);
      });
  }

  public getHistory(): string[] {
    return this.history;
  }

  public getPreviousUrl() {
    return this.history[this.history.length - 2] || '/';
  }

  public popPreviousUrl() {
    let returnData = this.history[this.history.length - 2];
    this.history = this.history.slice(0, this.history.length - 2);
    return returnData || '/';
  }

}
