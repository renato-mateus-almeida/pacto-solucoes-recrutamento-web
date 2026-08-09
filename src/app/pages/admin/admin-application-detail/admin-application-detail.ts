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
import { switchMap, map, of, catchError, concatMap } from 'rxjs';

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
    const vacancyId = Number(this.route.snapshot.paramMap.get('vacancyId'));
    const applicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.vacancyId = vacancyId;

    this.vacancyService.getById(vacancyId).pipe(
      switchMap(v => {
        this.vacancy.set(v);
        return this.vacancyService.listApplications(vacancyId);
      }),
      map(apps => apps.find(a => a.id === applicationId)),
      switchMap(app => {
        if (!app) {
          this.error.set('Candidatura não encontrada');
          return of(null);
        }
        this.application.set(app);
        if (app.status === 'PENDING') {
          return this.applicationService.updateStatus(applicationId, 'IN_REVIEW');
        }
        return of(app);
      }),
      catchError(() => {
        this.error.set('Vaga não encontrada');
        return of(null);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        if (result) this.application.set(result);
        this.loading.set(false);
        this.cdr.detectChanges();

        if (result && (result.status === 'APPROVED' || result.status === 'REJECTED')) {
          this.evaluationService.getByApplication(applicationId).pipe(
            takeUntilDestroyed(this.destroyRef)
          ).subscribe({
            next: (evaluation) => {
              this.evaluation.set(evaluation);
              this.cdr.detectChanges();
            },
            error: () => {}
          });
        }
      },
      error: () => {
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  protected decide(status: 'APPROVED' | 'REJECTED'): void {
    const feedback = this.feedbackForm.controls.feedback.value || undefined;
    this.submitting.set(true);
    this.showApproveModal.set(false);
    this.showRejectModal.set(false);

    const applicationId = Number(this.route.snapshot.paramMap.get('id'));

    const evaluationData: EvaluationRequest = {
      ...(feedback && { feedback })
    };

    this.evaluationService.create(applicationId, evaluationData).pipe(
      takeUntilDestroyed(this.destroyRef),
      concatMap(evaluation => {
        this.evaluation.set(evaluation);
        this.cdr.detectChanges();
        return this.applicationService.updateStatus(applicationId, status);
      })
    ).subscribe({
      next: (updated) => {
        this.application.set(updated);
        this.submitting.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.submitting.set(false);
        this.error.set('Erro ao salvar avaliação');
        this.cdr.detectChanges();
      }
    });
  }

  protected readonly canReview = () => {
    const status = this.application()?.status;
    return status === 'IN_REVIEW';
  };

  protected readonly isTerminal = () => {
    const status = this.application()?.status;
    return status === 'APPROVED' || status === 'REJECTED';
  };
}
