import { Component, input, output, ChangeDetectionStrategy, ElementRef, viewChild, effect, inject } from '@angular/core';

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

  private readonly confirmBtn = viewChild<ElementRef<HTMLButtonElement>>('confirmBtn');

  constructor() {
    effect(() => {
      if (this.open()) {
        setTimeout(() => this.confirmBtn()?.nativeElement.focus(), 0);
      }
    });
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancel.emit();
    }
  }
}
