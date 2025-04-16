import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { RegistrationService } from '../../services/registration.service';
import { EventService } from '../../services/event.service';
import { ParticipantService } from '../../services/participant.service';
import { RegistrationModel } from '../../models/registration.model';
import { EventModel } from '../../models/event.model';
import { ParticipantModel } from '../../models/participant.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  registration: RegistrationModel | null = null;
  userEvents: EventModel[] = [];
  userParticipations: ParticipantModel[] = [];
  errorMessage = '';
  isEditing = false;
  registrationId: number | null = null;

  constructor(
    private registrationService: RegistrationService,
    private eventService: EventService,
    private participantService: ParticipantService,
    private router: Router
  ) {
    const storedId = localStorage.getItem('registrationId');
    this.registrationId = storedId ? parseInt(storedId) : null;
  }

  ngOnInit() {
    if (this.registrationId) {
      this.loadUserProfile();
      this.loadUserEvents();
      this.loadUserParticipations();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadUserProfile() {
    if (this.registrationId) {
      this.registrationService
        .getRegistrationById(this.registrationId)
        .subscribe({
          next: (registration: RegistrationModel) => {
            this.registration = registration;
          },
          error: (error: any) => {
            this.errorMessage = 'Failed to load profile';
            console.error('Error loading profile:', error);
          },
        });
    }
  }

  loadUserEvents() {
    if (this.registrationId) {
      this.eventService.getUserEvents(this.registrationId).subscribe({
        next: (events: EventModel[]) => {
          this.userEvents = events;
        },
        error: (error: any) => {
          console.error('Error loading user events:', error);
        },
      });
    }
  }

  loadUserParticipations() {
    if (this.registrationId) {
      this.participantService
        .getUserParticipations(this.registrationId)
        .subscribe({
          next: (participations: ParticipantModel[]) => {
            this.userParticipations = participations;
          },
          error: (error: any) => {
            console.error('Error loading user participations:', error);
          },
        });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  updateProfile() {
    if (this.registration && this.registrationId) {
      this.registrationService
        .updateRegistration(this.registrationId, this.registration)
        .subscribe({
          next: () => {
            this.isEditing = false;
            this.errorMessage = '';
          },
          error: (error: any) => {
            this.errorMessage = 'Failed to update profile';
            console.error('Error updating profile:', error);
          },
        });
    }
  }

  leaveEvent(eventId: number) {
    console.log('Attempting to leave event with ID:', eventId);
    console.log('Current user participations:', this.userParticipations);

    // Find the participant ID for this event
    const participation = this.userParticipations.find(
      (p) => p.eventId === eventId
    );

    console.log('Found participation:', participation);

    if (participation && participation.participantId) {
      console.log(
        'Deleting participation with ID:',
        participation.participantId
      );

      // Show a confirmation dialog
      if (confirm('Are you sure you want to leave this event?')) {
        this.errorMessage = ''; // Clear any previous error messages

        this.participantService
          .leaveEvent(participation.participantId)
          .subscribe({
            next: () => {
              console.log('Successfully left the event');
              this.errorMessage = '';
              // Refresh the lists after leaving the event
              this.loadUserEvents();
              this.loadUserParticipations();
            },
            error: (error: any) => {
              console.error('Error leaving event:', error);

              // Handle different types of errors
              if (error.status === 0) {
                this.errorMessage =
                  'Network error. Please check your connection and try again.';
              } else if (error.status === 404) {
                this.errorMessage = 'Event participation not found.';
              } else if (error.status === 500) {
                this.errorMessage = 'Server error. Please try again later.';
              } else {
                this.errorMessage =
                  'Failed to leave event: ' +
                  (error.error?.message || 'Unknown error');
              }
            },
          });
      }
    } else {
      this.errorMessage = 'Could not find participation record for this event';
      console.error('No participation found for event ID:', eventId);
    }
  }
}
