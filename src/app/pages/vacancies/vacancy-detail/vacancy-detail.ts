import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { ApplicationService } from '../../../core/services/application';
import { AuthService } from '../../../core/services/auth';
import { VacancyResponse, VacancyStatus } from '../../../core/models/vacancy.model';
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
export class VacancyDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly vacancyService = inject(VacancyService);
  private readonly applicationService = inject(ApplicationService);
  protected readonly authService = inject(AuthService);

  protected readonly vacancy = signal<VacancyResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly applied = signal(false);
  protected readonly applying = signal(false);
  protected readonly updatingStatus = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.vacancyService.getById(id).subscribe({
      next: (data) => { this.vacancy.set(data); this.loading.set(false); },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 404 ? 'Vaga não encontrada' : 'Erro ao carregar vaga');
        this.loading.set(false);
      }
    });
  }

  protected apply(): void {
    const v = this.vacancy();
    if (!v) return;
    this.applying.set(true);
    this.applicationService.apply(v.id).subscribe({
      next: () => { this.applied.set(true); this.applying.set(false); },
      error: (err: HttpErrorResponse) => {
        this.applying.set(false);
        if (err.status === 409) this.applied.set(true);
      }
    });
  }

  protected updateStatus(status: VacancyStatus): void {
    const v = this.vacancy();
    if (!v) return;
    this.updatingStatus.set(true);
    this.vacancyService.updateStatus(v.id, status).subscribe({
      next: (updated) => {
        this.vacancy.set(updated);
        this.updatingStatus.set(false);
      },
      error: () => {
        this.updatingStatus.set(false);
      }
    });
  }
}
