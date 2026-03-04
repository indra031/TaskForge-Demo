import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { publicGuard } from '@core/guards/public.guard';
import { AuthLayoutComponent } from '@core/layout/auth-layout.component';
import { MainLayoutComponent } from '@core/layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [publicGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/pages/login-page.component').then(
            (m) => m.LoginPageComponent
          ),
      },
    ],
  },
  {
    path: 'register',
    component: AuthLayoutComponent,
    canActivate: [publicGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/auth/pages/register-page.component').then(
            (m) => m.RegisterPageComponent
          ),
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
