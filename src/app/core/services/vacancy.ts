import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VacancyRequest, VacancyResponse, VacancyStatus, StatusUpdateRequest } from '../models/vacancy.model';
import { ApplicationResponse } from '../models/application.model';

@Injectable({ providedIn: 'root' })
export class VacancyService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/vacancies';

  list(params?: { status?: VacancyStatus; requirement?: string }): Observable<VacancyResponse[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.requirement) httpParams = httpParams.set('requirement', params.requirement);
    return this.http.get<VacancyResponse[]>(this.base, { params: httpParams });
  }

  getById(id: number): Observable<VacancyResponse> {
    return this.http.get<VacancyResponse>(`${this.base}/${id}`);
  }

  create(data: VacancyRequest): Observable<VacancyResponse> {
    return this.http.post<VacancyResponse>(this.base, data);
  }

  update(id: number, data: VacancyRequest): Observable<VacancyResponse> {
    return this.http.put<VacancyResponse>(`${this.base}/${id}`, data);
  }

  updateStatus(id: number, status: VacancyStatus): Observable<VacancyResponse> {
    const body: StatusUpdateRequest = { status };
    return this.http.patch<VacancyResponse>(`${this.base}/${id}/status`, body);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  listApplications(id: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.base}/${id}/applications`);
  }
}
