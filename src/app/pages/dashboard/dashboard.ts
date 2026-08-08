import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgIcon } from '@ng-icons/core';
import { DashboardService } from '../../core/services/dashboard';
import { DashboardResponse } from '../../core/models/dashboard.model';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [StatusBadge, DatePipe, RouterLink, NgIcon],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Dashboard {
  private readonly dashboardService = inject(DashboardService);

  protected readonly error = signal<string | null>(null);

  readonly data = toSignal(
    this.dashboardService.getDashboard().pipe(
      tap(() => this.error.set(null)),
      catchError(() => { this.error.set('Erro ao carregar painel'); return of(null); })
    ),
    { initialValue: null as DashboardResponse | null }
  );
}
