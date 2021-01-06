import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StatisticComponent} from './components/statistic/statistic.component';
import {StatisticsOverviewComponent} from './components/statistics-overview/statistics-overview.component';
import {SharedModule} from '../shared/shared.module';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {PortalModule} from '@angular/cdk/portal';

@NgModule({
  declarations: [
    StatisticComponent,
    StatisticsOverviewComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    PortalModule,
    NgxChartsModule
  ]
})
export class StatisticsModule { }
