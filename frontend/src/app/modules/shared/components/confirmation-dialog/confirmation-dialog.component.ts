import { Component} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html'
})
export class ConfirmationDialogComponent {

  headline: string;
  message: string;
  confirmButtonText = 'Bestätigen';
  cancelButtonText = 'Abbrechen';
  dangerous = false;
  confirmed = false;

  constructor(private bsModalRef: BsModalRef) { }

  close(confirmed: boolean): void {
    this.confirmed = confirmed;
    this.bsModalRef.hide();
  }
}
