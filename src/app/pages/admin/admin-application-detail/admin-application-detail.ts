import { Component, inject, signal, ChangeDetectionStrategy, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { ApplicationResponse } from '../../../core/models/application.model';
import { VacancyResponse } from '../../../core/models/vacancy.model';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-application-detail',
  imports: [RouterLink, ReactiveFormsModule, StatusBadge, ConfirmModal, DatePipe, NgIcon],
  templateUrl: './admin-application-detail.html',
  styleUrl: './admin-application-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminApplicationDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly destroyRef = inject(DestroyRef);

  protected readonly vacancy = signal<VacancyResponse | null>(null);
  protected readonly application = signal<ApplicationResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly showApproveModal = signal(false);
  protected readonly showRejectModal = signal(false);

  protected readonly feedbackForm = this.fb.group({
    feedback: ['', Validators.required]
  });

  protected vacancyId!: number;
  private applicationId!: number;

  ngOnInit(): void {
    this.vacancyId = Number(this.route.snapshot.paramMap.get('vacancyId'));
    this.applicationId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData();
  }

  protected loadData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.vacancyService.getById(this.vacancyId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (v) => {
        this.vacancy.set(v);
        this.vacancyService.listApplications(this.vacancyId).pipe(
          takeUntilDestroyed(this.destroyRef)
        ).subscribe({
          next: (apps) => {
            const app = apps.find(a => a.id === this.applicationId);
            if (app) {
              this.application.set(app);
              this.loading.set(false);
            } else {
              this.error.set('Candidatura não encontrada');
              this.loading.set(false);
            }
          },
          error: () => { this.error.set('Erro ao carregar candidatura'); this.loading.set(false); }
        });
      },
      error: () => { this.error.set('Vaga não encontrada'); this.loading.set(false); }
    });
  }

  protected decide(status: 'APPROVED' | 'REJECTED'): void {
    const feedback = this.feedbackForm.controls.feedback.value || undefined;
    this.submitting.set(true);
    this.showApproveModal.set(false);
    this.showRejectModal.set(false);
    this.applicationService.updateStatus(this.applicationId, status, feedback).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updated) => {
        this.application.set(updated);
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        if (err.status === 422) {
          this.error.set('Transição de status inválida');
        }
      }
    });
  }

  protected moveToReview(): void {
    this.submitting.set(true);
    this.applicationService.updateStatus(this.applicationId, 'IN_REVIEW').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (updated) => {
        this.application.set(updated);
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        if (err.status === 422) {
          this.error.set('Transição de status inválida');
        }
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
