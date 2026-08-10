import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { ApplicationResponse } from '../../../core/models/application.model';
import { EvaluationRequest, EvaluationResponse } from '../../../core/models/evaluation.model';
import { VacancyResponse } from '../../../core/models/vacancy.model';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { DatePipe } from '@angular/common';
import { switchMap, map, of, catchError, concatMap, tap, Observable } from 'rxjs';

@Component({
  selector: 'app-admin-application-detail',
  imports: [RouterLink, ReactiveFormsModule, StatusBadge, ConfirmModal, DatePipe, NgIcon],
  templateUrl: './admin-application-detail.html',
  styleUrl: './admin-application-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminApplicationDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  private readonly evaluationService = inject(EvaluationService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly vacancy = signal<VacancyResponse | null>(null);
  protected readonly application = signal<ApplicationResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly showApproveModal = signal(false);
  protected readonly showRejectModal = signal(false);

  protected readonly evaluation = signal<EvaluationResponse | null>(null);

  protected readonly feedbackForm = this.fb.group({
    feedback: ['', Validators.required]
  });

  protected vacancyId!: number;

  constructor() {
    const vacancyId = this.getVacancyId();
    const applicationId = this.getApplicationId();
    this.vacancyId = vacancyId;
    this.loadApplication(vacancyId, applicationId);
  }

  protected decide(status: 'APPROVED' | 'REJECTED'): void {
    const feedback = this.getFeedbackValue();
    this.beginDeciding();
    const data = this.buildEvaluationData(feedback);
    this.saveEvaluationAndUpdateStatus(this.getApplicationId(), data, status);
  }

  protected readonly canReview = () => {
    const status = this.application()?.status;
    return status === 'IN_REVIEW';
  };

  protected readonly isTerminal = () => {
    const status = this.application()?.status;
    return status === 'APPROVED' || status === 'REJECTED';
  };

  private getVacancyId(): number {
    return Number(this.route.snapshot.paramMap.get('vacancyId'));
  }

  private getApplicationId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  private loadApplication(vacancyId: number, appId: number): void {
    this.vacancyService.getById(vacancyId).pipe(
      tap(v => this.vacancy.set(v)),
      switchMap(() => this.vacancyService.listApplications(vacancyId)),
      map(apps => this.findApplicationInList(apps, appId)),
      switchMap(app => this.handleApplicationFound(app, appId)),
      catchError(() => this.handleVacancyError()),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (app) => this.processLoadedData(app, appId),
      error: () => this.finishLoading()
    });
  }

  private findApplicationInList(apps: ApplicationResponse[], id: number): ApplicationResponse | undefined {
    return apps.find(a => a.id === id);
  }

  private handleApplicationFound(app: ApplicationResponse | undefined, appId: number): Observable<ApplicationResponse | null> {
    if (!app) return this.handleNotFoundError();
    this.application.set(app);
    return this.markAsInReviewIfPending(app, appId);
  }

  private handleNotFoundError(): Observable<null> {
    this.error.set('Candidatura não encontrada');
    return of(null);
  }

  private markAsInReviewIfPending(app: ApplicationResponse, appId: number): Observable<ApplicationResponse> {
    if (app.status === 'PENDING') {
      return this.applicationService.updateStatus(appId, 'IN_REVIEW');
    }
    return of(app);
  }

  private handleVacancyError(): Observable<null> {
    this.error.set('Vaga não encontrada');
    return of(null);
  }

  private processLoadedData(app: ApplicationResponse | null, appId: number): void {
    if (app) this.application.set(app);
    this.finishLoading();
    if (this.isTerminalApp(app)) {
      this.loadEvaluation(appId);
    }
  }

  private isTerminalApp(app: ApplicationResponse | null): boolean {
    return !!app && (app.status === 'APPROVED' || app.status === 'REJECTED');
  }

  private loadEvaluation(appId: number): void {
    this.evaluationService.getByApplication(appId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (e) => this.setEvaluation(e),
      error: () => {}
    });
  }

  private finishLoading(): void {
    this.loading.set(false);
    this.cdr.detectChanges();
  }

  private getFeedbackValue(): string | undefined {
    return this.feedbackForm.controls.feedback.value || undefined;
  }

  private beginDeciding(): void {
    this.submitting.set(true);
    this.showApproveModal.set(false);
    this.showRejectModal.set(false);
  }

  private buildEvaluationData(feedback?: string): EvaluationRequest {
    return feedback ? { feedback } : {};
  }

  private saveEvaluationAndUpdateStatus(appId: number, data: EvaluationRequest, status: 'APPROVED' | 'REJECTED'): void {
    this.evaluationService.create(appId, data).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(e => this.setEvaluation(e)),
      concatMap(() => this.applicationService.updateStatus(appId, status))
    ).subscribe({
      next: (updated) => this.onStatusUpdated(updated),
      error: () => this.onDecideError()
    });
  }

  private setEvaluation(evaluation: EvaluationResponse): void {
    this.evaluation.set(evaluation);
    this.cdr.detectChanges();
  }

  private onStatusUpdated(updated: ApplicationResponse): void {
    this.application.set(updated);
    this.submitting.set(false);
    this.cdr.detectChanges();
  }

  private onDecideError(): void {
    this.submitting.set(false);
    this.error.set('Erro ao salvar avaliação');
    this.cdr.detectChanges();
  }
}
