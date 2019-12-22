import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Output() sidenavClose = new EventEmitter();
  currentUser: any = null;
  userIsLogged: boolean;
  profileIsLogged: boolean;
  currentProfileData: any;
  menuElements: any = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
  ) { }

  ngOnInit() {
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationEnd) {
          this.loadView();
        }
      }
    );
  }


  loadView() {
    this.userIsLogged = this.userService.currentUserIsLogged();
    if (this.userIsLogged) {
      this.currentUser = this.userService.getCurrentUserData();
    }
  }

  public onSidenavClose = () => {
    this.sidenavClose.emit();
  }

  goToRoute(moduleInfo: ModuleInfo) {
    this.sidenavClose.emit();
    var route = `${moduleInfo.module_name}/${moduleInfo.internal_url}`;
    this.router.navigateByUrl(route);
  }

}
