import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { authInterceptor } from './auth.interceptor';
import { HttpClient } from '@angular/common/http';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let token: string | null;
  const authStore = {
    accessToken: () => token,
  };

  beforeEach(() => {
    token = 'signed-token';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: authStore },
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('adds the current bearer token', () => {
    http.get('/api/profile').subscribe();

    const request = controller.expectOne('/api/profile');
    expect(request.request.headers.get('Authorization')).toBe('Bearer signed-token');
    request.flush({});
  });

  it('leaves requests unchanged when no session exists', () => {
    token = null;

    http.get('/api/leaderboard').subscribe();

    const request = controller.expectOne('/api/leaderboard');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush([]);
  });
});
