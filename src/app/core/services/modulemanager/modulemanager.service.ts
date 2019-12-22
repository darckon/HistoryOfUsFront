import { Injectable } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ModulemanagerService {

  private _currentModuleInfo: ModuleInfo = null;
  private _menuPrevilegies: ModuleInfo[] = [];
  private _otherPrevilegies: ModuleInfo[] = [];
  private _previlegies: ModuleInfo[] = [];
  private currentProfileData: any;

  get Previlegies(): ModuleInfo[] {
    return this._previlegies;
  }

  get MenuPrevilegies(): ModuleInfo[] {
    return this._menuPrevilegies;
  }

  get OtherPrevilegies(): ModuleInfo[] {
    return this._otherPrevilegies;
  }

  getModuleByInternalUrl(internal_url: string): ModuleInfo {
    return this._previlegies.find((mod) => mod.internal_url == internal_url);
  }

  reloadModuleData() {

    this.currentProfileData = this.userService.getCurrentProfile();


    if (this.currentProfileData && this.currentProfileData.menu) {
      let menus = this.currentProfileData.menu as [];

      menus.map(
        (menu: any) => {
          let module_name = menu.module_name;
          if (menu.privileges.length > 0) {
            menu.privileges.filter((nav) => nav.is_menu_option == true)
              .map(
                (priv: any) => {
                  if (!this._menuPrevilegies.find(x => x.id == priv.id))
                    this._menuPrevilegies.push({ id: priv.id, tag: priv.tag, name: priv.name, module_name: module_name, internal_url: priv.path_menu, api_url: priv.path_accion, other_data: null, icon_class: priv.icon_class });
                  if (!this._previlegies.find(x => x.id == priv.id))
                    this._previlegies.push({ id: priv.id, tag: priv.tag, name: priv.name, module_name: module_name, internal_url: priv.path_menu, api_url: priv.path_accion, other_data: null, icon_class: priv.icon_class });
                });
            menu.privileges.filter((nav) => nav.is_menu_option == false)
              .map(
                (priv: any) => {
                  if (!this._otherPrevilegies.find(x => x.id == priv.id))
                    this._otherPrevilegies.push({ id: priv.id, tag: priv.tag, name: priv.name, module_name: module_name, internal_url: priv.path_menu, api_url: priv.path_accion, other_data: null, icon_class: priv.icon_class });
                  if (!this._previlegies.find(x => x.id == priv.id))
                    this._previlegies.push({ id: priv.id, tag: priv.tag, name: priv.name, module_name: module_name, internal_url: priv.path_menu, api_url: priv.path_accion, other_data: null, icon_class: priv.icon_class });
                });

          }
        }
      );
    }

  }

  constructor(private userService: AuthService,
    private router: Router) {
    this.reloadModuleData();
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationEnd) {
          this.reloadModuleData();
        }
      }
    );

  }


}
