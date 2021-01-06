import { Component, OnInit } from '@angular/core';
import {StatisticsService} from '../../services/statistics.service';
import {Statistic} from '../../models/statistic';
import {Router} from '@angular/router';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {ConfirmationDialogComponent} from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-statistics-overview',
  templateUrl: './statistics-overview.component.html',
  styles: [
  ]
})
export class StatisticsOverviewComponent implements OnInit {

  statistics: Statistic[] = [];
  modalRef: BsModalRef;

  constructor(
    private readonly statisticsService: StatisticsService,
    private router: Router,
    private modalService: BsModalService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getStatistics();
  }

  getStatistics(): void {
    this.spinner.show();
    this.statisticsService.getAllStatistics()
      .subscribe(statistics => {
        this.statistics = statistics;
        this.spinner.hide();
      });
  }

  showDetails(statisticId: number): void {
    this.router.navigate(['statistics/' + statisticId]);
  }

  openDeleteStatisticPopup(statisticId: number): void {
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      {
        class: `modal-dialog-centered modal-md`,
        initialState: {
          headline: 'Statistik löschen?',
          message: `Sollen die Gruppenstatistik wirklich gelöscht werden?<br />
                    Dieser Schritt kann nicht rückgängig gemacht werden!`,
          confirmButtonText: 'Löschen',
          dangerous: true
        }
      }
    );

    const subscription = this.modalService.onHide.subscribe(() => {
      if (this.modalRef.content.confirmed) {
        this.deleteStatistic(statisticId);
      }
      subscription.unsubscribe();
    });
  }

  deleteStatistic(id: number): void {
    this.statisticsService.deleteStatistic(id)
      .subscribe(() => this.getStatistics());
  }

}
