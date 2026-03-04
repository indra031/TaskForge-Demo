import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@features/auth/store/auth.store';

export const authGuard: CanActivateFn = (_route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  localStorage.setItem('taskforge-return-url', state.url);
  return router.createUrlTree(['/login']);
};
