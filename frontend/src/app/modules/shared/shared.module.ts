import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import {ModalModule} from 'ngx-bootstrap/modal';
import {NgxSpinnerModule} from 'ngx-spinner';

@NgModule({
  imports: [
    CommonModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    RouterModule,
    NgxSpinnerModule,
  ],
  declarations: [
    ConfirmationDialogComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent
  ],
  exports: [
    ModalModule,
    ReactiveFormsModule,
    RouterModule,
    NgxSpinnerModule,
  ]
})
export class SharedModule { }
