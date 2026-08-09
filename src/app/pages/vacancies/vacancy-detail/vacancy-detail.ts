import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { switchMap, tap, catchError, of } from 'rxjs';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-vacancy-detail',
  imports: [RouterLink, StatusBadge, DatePipe, NgIcon],
  templateUrl: './vacancy-detail.html',
  styleUrl: './vacancy-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacancyDetail {
  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly applied = signal(false);
  protected readonly applying = signal(false);

  private readonly reload = signal(0);

  readonly vacancy = toSignal(
    toObservable(this.reload).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(() => this.vacancyService.getById(this.id).pipe(
        tap(() => this.loading.set(false)),
        catchError((err: HttpErrorResponse) => {
          this.error.set(err.status === 404 ? 'Vaga não encontrada' : 'Erro ao carregar vaga');
          this.loading.set(false);
          return of(null);
        })
      ))
    ),
    { initialValue: null }
  );

  constructor() {
    this.applicationService.listMy().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (apps) => {
        const isApplied = apps.some(a => a.vacancy.id === this.id);
        if (isApplied) this.applied.set(true);
      }
    });
  }

  protected apply(): void {
    const v = this.vacancy();
    if (!v) return;
    this.applying.set(true);
    this.applicationService.apply(v.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => { this.applied.set(true); this.applying.set(false); },
      error: (err: HttpErrorResponse) => {
        this.applying.set(false);
        if (err.status === 409) this.applied.set(true);
      }
    });
  }

  protected loadAll(): void {
    this.reload.update(v => v + 1);
  }
}
