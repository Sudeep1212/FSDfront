import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { ParticipantService } from '../../services/participant.service';
import { EventModel } from '../../models/event.model';
import { RegistrationModel } from '../../models/registration.model';
import { ParticipantModel } from '../../models/participant.model';

// Modified Participant model with additional fields
interface ParticipantWithDetails extends ParticipantModel {
  eventName?: string;
  participantEmail?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  isAuthenticated = false;
  username = '';
  password = '';
  activeTab: 'events' | 'registrations' | 'participants' = 'events';
  showAddEventForm = false;

  // Search functionality
  eventSearchTerm = '';
  registrationSearchTerm = '';
  participantSearchTerm = '';

  // All data
  events: EventModel[] = [];
  registrations: RegistrationModel[] = [];
  participants: ParticipantWithDetails[] = [];

  // Filtered data (for search results)
  filteredEvents: EventModel[] = [];
  filteredRegistrations: RegistrationModel[] = [];
  filteredParticipants: ParticipantWithDetails[] = [];

  // Edit mode
  editingEvent: EventModel | null = null;
  editingRegistration: RegistrationModel | null = null;
  editingParticipant: ParticipantModel | null = null;

  newEvent: EventModel = {
    eventName: '',
    eventFee: 0,
  };

  constructor(
    private router: Router,
    private eventService: EventService,
    private registrationService: RegistrationService,
    private participantService: ParticipantService
  ) {}

  ngOnInit() {
    if (this.isAuthenticated) {
      this.loadData();
    }
  }

  login() {
    if (this.username === 'admin' && this.password === 'admin') {
      this.isAuthenticated = true;
      this.loadData();
    } else {
      alert('Invalid credentials');
    }
  }

  loadData() {
    if (this.activeTab === 'events') {
      this.eventService.getAllEvents().subscribe((data: EventModel[]) => {
        this.events = data;
        this.filteredEvents = data;
      });
    } else if (this.activeTab === 'registrations') {
      this.registrationService
        .getAllRegistrations()
        .subscribe((data: RegistrationModel[]) => {
          this.registrations = data;
          this.filteredRegistrations = data;
        });
    } else if (this.activeTab === 'participants') {
      this.participantService
        .getAllParticipants()
        .subscribe((data: ParticipantModel[]) => {
          // Enhanced to load additional data for participants
          const participantsWithDetails: ParticipantWithDetails[] = [];

          // Create a counter to track when all details are loaded
          let pendingRequests = data.length;

          if (data.length === 0) {
            this.participants = [];
            this.filteredParticipants = [];
            return;
          }

          data.forEach((participant) => {
            const enhancedParticipant: ParticipantWithDetails = {
              ...participant,
            };

            // Get event name
            this.eventService.getEventById(participant.eventId!).subscribe(
              (event) => {
                enhancedParticipant.eventName = event.eventName;
                checkComplete();
              },
              (error) => {
                enhancedParticipant.eventName = 'Unknown Event';
                checkComplete();
              }
            );

            // Get participant email from registration
            this.registrationService
              .getRegistrationById(participant.registrationId!)
              .subscribe(
                (registration) => {
                  enhancedParticipant.participantEmail = registration.email;
                  checkComplete();
                },
                (error) => {
                  enhancedParticipant.participantEmail = 'Unknown Email';
                  checkComplete();
                }
              );

            participantsWithDetails.push(enhancedParticipant);
          });

          // Function to check if all requests are complete
          const checkComplete = () => {
            pendingRequests--;
            if (pendingRequests === 0) {
              this.participants = participantsWithDetails;
              this.filteredParticipants = participantsWithDetails;
            }
          };
        });
    }
  }

  // Search functionality
  searchEvents() {
    if (!this.eventSearchTerm.trim()) {
      this.filteredEvents = this.events;
      return;
    }

    const term = this.eventSearchTerm.toLowerCase().trim();
    this.filteredEvents = this.events.filter(
      (event) =>
        event.eventName?.toLowerCase().includes(term) ||
        event.eventId?.toString().includes(term) ||
        event.eventFee?.toString().includes(term)
    );
  }

  searchRegistrations() {
    if (!this.registrationSearchTerm.trim()) {
      this.filteredRegistrations = this.registrations;
      return;
    }

    const term = this.registrationSearchTerm.toLowerCase().trim();
    this.filteredRegistrations = this.registrations.filter(
      (reg) =>
        reg.name?.toLowerCase().includes(term) ||
        reg.email?.toLowerCase().includes(term) ||
        reg.college?.toLowerCase().includes(term) ||
        reg.contact?.includes(term) ||
        reg.registrationId?.toString().includes(term)
    );
  }

  searchParticipants() {
    if (!this.participantSearchTerm.trim()) {
      this.filteredParticipants = this.participants;
      return;
    }

    const term = this.participantSearchTerm.toLowerCase().trim();
    this.filteredParticipants = this.participants.filter(
      (part) =>
        part.participantId?.toString().includes(term) ||
        part.registrationId?.toString().includes(term) ||
        part.eventId?.toString().includes(term) ||
        part.eventAmount?.toString().includes(term) ||
        (part.eventName && part.eventName.toLowerCase().includes(term)) ||
        (part.participantEmail &&
          part.participantEmail.toLowerCase().includes(term))
    );
  }

  // Edit mode functionality
  startEditEvent(event: EventModel) {
    this.editingEvent = { ...event };
  }

  cancelEditEvent() {
    this.editingEvent = null;
  }

  updateEvent() {
    if (this.editingEvent && this.editingEvent.eventId) {
      this.eventService
        .updateEvent(this.editingEvent.eventId, this.editingEvent)
        .subscribe(() => {
          this.loadData();
          this.editingEvent = null;
        });
    }
  }

  startEditRegistration(registration: RegistrationModel) {
    this.editingRegistration = { ...registration };
  }

  cancelEditRegistration() {
    this.editingRegistration = null;
  }

  updateRegistration() {
    if (this.editingRegistration && this.editingRegistration.registrationId) {
      this.registrationService
        .updateRegistration(
          this.editingRegistration.registrationId,
          this.editingRegistration
        )
        .subscribe(() => {
          this.loadData();
          this.editingRegistration = null;
        });
    }
  }

  startEditParticipant(participant: ParticipantModel) {
    this.editingParticipant = { ...participant };
  }

  cancelEditParticipant() {
    this.editingParticipant = null;
  }

  updateParticipant() {
    if (this.editingParticipant && this.editingParticipant.participantId) {
      this.participantService
        .updateParticipant(
          this.editingParticipant.participantId,
          this.editingParticipant
        )
        .subscribe(() => {
          this.loadData();
          this.editingParticipant = null;
        });
    }
  }

  // Existing methods
  addEvent() {
    if (this.newEvent.eventName && this.newEvent.eventFee) {
      this.eventService.createEvent(this.newEvent).subscribe(() => {
        this.loadData();
        this.showAddEventForm = false;
        this.newEvent = {
          eventName: '',
          eventFee: 0,
        };
      });
    } else {
      alert('Please fill in all fields');
    }
  }

  deleteEvent(id: number | undefined) {
    if (id !== undefined) {
      this.eventService.deleteEvent(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  deleteRegistration(id: number | undefined) {
    if (id !== undefined) {
      this.registrationService.deleteRegistration(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  deleteParticipant(id: number | undefined) {
    if (id !== undefined) {
      this.participantService.deleteParticipant(id).subscribe(() => {
        this.loadData();
      });
    }
  }

  setActiveTab(tab: 'events' | 'registrations' | 'participants') {
    this.activeTab = tab;
    this.loadData();
  }
}
