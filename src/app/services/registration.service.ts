import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistrationModel } from '../models/registration.model';
import { LoginRequestModel } from '../models/login-request.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationService {
  private apiUrl = 'https://fsdback1.onrender.com/api/registrations';

  constructor(private http: HttpClient) {}

  register(registration: RegistrationModel): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(this.apiUrl, registration);
  }

  login(loginRequest: LoginRequestModel): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(
      `${this.apiUrl}/login`,
      loginRequest
    );
  }

  getRegistrationByEmail(email: string): Observable<RegistrationModel> {
    return this.http.get<RegistrationModel>(`${this.apiUrl}/email/${email}`);
  }

  getRegistrationById(id: number): Observable<RegistrationModel> {
    return this.http.get<RegistrationModel>(`${this.apiUrl}/${id}`);
  }

  updateRegistration(
    id: number,
    registration: RegistrationModel
  ): Observable<RegistrationModel> {
    return this.http.put<RegistrationModel>(
      `${this.apiUrl}/${id}`,
      registration
    );
  }

  getAllRegistrations(): Observable<RegistrationModel[]> {
    return this.http.get<RegistrationModel[]>(this.apiUrl);
  }

  deleteRegistration(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  createRegistration(
    registration: RegistrationModel
  ): Observable<RegistrationModel> {
    return this.http.post<RegistrationModel>(this.apiUrl, registration);
  }
}
