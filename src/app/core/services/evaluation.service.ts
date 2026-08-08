import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationRequest, EvaluationResponse } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/applications';

  create(applicationId: number, data: EvaluationRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(`${this.base}/${applicationId}/evaluation`, data);
  }

  getByApplication(applicationId: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.base}/${applicationId}/evaluation`);
  }
}
