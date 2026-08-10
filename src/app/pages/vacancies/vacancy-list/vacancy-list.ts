import { Component, inject, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { switchMap, tap, catchError, of, Observable } from 'rxjs';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationResponse } from '../../../core/models/application.model';
import { VacancyResponse, VacancyStatus } from '../../../core/models/vacancy.model';
import { ApplicationService } from '../../../core/services/application';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-vacancy-list',
  imports: [RouterLink, FormsModule, DatePipe, NgIcon],
  templateUrl: './vacancy-list.html',
  styleUrl: './vacancy-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacancyList {
  private static readonly STATUS = {
    OPEN: 'OPEN' as const,
  };

  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  protected searchTerm = '';
  protected statusFilter: VacancyStatus | '' = VacancyList.STATUS.OPEN;

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly filters = signal<{ status?: VacancyStatus; requirement?: string }>({ status: VacancyList.STATUS.OPEN });

  readonly vacancies = toSignal(
    toObservable(this.filters).pipe(
      tap(() => this.beginLoading()),
      switchMap(p => this.vacancyService.list(p)),
      tap(() => this.finishLoading()),
      catchError(() => this.handleVacanciesLoadError())
    ),
    { initialValue: [] as VacancyResponse[] }
  );

  protected readonly appliedIds = signal<Set<number>>(new Set());
  protected readonly applyingId = signal<number | null>(null);

  constructor() {
    this.applicationService.listMy().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(apps => this.storeAppliedIds(apps));
  }

  protected readonly openCount = computed(() =>
    this.vacancies().filter(v => v.status === VacancyList.STATUS.OPEN && !this.appliedIds().has(v.id)).length
  );

  protected readonly isNew = (createdAt: string): boolean => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  };

  protected load(): void {
    const params: { status?: VacancyStatus; requirement?: string } = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.searchTerm) params.requirement = this.searchTerm;
    this.filters.set(params);
  }

  protected apply(vacancyId: number, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.applyingId.set(vacancyId);
    this.applicationService.apply(vacancyId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.onApplySuccess(vacancyId),
      error: (err: HttpErrorResponse) => this.onApplyError(vacancyId, err)
    });
  }

  private storeAppliedIds(apps: ApplicationResponse[]): void {
    this.appliedIds.set(new Set(apps.map(a => a.vacancy.id)));
  }

  private beginLoading(): void {
    this.loading.set(true);
    this.error.set(null);
  }

  private finishLoading(): void {
    this.loading.set(false);
  }

  private handleVacanciesLoadError(): Observable<VacancyResponse[]> {
    this.error.set('Erro ao carregar vagas');
    this.loading.set(false);
    return of([]);
  }

  private onApplySuccess(vacancyId: number): void {
    this.addToAppliedIds(vacancyId);
    this.applyingId.set(null);
  }

  private onApplyError(vacancyId: number, err: HttpErrorResponse): void {
    if (err.status === 409) {
      this.addToAppliedIds(vacancyId);
    }
    this.applyingId.set(null);
  }

  private addToAppliedIds(vacancyId: number): void {
    this.appliedIds.update(ids => {
      const s = new Set(ids);
      s.add(vacancyId);
      return s;
    });
  }
}
