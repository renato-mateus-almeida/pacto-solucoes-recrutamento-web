import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { switchMap, catchError, of, tap } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [StatusBadge, DatePipe, RouterLink, NgIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly reload = signal(0);

  readonly data = toSignal(
    toObservable(this.reload).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(() => this.dashboardService.getDashboard().pipe(
        tap(() => this.loading.set(false)),
        catchError(() => { this.error.set('Erro ao carregar painel'); this.loading.set(false); return of(null); })
      ))
    ),
    { initialValue: null as DashboardResponse | null }
  );

  protected loadAll(): void {
    this.reload.update(v => v + 1);
  }
}
