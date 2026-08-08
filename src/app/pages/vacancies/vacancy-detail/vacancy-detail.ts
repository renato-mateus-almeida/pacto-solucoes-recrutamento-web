import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, of, tap } from 'rxjs';

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

  readonly vacancy = toSignal(
    this.vacancyService.getById(this.id).pipe(
      tap(() => this.error.set(null)),
      catchError((err: HttpErrorResponse) => {
        this.error.set(err.status === 404 ? 'Vaga não encontrada' : 'Erro ao carregar vaga');
        return of(null);
      })
    ),
    { initialValue: null }
  );

  protected readonly error = signal<string | null>(null);
  protected readonly applied = signal(false);
  protected readonly applying = signal(false);

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
}
