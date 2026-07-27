import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { ProgressService } from './progress.service';

describe('ProgressService', () => {
  let service: ProgressService;
  let controller: HttpTestingController;
  const authStore = {
    user: () => ({
      id: 'user-id',
      username: 'old_driver',
      email: 'driver@example.com',
    }),
    updateUser: vi.fn(),
  };

  beforeEach(() => {
    authStore.updateUser.mockClear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: authStore },
      ],
    });
    service = TestBed.inject(ProgressService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => controller.verify());

  it('submits a rounded race result', async () => {
    const result = service.saveRace('green-hills', 93_421.7);
    const request = controller.expectOne('http://localhost:8080/api/save');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      trackId: 'green-hills',
      raceTimeMs: 93_422,
    });
    request.flush({
      currentLevel: 2,
      coins: 250,
      bestTimeMs: 93_422,
      unlockedMaps: ['green-hills', 'desert-track'],
      settings: { masterVolume: 80, reducedMotion: false },
      lastPlayedTime: new Date().toISOString(),
    });

    expect((await result).coins).toBe(250);
  });

  it('updates the locally displayed username after a profile update', async () => {
    const result = service.updateProfile({ username: 'new_driver' });
    const request = controller.expectOne('http://localhost:8080/api/profile');

    expect(request.request.method).toBe('PUT');
    request.flush({
      id: 'user-id',
      username: 'new_driver',
      email: 'driver@example.com',
      coins: 0,
      experience: 0,
      gamesPlayed: 0,
      bestTimeMs: null,
      highestLevel: 1,
      selectedCarColor: 'RED',
      dateJoined: new Date().toISOString(),
      lastLogin: null,
    });

    expect((await result).username).toBe('new_driver');
    expect(authStore.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'new_driver' }),
    );
  });

  it('sends persisted settings through the dedicated endpoint', async () => {
    const result = service.updateSettings(55, true);
    const request = controller.expectOne('http://localhost:8080/api/save/settings');

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ masterVolume: 55, reducedMotion: true });
    request.flush({
      currentLevel: 1,
      coins: 0,
      bestTimeMs: null,
      unlockedMaps: ['green-hills'],
      settings: { masterVolume: 55, reducedMotion: true },
      lastPlayedTime: new Date().toISOString(),
    });

    expect((await result).settings.reducedMotion).toBe(true);
  });
});
