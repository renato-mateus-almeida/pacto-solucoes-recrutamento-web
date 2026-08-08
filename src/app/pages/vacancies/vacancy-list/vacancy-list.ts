import { Component, inject, signal, computed, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { switchMap, tap, catchError, of } from 'rxjs';
import { VacancyService } from '../../../core/services/vacancy';
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
  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  protected searchTerm = '';
  protected statusFilter: VacancyStatus | '' = 'OPEN';

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly filters = signal<{ status?: VacancyStatus; requirement?: string }>({ status: 'OPEN' });

  readonly vacancies = toSignal(
    toObservable(this.filters).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(p => this.vacancyService.list(p)),
      tap(() => this.loading.set(false)),
      catchError(() => { this.error.set('Erro ao carregar vagas'); this.loading.set(false); return of([]); })
    ),
    { initialValue: [] as VacancyResponse[] }
  );

  constructor() {
    this.applicationService.listMy().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(apps => {
      this.appliedIds.set(new Set(apps.map(a => a.vacancy.id)));
    });
  }

  protected readonly appliedIds = signal<Set<number>>(new Set());
  protected readonly applyingId = signal<number | null>(null);

  protected readonly openCount = computed(() =>
    this.vacancies().filter(v => v.status === 'OPEN' && !this.appliedIds().has(v.id)).length
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
      next: () => {
        this.appliedIds.update(ids => { const s = new Set(ids); s.add(vacancyId); return s; });
        this.applyingId.set(null);
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.appliedIds.update(ids => { const s = new Set(ids); s.add(vacancyId); return s; });
        }
        this.applyingId.set(null);
      }
    });
  }
}
