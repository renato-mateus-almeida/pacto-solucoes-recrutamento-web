import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export function authGuard(expectedRole: 'USER' | 'ADMIN'): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.parseUrl('/auth/login');
    }

    if (authService.userRole() !== expectedRole) {
      return router.parseUrl('/');
    }

    return true;
  };
}
