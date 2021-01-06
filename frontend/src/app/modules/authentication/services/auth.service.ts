import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import * as moment from 'moment';
import {Endpoints} from '../../../../endpoints';
import {User} from '../models/user';
import {Moment} from 'moment';
import {Router} from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginState$ = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(email: string, password: string): Observable<any> {
    const options = { headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
    const body = { email, password };
    return this.http.post(Endpoints.auth, body, options).pipe(tap(authResponse => {
      this.setUserSession(authResponse);
      this.loginState$.next(true);
    }));
  }

  emitLogin(): void {
    this.loginState$.next(true);
  }

  logout(): void {
    localStorage.removeItem('mindmeld-user-token');
    localStorage.removeItem('mindmeld-user-token-expiresAt');
    localStorage.removeItem('mindmeld-user');
    this.loginState$.next(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('mindmeld-user-token-expiresAt')) {
      if (moment().isBefore(this.getUserExpiration())) {
        return true;

      } else {
        this.logout();
      }
    } else {
      return false;
    }
  }

  loginState(): Observable<boolean> {
    return this.loginState$.asObservable();
  }

  getTokenHeader(): HttpHeaders {
    const token = localStorage.getItem('mindmeld-user-token');
    if (token) {
      return new HttpHeaders( { Authorization: 'Bearer ' + token });
    }
    return new HttpHeaders( {} );
  }

  getUserToken(): string {
    return localStorage.getItem('mindmeld-user-token');
  }

  getUser(): User {
    return new User(JSON.parse(localStorage.getItem('mindmeld-user')));
  }

  setUser(user: User): void {
    localStorage.setItem('collective-user', JSON.stringify(user));
  }

  private setUserSession(authResponse: any): void {
    const expiresAt = moment().add(authResponse.expiresIn, 'second');
    localStorage.setItem('mindmeld-user-token', authResponse.token);
    localStorage.setItem('mindmeld-user-token-expiresAt', JSON.stringify(expiresAt.valueOf()));
    localStorage.setItem('mindmeld-user', JSON.stringify(authResponse.user));
  }

  private getUserExpiration(): Moment {
    const expiration = localStorage.getItem('mindmeld-user-token-expiresAt');
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }
}
