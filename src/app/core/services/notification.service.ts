import { Injectable, inject, signal, NgZone, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificationResponse, UnreadCountResponse } from '../models/notification.model';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly zone = inject(NgZone);
  private readonly base = '/api/v1/notifications';

  private eventSource: EventSource | null = null;

  readonly notifications = signal<NotificationResponse[]>([]);
  readonly unreadCount = signal<number>(0);

  connect(): void {
    if (this.eventSource || !this.authService.isAuthenticated()) {
      return;
    }

    const token = this.authService.getToken();
    const url = `${this.base}/stream?token=${token}`;

    this.eventSource = new EventSource(url);

    this.eventSource.onmessage = (event) => {
      const notification: NotificationResponse = JSON.parse(event.data);
      this.zone.run(() => {
        this.notifications.update(n => [notification, ...n]);
        this.unreadCount.update(c => c + 1);
      });
    };

    this.eventSource.onerror = () => {
      this.disconnect();
    };
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  loadAll(): Observable<NotificationResponse[]> {
    return this.http.get<NotificationResponse[]>(this.base).pipe(
      tap(notifications => {
        this.notifications.set(notifications);
        this.unreadCount.set(notifications.filter(n => !n.read).length);
      })
    );
  }

  loadUnreadCount(): void {
    this.http.get<UnreadCountResponse>(`${this.base}/unread-count`).subscribe({
      next: (res) => this.unreadCount.set(res.count)
    });
  }

  markAsRead(id: number): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.base}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(ns =>
          ns.map(n => n.id === id ? { ...n, read: true } : n)
        );
        this.unreadCount.update(c => Math.max(0, c - 1));
      })
    );
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
