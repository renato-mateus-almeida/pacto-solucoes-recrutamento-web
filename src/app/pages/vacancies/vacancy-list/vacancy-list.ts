import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { VacancyService } from '../../../core/services/vacancy';
import { VacancyResponse, VacancyStatus } from '../../../core/models/vacancy.model';
import { ApplicationService } from '../../../core/services/application';
import { AuthService } from '../../../core/services/auth';
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
  protected readonly authService = inject(AuthService);

  protected readonly vacancies = signal<VacancyResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly appliedIds = signal<Set<number>>(new Set());

  protected searchTerm = '';
  protected statusFilter: VacancyStatus | '' = 'OPEN';

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    const params: { status?: VacancyStatus; requirement?: string } = {};
    if (this.statusFilter) params.status = this.statusFilter;
    if (this.searchTerm) params.requirement = this.searchTerm;

    this.vacancyService.list(params).subscribe({
      next: (data) => { this.vacancies.set(data); this.loading.set(false); },
      error: () => { this.error.set('Erro ao carregar vagas'); this.loading.set(false); }
    });
  }

  protected apply(vacancyId: number): void {
    this.applicationService.apply(vacancyId).subscribe({
      next: () => {
        this.appliedIds.update(ids => { const s = new Set(ids); s.add(vacancyId); return s; });
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) {
          this.appliedIds.update(ids => { const s = new Set(ids); s.add(vacancyId); return s; });
        }
      }
    });
  }
}
