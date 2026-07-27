import { TestBed } from '@angular/core/testing';
import { AuthSession } from '../models/auth.models';
import { AuthStore, BROWSER_STORAGE } from './auth.store';

describe('AuthStore', () => {
  let storage: Storage;

  beforeEach(() => {
    const values = new Map<string, string>();
    storage = {
      get length() {
        return values.size;
      },
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      key: (index) => [...values.keys()][index] ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, value),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: BROWSER_STORAGE, useValue: storage }],
    });
  });

  it('persists and clears an authenticated session', () => {
    const store = TestBed.inject(AuthStore);
    const session: AuthSession = {
      accessToken: 'signed-token',
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: {
        id: '14f44189-1176-4c01-8642-4cdb82df70a1',
        username: 'apex_driver',
        email: 'driver@example.com',
      },
    };

    store.setSession(session);

    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()?.username).toBe('apex_driver');
    expect(storage.getItem('pulse-racing.session')).toContain('signed-token');

    store.clearSession();

    expect(store.isAuthenticated()).toBe(false);
    expect(storage.getItem('pulse-racing.session')).toBeNull();
  });
});
