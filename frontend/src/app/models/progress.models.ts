export type CarColor = 'RED' | 'BLUE' | 'BLACK' | 'WHITE' | 'SILVER';

export interface Profile {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly coins: number;
  readonly experience: number;
  readonly gamesPlayed: number;
  readonly bestTimeMs: number | null;
  readonly highestLevel: number;
  readonly selectedCarColor: CarColor;
  readonly dateJoined: string;
  readonly lastLogin: string | null;
}

export interface GameSave {
  readonly currentLevel: number;
  readonly coins: number;
  readonly bestTimeMs: number | null;
  readonly unlockedMaps: readonly string[];
  readonly settings: {
    readonly masterVolume: number;
    readonly reducedMotion: boolean;
  };
  readonly lastPlayedTime: string;
}

export interface LeaderboardEntry {
  readonly rank: number;
  readonly username: string;
  readonly bestTimeMs: number;
  readonly totalWins: number;
}
