import {Component, OnInit} from '@angular/core';
import {AuthService} from './modules/authentication/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent implements OnInit {

  isLoggedIn: boolean;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.authService.loginState().subscribe(isLoggedIn => this.isLoggedIn = isLoggedIn);
  }

  logout(): void {
    this.authService.logout();
  }
}
