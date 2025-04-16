import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParticipantModel } from '../models/participant.model';

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  private apiUrl = 'http://localhost:8080/api/participants';

  constructor(private http: HttpClient) {}

  joinEvent(participant: ParticipantModel): Observable<ParticipantModel> {
    return this.http.post<ParticipantModel>(this.apiUrl, participant);
  }

  getUserParticipations(
    registrationId: number
  ): Observable<ParticipantModel[]> {
    return this.http.get<ParticipantModel[]>(
      `${this.apiUrl}/user/${registrationId}`
    );
  }

  leaveEvent(participantId: number): Observable<void> {
    console.log(
      'Calling API to leave event with participant ID:',
      participantId
    );
    return this.http.delete<void>(`${this.apiUrl}/${participantId}`, {
      withCredentials: false,
    });
  }

  getAllParticipants(): Observable<ParticipantModel[]> {
    return this.http.get<ParticipantModel[]>(this.apiUrl);
  }

  createParticipant(
    participant: ParticipantModel
  ): Observable<ParticipantModel> {
    return this.http.post<ParticipantModel>(this.apiUrl, participant);
  }

  updateParticipant(
    id: number,
    participant: ParticipantModel
  ): Observable<ParticipantModel> {
    return this.http.put<ParticipantModel>(`${this.apiUrl}/${id}`, participant);
  }

  deleteParticipant(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
