import { computed, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { AuthSession } from '../models/auth.models';
import { AuthUser } from '../models/auth.models';

const STORAGE_KEY = 'pulse-racing.session';
export const BROWSER_STORAGE = new InjectionToken<Storage | null>('Browser storage', {
  providedIn: 'root',
  factory: () => (typeof window === 'undefined' ? null : window.localStorage),
});

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly storage = inject(BROWSER_STORAGE);
  private readonly sessionState = signal<AuthSession | null>(this.restoreSession());

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  setSession(session: AuthSession): void {
    this.sessionState.set(session);
    this.storage?.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    this.sessionState.set(null);
    this.storage?.removeItem(STORAGE_KEY);
  }

  updateUser(user: AuthUser): void {
    const session = this.sessionState();
    if (!session) {
      return;
    }
    this.setSession({ ...session, user });
  }

  accessToken(): string | null {
    return this.sessionState()?.accessToken ?? null;
  }

  private restoreSession(): AuthSession | null {
    try {
      const value = this.storage?.getItem(STORAGE_KEY);
      if (!value) {
        return null;
      }
      const session = JSON.parse(value) as AuthSession;
      if (!session.accessToken || Date.parse(session.expiresAt) <= Date.now()) {
        this.storage?.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      this.storage?.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
