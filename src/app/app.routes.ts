import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.Login)
  },
  {
    path: 'auth/register',
    loadComponent: () => import('./pages/auth/register/register').then(m => m.Register)
  },
  {
    path: 'vacancies',
    loadComponent: () => import('./pages/vacancies/vacancy-list/vacancy-list').then(m => m.VacancyList),
    canActivate: [authGuard('USER', 'ADMIN')]
  },
  {
    path: 'vacancies/:id',
    loadComponent: () => import('./pages/vacancies/vacancy-detail/vacancy-detail').then(m => m.VacancyDetail),
    canActivate: [authGuard('USER', 'ADMIN')]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard('USER')]
  },
  // {
  //   path: 'applications',
  //   loadComponent: () => import('./pages/applications/my-applications/my-applications').then(m => m.MyApplications),
  //   canActivate: [authGuard('USER')]
  // },
  {
    path: 'admin/vacancies',
    loadComponent: () => import('./pages/admin/admin-vacancies/admin-vacancies').then(m => m.AdminVacancies),
    canActivate: [authGuard('ADMIN')]
  },
  {
    path: 'admin/vacancies/new',
    loadComponent: () => import('./pages/admin/admin-vacancy-form/admin-vacancy-form').then(m => m.AdminVacancyForm),
    canActivate: [authGuard('ADMIN')]
  },
  {
    path: 'admin/vacancies/:vacancyId/applications',
    loadComponent: () => import('./pages/admin/admin-application-list/admin-application-list').then(m => m.AdminApplicationList),
    canActivate: [authGuard('ADMIN')]
  },
  {
    path: 'admin/vacancies/:vacancyId/applications/:id',
    loadComponent: () => import('./pages/admin/admin-application-detail/admin-application-detail').then(m => m.AdminApplicationDetail),
    canActivate: [authGuard('ADMIN')]
  },
  {
    path: 'admin/vacancies/:id',
    loadComponent: () => import('./pages/admin/admin-vacancy-form/admin-vacancy-form').then(m => m.AdminVacancyForm),
    canActivate: [authGuard('ADMIN')]
  },
  { path: '**', redirectTo: '' }
];
