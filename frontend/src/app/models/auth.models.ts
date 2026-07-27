export interface AuthUser {
  readonly id: string;
  readonly username: string;
  readonly email: string;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresAt: string;
  readonly user: AuthUser;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface RegisterRequest extends LoginRequest {
  readonly username: string;
}

export interface ApiProblem {
  readonly title?: string;
  readonly detail?: string;
  readonly errors?: Record<string, string>;
}
