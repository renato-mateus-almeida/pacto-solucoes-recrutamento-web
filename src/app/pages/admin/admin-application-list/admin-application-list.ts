import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { switchMap, tap, catchError, of, Observable } from 'rxjs';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationResponse, ApplicationStatus } from '../../../core/models/application.model';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-application-list',
  imports: [RouterLink, StatusBadge, DatePipe, NgIcon],
  templateUrl: './admin-application-list.html',
  styleUrl: './admin-application-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminApplicationList {
  private static readonly STATUS = {
    PENDING: 'PENDING' as const,
    IN_REVIEW: 'IN_REVIEW' as const,
    APPROVED: 'APPROVED' as const,
    REJECTED: 'REJECTED' as const,
  };

  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly activeFilter = signal<ApplicationStatus | 'ALL'>('ALL');

  private readonly refreshTrigger = signal(0);

  protected get vacancyId(): number {
    return Number(this.route.snapshot.paramMap.get('vacancyId'));
  }

  readonly vacancy = toSignal(
    toObservable(this.refreshTrigger).pipe(
      tap(() => this.beginLoading()),
      switchMap(() => this.vacancyService.getById(this.vacancyId).pipe(
        tap(() => this.finishLoading()),
        catchError(() => this.handleVacancyLoadError())
      ))
    ),
    { initialValue: null }
  );

  readonly applications = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.vacancyService.listApplications(this.vacancyId).pipe(
        catchError(() => this.handleApplicationsLoadError())
      ))
    ),
    { initialValue: [] as ApplicationResponse[] }
  );

  protected readonly filtered = computed(() => {
    const filter = this.activeFilter();
    const apps = this.applications();
    if (filter === 'ALL') return apps;
    return apps.filter(a => a.status === filter);
  });

  protected readonly counts = computed(() => {
    const apps = this.applications();
    const { PENDING, IN_REVIEW, APPROVED, REJECTED } = AdminApplicationList.STATUS;
    return {
      all: apps.length,
      pending: apps.filter(a => a.status === PENDING).length,
      inReview: apps.filter(a => a.status === IN_REVIEW).length,
      approved: apps.filter(a => a.status === APPROVED).length,
      rejected: apps.filter(a => a.status === REJECTED).length,
    };
  });

  protected setFilter(status: ApplicationStatus | 'ALL'): void {
    this.activeFilter.set(status);
  }

  protected loadAll(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  private beginLoading(): void {
    this.loading.set(true);
    this.error.set(null);
  }

  private finishLoading(): void {
    this.loading.set(false);
  }

  private handleVacancyLoadError(): Observable<null> {
    this.error.set('Erro ao carregar dados da vaga');
    this.loading.set(false);
    return of(null);
  }

  private handleApplicationsLoadError(): Observable<ApplicationResponse[]> {
    this.error.set('Erro ao carregar candidaturas');
    this.loading.set(false);
    return of([]);
  }
}
