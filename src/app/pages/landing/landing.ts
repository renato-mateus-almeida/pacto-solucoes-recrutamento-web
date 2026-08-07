import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, NgIcon],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Landing {
  protected readonly authService = inject(AuthService);
}
