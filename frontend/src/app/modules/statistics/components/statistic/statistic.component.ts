import { Component, OnInit } from '@angular/core';
import {Statistic} from '../../models/statistic';
import {StatisticsService} from '../../services/statistics.service';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styles: []
})
export class StatisticComponent implements OnInit {

  statistic: Statistic;

  data = [];
  xScaleMin = new Date();
  xScaleMax = new Date();
  loaded = false;
  mentalStatesCounter: number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly statisticsService: StatisticsService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.mentalStatesCounter = 0;
      this.spinner.show();
      this.statisticsService.getStatistic(Number(params.id)).subscribe(statistic => {
        this.statistic = statistic;
        if (this.statistic.started !== null) {
          this.statistic.participants.forEach(participant => {
            this.statisticsService.getMentalStatesForParticipant(Number(params.id), participant.id).subscribe(mentalStates => {
              participant.mentalStates = mentalStates;
              this.mentalStatesCounter++;

              if (this.mentalStatesCounter === this.statistic.participants.length) {
                this.calcXScaleMinMax();
                this.statisticToChartData();
                this.loaded = true;
                this.spinner.hide();
              }
            });
          });
        } else {
          this.loaded = true;
          this.spinner.hide();
        }
      });
    });
  }

  statisticToChartData(): void {
    const data = this.statistic.participants
      .map(participant => new Object({
        name: participant.nickname,
        series: participant.mentalStates
          .filter(mentalState => mentalState.active === true)
          .map(mentalState => Object({
            value: mentalState.relaxation,
            name: mentalState.created
          }))
      })
    );
    data.push({
      name: 'Group',
      series: this.statistic.mentalStates.map(mentalState => Object({
        value: mentalState.relaxation,
        name: mentalState.created
      }))
    });
    this.data = data;
  }

  calcXScaleMinMax(): void {
    this.xScaleMin = this.statistic.started;
    if (this.statistic.ended !== null) {
      this.xScaleMax = this.statistic.ended;

    } else {
      this.xScaleMax = moment(this.statistic.started).add(this.statistic.duration, 'minutes').toDate();
    }

  }

  onSelect(data): void { }

  onActivate(data): void { }

  onDeactivate(data): void { }

}
