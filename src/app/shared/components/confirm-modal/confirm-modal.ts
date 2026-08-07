import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModal {
  readonly open = input(false);
  readonly title = input('Confirmar ação');
  readonly message = input('Tem certeza?');
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly variant = input<'danger' | 'primary'>('danger');
  readonly loading = input(false);

  readonly confirm = output();
  readonly cancel = output();
}
