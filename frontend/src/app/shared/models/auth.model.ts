export interface UserResponse {
  id: string;
  email: string;
  fullName: string | null;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  accessToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
