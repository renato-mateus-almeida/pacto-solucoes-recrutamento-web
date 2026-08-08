import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { switchMap, tap, catchError, of } from 'rxjs';
import { VacancyService } from '../../../core/services/vacancy';
import { VacancyStatus } from '../../../core/models/vacancy.model';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-vacancies',
  imports: [RouterLink, StatusBadge, ConfirmModal, DatePipe, FormsModule, NgIcon],
  templateUrl: './admin-vacancies.html',
  styleUrl: './admin-vacancies.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminVacancies {
  private readonly vacancyService = inject(VacancyService);
  private readonly destroyRef = inject(DestroyRef);

  protected searchTerm = '';
  protected statusFilter: VacancyStatus | '' = '';

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly filters = signal<{ status?: VacancyStatus; requirement?: string }>({});

  readonly vacancies = toSignal(
    toObservable(this.filters).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(p => this.vacancyService.list(p)),
      tap(() => this.loading.set(false)),
      catchError(() => { this.error.set('Erro ao carregar vagas'); this.loading.set(false); return of([]); })
    ),
    { initialValue: [] as any[] }
  );

  protected closingId = signal<number | null>(null);
  protected closing = signal(false);
  protected publishingId = signal<number | null>(null);

  protected load(): void {
    const params: { status?: VacancyStatus; requirement?: string } = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.searchTerm) params.requirement = this.searchTerm;
    this.filters.set(params);
  }

  protected confirmClose(id: number): void { this.closingId.set(id); }

  protected closeVacancy(): void {
    const id = this.closingId();
    if (!id) return;
    this.closing.set(true);
    this.vacancyService.updateStatus(id, 'CLOSED').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => { this.closingId.set(null); this.closing.set(false); this.load(); },
      error: () => { this.closingId.set(null); this.closing.set(false); }
    });
  }

  protected publish(id: number): void {
    this.publishingId.set(id);
    this.vacancyService.updateStatus(id, 'OPEN').pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => { this.publishingId.set(null); this.load(); },
      error: () => { this.publishingId.set(null); }
    });
  }
}
