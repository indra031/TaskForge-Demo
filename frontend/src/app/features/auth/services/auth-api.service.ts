import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  AuthResponse,
  LoginRequest,
  LogoutRequest,
  RefreshRequest,
  RegisterRequest,
  UserResponse,
} from '@shared/models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiService);

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', request);
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', request);
  }

  refresh(request: RefreshRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/refresh', request);
  }

  logout(request: LogoutRequest): Observable<void> {
    return this.api.post<void>('/auth/logout', request);
  }

  me(): Observable<UserResponse> {
    return this.api.get<UserResponse>('/auth/me');
  }
}
