import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
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

  protected readonly data = signal<DashboardResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.dashboardService.getDashboard().subscribe({
      next: (res) => { this.data.set(res); this.loading.set(false); },
      error: () => { this.error.set('Erro ao carregar painel'); this.loading.set(false); }
    });
  }
}
