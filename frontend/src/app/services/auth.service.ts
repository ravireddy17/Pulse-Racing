import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiProblem,
  AuthSession,
  LoginRequest,
  RegisterRequest,
} from '../models/auth.models';
import { AuthStore } from './auth.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(AuthStore);

  async login(request: LoginRequest): Promise<void> {
    const session = await firstValueFrom(
      this.http.post<AuthSession>(`${environment.apiUrl}/auth/login`, request),
    );
    this.store.setSession(session);
  }

  async register(request: RegisterRequest): Promise<void> {
    const session = await firstValueFrom(
      this.http.post<AuthSession>(`${environment.apiUrl}/auth/register`, request),
    );
    this.store.setSession(session);
  }

  logout(): void {
    this.store.clearSession();
  }

  errorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'The service is temporarily unavailable.';
    }
    if (error.status === 0) {
      return 'Unable to reach the racing service.';
    }
    const problem = error.error as ApiProblem | undefined;
    return problem?.detail ?? 'The request could not be completed.';
  }
}
