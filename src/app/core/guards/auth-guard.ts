import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export function authGuard(...expectedRoles: ('USER' | 'ADMIN')[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.parseUrl('/auth/login');
    }

    if (!expectedRoles.includes(authService.userRole()!)) {
      return router.parseUrl('/');
    }

    return true;
  };
}
