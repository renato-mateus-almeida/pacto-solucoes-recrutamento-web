import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../../../core/models/error.model';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Login {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly credentialsError = signal(false);

  protected submit(): void {
    if (!this.validateForm()) return;
    this.beginSubmit();
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (res) => this.onLoginSuccess(res),
      error: (err: HttpErrorResponse) => this.handleLoginError(err)
    });
  }

  private validateForm(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return false;
    }
    return true;
  }

  private beginSubmit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.credentialsError.set(false);
  }

  private onLoginSuccess(res: { role: string }): void {
    this.router.navigate([this.getTargetRoute(res.role)]);
  }

  private getTargetRoute(role: string): string {
    return role === 'ADMIN' ? '/admin/vacancies' : '/dashboard';
  }

  private handleLoginError(err: HttpErrorResponse): void {
    this.loading.set(false);
    if (err.status === 401) return this.handleUnauthorized();
    if (err.status === 400 && (err.error as ApiError)?.fields) {
      this.error.set('Verifique os campos abaixo');
      return;
    }
    this.error.set('Erro inesperado. Tente novamente.');
  }

  private handleUnauthorized(): void {
    this.credentialsError.set(true);
    this.error.set('Email ou senha inválidos');
    this.form.controls.password.reset();
    this.form.controls.email.markAsDirty();
    this.form.controls.password.markAsDirty();
  }
}
