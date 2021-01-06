import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { Alert, AlertType } from '../models/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

    private subject = new Subject<Alert>();

    constructor(private router: Router) {
        // clear alert messages on route change
        router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                // clear alert messages
                this.clear();
            }
        });
    }

  /**
   * Subscribe to alerts of alertLocation.
   */
  getAlert(): Observable<any> {
    return this.subject.asObservable();
  }

  /**
   * Show success message.
   * @param message   translatable string id for message
   */
  success(message: string) {
      this.alert(new Alert({ type: AlertType.Success, message }));
  }

  /**
   * Show error message.
   * @param message     translatable string id for message
   */
  error(message: string) {
      this.alert(new Alert({ type: AlertType.Error, message }));
  }

  /**
   * Show info message
   * @param message   translatable string id for message
   */
  info(message: string) {
      this.alert(new Alert({ type: AlertType.Info, message }));
  }

  /**
   * Show warning message
   * @param message   translatable string id for message
   */
  warn(message: string) {
      this.alert(new Alert({ type: AlertType.Warning, message }));
  }

  /**
   * Show passed alert
   * @param alert   alert object
   */
  alert(alert: Alert) {
    this.subject.next(alert);
  }

  /**
   * Clear alerts at alert location
   */
  clear() {
    this.subject.next(new Alert());
  }
}
