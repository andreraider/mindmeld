import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { Alert, AlertType } from '../../models/alert';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'ars-alert',
  templateUrl: 'alert.component.html'
})

export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  alertSubscription: Subscription;

  constructor(private alertService: AlertService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.alertSubscription = this.alertService.getAlert().subscribe((alert: Alert) => {

      // clear alerts when an empty alert is received
      if (!alert.message) {
        this.alerts = [];
        this.cdRef.detectChanges(); // Fixes issues for alerts after error
        return;
      }

      // add alert to array
      if (!this.messageAlreadyVisible(alert.message)) {
        this.alerts.push(alert);
        this.cdRef.detectChanges(); // Fixes issues for alerts after error
      }
    });
  }

  ngOnDestroy() {
    this.cdRef.detach();
    this.alertSubscription.unsubscribe();
  }

  removeAlert(alert: Alert) {
    this.alerts = this.alerts.filter(x => x !== alert);
    this.cdRef.detectChanges(); // Fixes issues for alerts after error
  }

  cssClass(alert: Alert) {
    if (!alert) {
      return;
    }

    // return css class based on alert type
    switch (alert.type) {
      case AlertType.Success:
        return 'alert alert-success';

      case AlertType.Error:
        return 'alert alert-danger';

      case AlertType.Info:
        return 'alert alert-info';

      case AlertType.Warning:
        return 'alert alert-warning';
    }
  }

  private messageAlreadyVisible(message: string): boolean {
    let messageAlreadyVisible = false;
    this.alerts.forEach(alert => {
      if (alert.message === message) {
        messageAlreadyVisible = true;
      }
    });
    return messageAlreadyVisible;
  }
}
