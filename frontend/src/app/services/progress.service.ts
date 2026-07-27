import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthStore } from './auth.store';
import {
  CarColor,
  GameSave,
  LeaderboardEntry,
  Profile,
} from '../models/progress.models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly authStore = inject(AuthStore);

  getProfile(): Promise<Profile> {
    return firstValueFrom(this.http.get<Profile>(`${environment.apiUrl}/profile`));
  }

  updateProfile(update: {
    readonly username?: string;
    readonly selectedCarColor?: CarColor;
  }): Promise<Profile> {
    return firstValueFrom(
      this.http.put<Profile>(`${environment.apiUrl}/profile`, update),
    ).then((profile) => {
      const currentUser = this.authStore.user();
      if (currentUser) {
        this.authStore.updateUser({ ...currentUser, username: profile.username });
      }
      return profile;
    });
  }

  getSave(): Promise<GameSave> {
    return firstValueFrom(this.http.get<GameSave>(`${environment.apiUrl}/save`));
  }

  saveRace(trackId: string, raceTimeMs: number): Promise<GameSave> {
    return firstValueFrom(
      this.http.post<GameSave>(`${environment.apiUrl}/save`, {
        trackId,
        raceTimeMs: Math.round(raceTimeMs),
      }),
    );
  }

  updateSettings(masterVolume: number, reducedMotion: boolean): Promise<GameSave> {
    return firstValueFrom(
      this.http.put<GameSave>(`${environment.apiUrl}/save/settings`, {
        masterVolume,
        reducedMotion,
      }),
    );
  }

  getLeaderboard(): Promise<readonly LeaderboardEntry[]> {
    return firstValueFrom(
      this.http.get<readonly LeaderboardEntry[]>(`${environment.apiUrl}/leaderboard`),
    );
  }
}
