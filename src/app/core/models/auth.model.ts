export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  role: string;
}
