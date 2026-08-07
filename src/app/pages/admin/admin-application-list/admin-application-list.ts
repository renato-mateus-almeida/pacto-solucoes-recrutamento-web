import { Component, inject, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { VacancyResponse } from '../../../core/models/vacancy.model';
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
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly vacancy = signal<VacancyResponse | null>(null);
  protected readonly applications = signal<ApplicationResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingVacancy = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly vacancyError = signal<string | null>(null);

  protected readonly activeFilter = signal<ApplicationStatus | 'ALL'>('ALL');
  protected readonly movingToReview = signal<Set<number>>(new Set());

  protected vacancyId!: number;

  protected readonly filtered = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.applications();
    return this.applications().filter(a => a.status === filter);
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

  ngOnInit(): void {
    this.vacancyId = Number(this.route.snapshot.paramMap.get('vacancyId'));
    this.loadVacancy();
    this.loadApplications();
  }

  private loadVacancy(): void {
    this.vacancyService.getById(this.vacancyId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (v) => { this.vacancy.set(v); this.loadingVacancy.set(false); },
      error: () => { this.vacancyError.set('Vaga não encontrada'); this.loadingVacancy.set(false); }
    });
  }

  protected loadApplications(): void {
    this.loading.set(true);
    this.error.set(null);
    this.vacancyService.listApplications(this.vacancyId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => { this.applications.set(data); this.loading.set(false); },
      error: () => { this.error.set('Erro ao carregar candidaturas'); this.loading.set(false); }
    });
  }

  protected startReview(app: ApplicationResponse): void {
    this.movingToReview.update(s => { const ns = new Set(s); ns.add(app.id); return ns; });
    this.applicationService.updateStatus(app.id, 'IN_REVIEW').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => { this.loadApplications(); this.movingToReview.update(s => { const ns = new Set(s); ns.delete(app.id); return ns; }); },
      error: () => { this.movingToReview.update(s => { const ns = new Set(s); ns.delete(app.id); return ns; }); }
    });
  }

  protected setFilter(status: ApplicationStatus | 'ALL'): void {
    this.activeFilter.set(status);
  }
}
