import { Injectable } from "@angular/core";
import { Subject, Observable, Observer } from "rxjs";

@Injectable()
export class WebsocketService2 {
  constructor() {

	}
  
	private subject: Subject<MessageEvent>;
	public ws : WebSocket;

  public connect(url: string): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  private create(url): Subject<MessageEvent> {
    this.ws = new WebSocket(url);


		let observable = Observable.create(
			(obs: Observer<MessageEvent>) => {
				this.ws.onmessage = obs.next.bind(obs);
				this.ws.onerror = obs.error.bind(obs);
				this.ws.onclose = obs.complete.bind(obs);
				return this.ws.close.bind(this.ws);
			})

		let observer = {
			next: (data: Object) => {
				if (this.ws.readyState === WebSocket.OPEN) {
					this.ws.send(JSON.stringify(data));
				}
			}
		}
		return Subject.create(observer, observable);
	}
}