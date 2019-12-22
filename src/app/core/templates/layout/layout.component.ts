import { Component, OnInit } from '@angular/core';
import { PreviousRouteServiceService } from 'src/app/core/services/previousRouteService/previous-route-service.service'
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {

  returnStatus: Boolean = false;
  currentProfileData: any = null;

  constructor(
    private previousRouteService: PreviousRouteServiceService,
    private userService: AuthService,
    private translate: TranslateService,
    private router: Router) { }

  ngOnInit() 
  { 
    this.translate.setDefaultLang('es');
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationEnd) {
          this.loadView();
        }
      }
    );
  }

  loadView()
  {
      this.returnStatus = true;
  }

  return()
  {
    if(this.previousRouteService.getPreviousUrl())
      this.router.navigateByUrl(this.previousRouteService.popPreviousUrl());
  }

}
