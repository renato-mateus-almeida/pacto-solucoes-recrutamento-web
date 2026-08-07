import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, TokenResponse, UserResponse } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _token = signal<string | null>(localStorage.getItem('token'));
  private readonly _name = signal<string | null>(localStorage.getItem('userName'));
  private readonly _role = signal<'USER' | 'ADMIN' | null>(localStorage.getItem('userRole') as 'USER' | 'ADMIN' | null);

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly userRole = this._role.asReadonly();
  readonly userName = this._name.asReadonly();
  readonly token = this._token.asReadonly();

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/api/v1/auth/login', request).pipe(
      tap(response => this.persistAuth(response))
    );
  }

  register(request: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>('/api/v1/auth/register', request);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    this._token.set(null);
    this._name.set(null);
    this._role.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this._token();
  }

  private persistAuth(response: TokenResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('userName', response.name);
    localStorage.setItem('userRole', response.role);
    this._token.set(response.token);
    this._name.set(response.name);
    this._role.set(response.role);
  }
}
