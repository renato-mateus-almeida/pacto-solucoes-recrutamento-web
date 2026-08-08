import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { VacancyResponse } from '../../../core/models/vacancy.model';
import { ApplicationResponse, ApplicationStatus } from '../../../core/models/application.model';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { catchError, of } from 'rxjs';

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

  readonly vacancy = toSignal(
    this.vacancyService.getById(this.vacancyId).pipe(
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  readonly applications = toSignal(
    this.vacancyService.listApplications(this.vacancyId).pipe(
      catchError(() => of([] as ApplicationResponse[]))
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
}
