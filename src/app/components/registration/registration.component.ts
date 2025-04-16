import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { RegistrationModel } from '../../models/registration.model';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css',
})
export class RegistrationComponent {
  registration: RegistrationModel = {
    name: '',
    college: '',
    email: '',
    contact: '',
    password: '',
  };
  errorMessage = '';

  constructor(
    private registrationService: RegistrationService,
    private router: Router
  ) {}

  onSubmit() {
    this.registrationService.register(this.registration).subscribe({
      next: (response) => {
        if (response && response.registrationId) {
          localStorage.setItem(
            'registrationId',
            response.registrationId.toString()
          );
        }
        this.router.navigate(['/login']);
      },
      error: (error) => {
        if (error.status === 409) {
          this.errorMessage = 'Email already exists';
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
        console.error('Registration error:', error);
      },
    });
  }
}
