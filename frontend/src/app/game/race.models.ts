export type TrackId = 'green-hills' | 'desert-track';

export interface TrackDefinition {
  readonly id: TrackId;
  readonly name: string;
  readonly subtitle: string;
  readonly backgroundColor: number;
  readonly roadColor: number;
  readonly shoulderColor: number;
  readonly accentColor: number;
  readonly points: ReadonlyArray<readonly [number, number]>;
}

export interface RaceSnapshot {
  readonly lap: number;
  readonly totalLaps: number;
  readonly elapsedMs: number;
  readonly bestTimeMs: number | null;
  readonly speed: number;
  readonly paused: boolean;
  readonly finished: boolean;
}

export const INITIAL_RACE_SNAPSHOT: RaceSnapshot = {
  lap: 1,
  totalLaps: 3,
  elapsedMs: 0,
  bestTimeMs: null,
  speed: 0,
  paused: false,
  finished: false,
};
