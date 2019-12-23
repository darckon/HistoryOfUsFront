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
  private currentUserLogged: any;

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
