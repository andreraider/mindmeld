import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Statistic} from '../models/statistic';
import {environment} from '../../../../environments/environment';
import {map} from 'rxjs/operators';
import {AuthService} from '../../authentication/services/auth.service';
import {MentalState} from '../models/mental-state';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAllStatistics(): Observable<Statistic[]> {
    const options = { headers: this.authService.getTokenHeader() };
    return this.http.get<Statistic[]>(`${environment.backendUrl}/statistics`, options)
      .pipe(map(rawStatistics => rawStatistics.map(rawStatistic => new Statistic(rawStatistic))));
  }

  getStatistic(id: number): Observable<Statistic> {
    const options = { headers: this.authService.getTokenHeader() };
    return this.http.get<Statistic>(`${environment.backendUrl}/statistics/${id}`, options)
      .pipe(map(rawStatistic => new Statistic(rawStatistic)));
  }

  getMentalStatesForParticipant(statisticId: number, participantId: number): Observable<MentalState[]> {
    const options = { headers: this.authService.getTokenHeader() };
    return this.http.get<MentalState[]>(`${environment.backendUrl}/statistics/${statisticId}/participants/${participantId}/mental-states`, options)
      .pipe(map(mentalStates => mentalStates.map(rawMentalState => new MentalState(rawMentalState))));
  }

  deleteStatistic(id: number): Observable<void> {
    const options = { headers: this.authService.getTokenHeader() };
    return this.http.delete<void>(`${environment.backendUrl}/statistics/${id}`, options);
  }
}
