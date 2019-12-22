import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ModulemanagerService } from '../core/services/modulemanager/modulemanager.service';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  selector: 'app-supplying',
  templateUrl: './supplying.component.html',
  styleUrls: ['./supplying.component.scss']
})
export class SupplyingComponent implements OnInit {

  section_title: string = "";
  section_icon: string = "";

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    private moduleManagerService: ModulemanagerService,
    private userService: AuthService,
    private router: Router
  ) {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('es');

    // the lang to use, if the lang isn't available, it will use the current loader to get them
    translate.use('es');
  }


  loadCurrentTitle() {
    let final_segment = '';
    let route_segment = this.router.url.split("/");

    for(let i=0; i<route_segment.length; i++ ){
      if ((route_segment[i] != undefined || route_segment[i] == '') && i > 2){
        final_segment = final_segment + '/' + route_segment[i];
      }
    }

    let currentPath = route_segment[1] + '/' + route_segment[2] + final_segment;
    let currentModule = this.moduleManagerService.getModuleByInternalUrl(currentPath);
    
    if(currentModule == undefined){
      currentPath = route_segment[1] + '/' + route_segment[2]+ '/' + route_segment[3];
      currentModule = this.moduleManagerService.getModuleByInternalUrl(currentPath);
    }
    
    this.section_title = currentModule.name;
    this.section_icon = currentModule.icon_class;

  }

  ngOnInit() {

    this.loadCurrentTitle();
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationEnd) {
          this.loadCurrentTitle();
        }
      }
    );

  }

}
