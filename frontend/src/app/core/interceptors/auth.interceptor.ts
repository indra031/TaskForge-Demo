import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { AuthStore } from '@features/auth/store/auth.store';
import { AuthApiService } from '@features/auth/services/auth-api.service';

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh'];

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

function isAuthEndpoint(url: string): boolean {
  return AUTH_PATHS.some((path) => url.includes(path));
}

function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authStore = inject(AuthStore);
  const authApi = inject(AuthApiService);

  if (isAuthEndpoint(req.url)) {
    return next(req);
  }

  const token = authStore.accessToken();
  const authedReq = token ? addToken(req, token) : req;

  return next(authedReq).pipe(
    catchError((error) => {
      if (error.status === 401 && token) {
        return handleRefresh(req, next, authStore, authApi);
      }
      return throwError(() => error);
    })
  );
};

function handleRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authStore: InstanceType<typeof AuthStore>,
  authApi: AuthApiService
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    const refreshToken = authStore.refreshToken();
    if (!refreshToken) {
      isRefreshing = false;
      authStore.logout();
      return throwError(() => new Error('No refresh token'));
    }

    return authApi.refresh({ refreshToken }).pipe(
      switchMap((response) => {
        isRefreshing = false;
        localStorage.setItem('taskforge-access-token', response.accessToken);
        localStorage.setItem('taskforge-refresh-token', response.refreshToken);
        localStorage.setItem('taskforge-user', JSON.stringify(response.user));
        refreshSubject.next(response.accessToken);
        return next(addToken(req, response.accessToken));
      }),
      catchError((err) => {
        isRefreshing = false;
        authStore.logout();
        return throwError(() => err);
      })
    );
  }

  return refreshSubject.pipe(
    filter((token): token is string => token !== null),
    take(1),
    switchMap((token) => next(addToken(req, token)))
  );
}
