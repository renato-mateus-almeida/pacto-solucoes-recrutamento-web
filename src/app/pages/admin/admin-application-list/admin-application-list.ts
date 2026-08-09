import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { switchMap, tap, catchError, of } from 'rxjs';
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
  private readonly vacancyService = inject(VacancyService);

  readonly vacancyId = Number(inject(ActivatedRoute).snapshot.paramMap.get('vacancyId'));

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly reload = signal(0);

  readonly vacancy = toSignal(
    toObservable(this.reload).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(() => this.vacancyService.getById(this.vacancyId).pipe(
        tap(() => this.loading.set(false)),
        catchError(() => { this.error.set('Erro ao carregar dados da vaga'); this.loading.set(false); return of(null); })
      ))
    ),
    { initialValue: null }
  );

  readonly applications = toSignal(
    toObservable(this.reload).pipe(
      switchMap(() => this.vacancyService.listApplications(this.vacancyId).pipe(
        catchError(() => { this.error.set('Erro ao carregar candidaturas'); this.loading.set(false); return of([] as ApplicationResponse[]); })
      ))
    ),
    { initialValue: [] as ApplicationResponse[] }
  );

  protected readonly activeFilter = signal<ApplicationStatus | 'ALL'>('ALL');

  protected readonly filtered = computed(() => {
    const filter = this.activeFilter();
    const apps = this.applications();
    if (filter === 'ALL') return apps;
    return apps.filter(a => a.status === filter);
  });

  protected readonly counts = computed(() => {
    const apps = this.applications();
    return {
      all: apps.length,
      pending: apps.filter(a => a.status === 'PENDING').length,
      inReview: apps.filter(a => a.status === 'IN_REVIEW').length,
      approved: apps.filter(a => a.status === 'APPROVED').length,
      rejected: apps.filter(a => a.status === 'REJECTED').length,
    };
  });

  protected setFilter(status: ApplicationStatus | 'ALL'): void {
    this.activeFilter.set(status);
  }

  protected loadAll(): void {
    this.reload.update(v => v + 1);
  }
}
