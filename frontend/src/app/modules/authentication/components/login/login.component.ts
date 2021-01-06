import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../../alert/services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {

  loginForm = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, Validators.required)
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  login(): void {
    this.loginForm.disable();
    this.authService.login(this.loginForm.get('email').value, this.loginForm.get('password').value).subscribe(
      success => this.router.navigate(['/']),
      error => {
        this.loginForm.enable();
        if (error.error.statusCode === 401) {
          this.alertService.error('Die eingegebene E-Mail oder Passwort sind nicht korrekt.');

        } else {
          throw error;
        }
      }
    );
  }
}
