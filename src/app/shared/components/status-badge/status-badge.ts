import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { VacancyStatus } from '../../../core/models/vacancy.model';
import { ApplicationStatus } from '../../../core/models/application.model';

type BadgeStatus = VacancyStatus | ApplicationStatus;

const STATUS_STYLES: Record<BadgeStatus, string> = {
  PENDING:    'bg-amber-50 text-amber-800',
  IN_REVIEW:  'bg-blue-50 text-blue-800',
  APPROVED:   'bg-green-50 text-green-800',
  REJECTED:   'bg-red-50 text-red-800',
  OPEN:       'bg-green-50 text-green-800',
  CLOSED:     'bg-red-50 text-red-800',
  DRAFT:      'bg-amber-50 text-amber-800',
};

@Component({
  selector: 'app-status-badge',
  template: `
    <span [class]="badgeClass()" class="inline-block px-3 py-1 rounded-full text-xs font-semibold">
      {{ label() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusBadge {
  readonly status = input.required<BadgeStatus>();
  protected readonly badgeClass = computed(() => STATUS_STYLES[this.status()] ?? 'bg-neutral-100 text-neutral-600');
  protected readonly label = computed(() => {
    const map: Record<string, string> = {
      PENDING: 'PENDENTE', IN_REVIEW: 'EM ANÁLISE', APPROVED: 'APROVADA', REJECTED: 'REPROVADA',
      OPEN: 'OPEN', CLOSED: 'CLOSED', DRAFT: 'DRAFT'
    };
    return map[this.status()] ?? this.status();
  });
}
