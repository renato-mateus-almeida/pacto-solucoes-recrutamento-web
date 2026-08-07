import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationRequest, ApplicationResponse, ApplicationStatus, ApplicationStatusUpdate } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/applications';

  apply(vacancyId: number): Observable<ApplicationResponse> {
    const body: ApplicationRequest = { vacancyId };
    return this.http.post<ApplicationResponse>(this.base, body);
  }

  listMy(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.base}/me`);
  }

  updateStatus(id: number, status: ApplicationStatus): Observable<ApplicationResponse> {
    const body: ApplicationStatusUpdate = { status };
    return this.http.patch<ApplicationResponse>(`${this.base}/${id}/status`, body);
  }
}
