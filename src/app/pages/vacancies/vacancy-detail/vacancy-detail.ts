import { Component, inject, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { switchMap, tap, catchError, of, Observable } from 'rxjs';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ApplicationResponse } from '../../../core/models/application.model';

@Component({
  selector: 'app-vacancy-detail',
  imports: [RouterLink, StatusBadge, DatePipe, NgIcon],
  templateUrl: './vacancy-detail.html',
  styleUrl: './vacancy-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VacancyDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly applied = signal(false);
  protected readonly applying = signal(false);

  private readonly refreshTrigger = signal(0);

  readonly vacancy = toSignal(
    toObservable(this.refreshTrigger).pipe(
      tap(() => this.beginLoading()),
      switchMap(() => this.vacancyService.getById(this.id).pipe(
        tap(() => this.finishLoading()),
        catchError((err: HttpErrorResponse) => this.handleVacancyError(err))
      ))
    ),
    { initialValue: null }
  );

  constructor() {
    this.applicationService.listMy().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(apps => this.storeAppliedStatus(apps));
  }

  protected apply(): void {
    const v = this.vacancy();
    if (!v) return;
    this.applying.set(true);
    this.applicationService.apply(v.id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => this.onApplySuccess(),
      error: (err: HttpErrorResponse) => this.onApplyError(err)
    });
  }

  protected loadAll(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  private storeAppliedStatus(apps: ApplicationResponse[]): void {
    const isApplied = apps.some(a => a.vacancy.id === this.id);
    if (isApplied) this.applied.set(true);
  }

  private beginLoading(): void {
    this.loading.set(true);
    this.error.set(null);
  }

  private finishLoading(): void {
    this.loading.set(false);
  }

  private handleVacancyError(err: HttpErrorResponse): Observable<null> {
    this.error.set(err.status === 404 ? 'Vaga não encontrada' : 'Erro ao carregar vaga');
    this.loading.set(false);
    return of(null);
  }

  private onApplySuccess(): void {
    this.applied.set(true);
    this.applying.set(false);
  }

  private onApplyError(err: HttpErrorResponse): void {
    this.applying.set(false);
    if (err.status === 409) this.applied.set(true);
  }
}
