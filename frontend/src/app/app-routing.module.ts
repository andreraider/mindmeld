import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {PageNotFoundComponent} from './components/page-not-found/page-not-found.component';
import {StatisticsOverviewComponent} from './modules/statistics/components/statistics-overview/statistics-overview.component';
import {StatisticComponent} from './modules/statistics/components/statistic/statistic.component';
import {LoginComponent} from './modules/authentication/components/login/login.component';
import {AuthGuard} from './modules/authentication/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: StatisticsOverviewComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'statistics/:id',
    component: StatisticComponent,
    canActivate: [ AuthGuard ]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
