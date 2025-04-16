import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { LoginRequestModel } from '../../models/login-request.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginRequest: LoginRequestModel = {
    email: '',
    password: '',
  };
  errorMessage = '';

  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.registrationService.login(this.loginRequest).subscribe({
      next: (response) => {
        if (response && response.registrationId) {
          localStorage.setItem(
            'registrationId',
            response.registrationId.toString()
          );
          this.authService.login(response.registrationId.toString());
          this.router.navigate(['/events']);
        } else {
          this.errorMessage = 'Invalid response from server';
        }
      },
      error: (error) => {
        this.errorMessage = 'Invalid email or password';
        console.error('Login error:', error);
      },
    });
  }
}
