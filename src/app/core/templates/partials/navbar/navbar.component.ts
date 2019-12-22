import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationListService } from '../../../services/notificationlist.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

import { WebsocketService } from "../../../services/websocket/websocket.service";
import { NotificationService } from "../../../services/websocket/notification.service";
import { LoginNotificationService, Message } from '../../../services/websocket/login-notification.service';
import { WebsocketService2 } from '../../../services/websocket/websocket2.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  providers: [WebsocketService, NotificationService, WebsocketService2, LoginNotificationService]
})
export class NavbarComponent implements OnInit {
  isTesting: boolean = false;
  envName: string = "";
  titleLenguage: string = "";

  loggedIn: boolean = false;
  userHasMultipleProfiles: boolean = false;

  currentUser: any = null;
  userIsLogged: boolean;
  profileIsLogged: boolean;
  currentProfileData: any;
  currentInstituionData: any;

  menuElements: any = [];
  channel: string;
  notificationNumber: number = 0;
  listDataNotification: any = [];

  loadingNotifications: boolean = false;

  notificationEventObservable$: Subject<Message>;

  private message = {
    message: ""
  };

  constructor(
    private breakpointObserver: BreakpointObserver,
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private translate: TranslateService,
    private notiticationService: NotificationService,
    private wsLoginService: LoginNotificationService,
    private notificationListService: NotificationListService
  ) {
    this.message.message = "Establishing connection";


    this.titleLenguage = "ES";
    translate.use('es');
  }

  @Output() public sidenavToggle = new EventEmitter();

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  ngOnInit() {

    this.isTesting = !environment.production;
    this.envName = environment.name;

    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationEnd) {
          this.loadView();
        }
      }
    );
  }

  goNextLoginNotification() {
    this.notificationEventObservable$.next(this.message);
    this.message.message = "";
  }

  loadView() {
    this.userIsLogged = this.userService.currentUserIsLogged();
    if (this.userIsLogged) {
      this.currentUser = this.userService.getCurrentUserData();
    }
  }

  goToRoute(moduleInfo: ModuleInfo) {
    var route = `${moduleInfo.internal_url}`;
    this.router.navigateByUrl(route);
  }

  swapProfile() {
    this.userService.setCurrentUserProfileId("none");
    this.router.navigateByUrl('/login');
    //location.reload();
  }

  translateWebData(lg) {
    this.translate.use(lg);
    this.titleLenguage = lg;
  }

  listenLoginNotification() {
    this.channel = this.wsLoginService.setUserChannelId();
    this.notificationEventObservable$ = this.wsLoginService.ws_login_notification(this.channel);
    let ws = this.wsLoginService.ws;

    ws.addEventListener("open",
      (event) => {
        this.goNextLoginNotification();
      }
    );

    this.notificationEventObservable$.subscribe(msg => {
      if (msg.message != 0) {
        this.notificationNumber = msg.message;
        let text = "Tienes " + msg.message + " notificaciones sin leer";
        this.wsLoginService.createNotification(text);
      }

    });

    this.notiticationService.ws_notification(this.channel).subscribe(msg => {
      if (msg.message != 'OK notification') {
        this.notificationNumber = this.notificationNumber + 1;
        this.notiticationService.createNotification(msg.message);
      }
    });
  }

  getListNotification() {
    this.loadingNotifications = true;

    this.notificationListService.getUserNotification(this.currentUser.id).subscribe(listNotification => {
      this.listDataNotification = listNotification.data;
      this.loadingNotifications = false;
    });
  }

  updateListNotification(notificationId, notificationMessage) {
    this.notificationNumber = this.notificationNumber - 1;
    this.message.message = notificationId;
    this.notiticationService.messages.next(this.message);
    this.message.message = "";
    this.goToPurchaseOrderDetail(notificationMessage);
  }

  updateSocketNotification() {

  }
  
  goToPurchaseOrderDetail(txt) {
    let list = txt.split(" ");
    let position = list.indexOf('OC:');
    if (position !== -1) {
      this.router.navigateByUrl('/supplying/purchase-orders/detail/' + list[position + 1]);
    }
  }

  logout() {
    this.userService.logout();
    location.reload();
  }

}