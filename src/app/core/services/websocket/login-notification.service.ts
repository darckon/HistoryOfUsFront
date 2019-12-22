import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { WebsocketService2 } from "./websocket2.service";
import { environment } from 'src/environments/environment';

export interface Message {
  message: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoginNotificationService {
  public messages: Subject<Message>;
  public cUser = null;
  public channel = '';
  public ws: WebSocket;

  constructor(private wsService: WebsocketService2) {
    this.messages = null;
  }

  ws_login_notification(channel): Subject<Message> {
    this.messages = <Subject<Message>>this.wsService.connect(environment.WS_LOGIN_URL + channel).pipe(
      map(
        (response: MessageEvent): Message => {
          let data = JSON.parse(response.data);
          return {
            message: data.message
          };
        }
      )
    );
    this.ws = this.wsService.ws;
    return this.messages;
  }

  setUserChannelId() {
    this.cUser = JSON.parse(localStorage.getItem(environment.env_key + 'currentMe'));
    if (this.cUser) {
      this.channel = this.cUser.id + '/';
      return this.channel;
    }
  }
  // function for creating the notification
  createNotification(title) {

    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications.");
    }
    // Let's check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification

      var img = '/assets/images/notification.png';
      var text = title;
      var tp = 'Long';
      var notification = new Notification('Notificaciones SistemasExpertos', {
        body: text,
        icon: img
      });

      (window as any).navigator.vibrate(13000);
    }

    // Otherwise, we need to ask the user for permission
    // Note, Chrome does not implement the permission static property
    // So we have to check for NOT 'denied' instead of 'default'
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {

        // Whatever the user answers, we make sure Chrome stores the information
        if (!('permission' in Notification)) {
          let auxNotification: any = Notification;
          auxNotification.permission = permission;
        }

        // If the user is okay, let's create a notification
        if (permission === "granted") {
          var img = '/assets/images/notification.png';
          var text = title;
          var tp = 'Long';
          var notification = new Notification('Notificaciones SistemasExpertos', { body: text, icon: img });

          window.navigator.vibrate(13000);
        }
      });
    }
  }
}