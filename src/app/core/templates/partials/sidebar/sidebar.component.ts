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
    this.profileIsLogged = this.userService.currentProfileIsLogged();
    if (this.userIsLogged) {
      this.currentUser = this.userService.getCurrentUserData();
      this.currentProfileData = this.userService.getCurrentProfile();

      let menus = this.currentProfileData.menu as [];
      let menuData = [];
      menus.map(
        (menu: any) => {
          let module_name = menu.module_name;
          let modules: ModuleInfo[] = [];


          if (menu.privileges.length > 0) {
            menu.privileges.filter((nav) => nav.is_menu_option == true).map(
              (priv: any) => {
                modules.push({ id: priv.id, tag: priv.tag, name: priv.name, module_name: module_name, internal_url: priv.path_menu, api_url: priv.path_accion, other_data: null, icon_class: priv.icon_class });
              });
            menuData.push({ module_name: module_name, tag: menu.tag, name: menu.name, modules: modules, icon_class: menu.icon_class });
          }

        }
      );
      this.menuElements = menuData;
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
