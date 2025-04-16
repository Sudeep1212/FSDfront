import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event.service';
import { ParticipantService } from '../../services/participant.service';
import { EventModel } from '../../models/event.model';
import { ParticipantModel } from '../../models/participant.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
})
export class EventsComponent implements OnInit {
  events: EventModel[] = [];
  userEvents: EventModel[] = [];
  userParticipations: ParticipantModel[] = [];
  errorMessage = '';
  registrationId: number | null = null;

  constructor(
    private eventService: EventService,
    private participantService: ParticipantService
  ) {
    const storedId = localStorage.getItem('registrationId');
    this.registrationId = storedId ? parseInt(storedId) : null;
  }

  ngOnInit() {
    this.loadEvents();
    if (this.registrationId) {
      this.loadUserEvents();
      this.loadUserParticipations();
    }
  }

  loadEvents() {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load events';
        console.error('Error loading events:', error);
      },
    });
  }

  loadUserEvents() {
    if (this.registrationId) {
      this.eventService.getUserEvents(this.registrationId).subscribe({
        next: (events) => {
          this.userEvents = events;
        },
        error: (error) => {
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
          next: (participations) => {
            this.userParticipations = participations;
          },
          error: (error) => {
            console.error('Error loading user participations:', error);
          },
        });
    }
  }

  joinEvent(eventId: number) {
    if (!this.registrationId) return;

    const event = this.events.find((e) => e.eventId === eventId);
    if (!event) return;

    const participant: ParticipantModel = {
      registrationId: this.registrationId,
      eventId: eventId,
      eventAmount: event.eventFee || 0,
    };

    this.participantService.joinEvent(participant).subscribe({
      next: () => {
        this.loadUserEvents();
        this.loadUserParticipations();
      },
      error: (error) => {
        this.errorMessage = 'Failed to join event';
        console.error('Error joining event:', error);
      },
    });
  }

  isUserJoinedEvent(eventId: number): boolean {
    return this.userParticipations.some((p) => p.eventId === eventId);
  }
}
