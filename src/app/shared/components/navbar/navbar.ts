import { Component, inject, ChangeDetectionStrategy, signal, effect, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgIcon, DatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Navbar implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);

  protected dropdownOpen = signal(false);
  protected showDropdown = signal(false);

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.notificationService.connect();
        this.notificationService.loadUnreadCount();
      }
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.notificationService.connect();
      this.notificationService.loadUnreadCount();
    }
  }

  protected toggleDropdown(): void {
    if (!this.dropdownOpen()) {
      this.notificationService.loadAll().subscribe();
    }
    this.dropdownOpen.update(v => !v);
  }

  protected markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe();
  }

  protected logout(): void {
    this.notificationService.disconnect();
    this.dropdownOpen.set(false);
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.notificationService.disconnect();
  }
}
