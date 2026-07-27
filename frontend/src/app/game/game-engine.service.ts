import { Injectable, signal } from '@angular/core';
import Phaser from 'phaser';
import { INITIAL_RACE_SNAPSHOT, RaceSnapshot, TrackDefinition } from './race.models';
import { RacingScene } from './racing.scene';

@Injectable()
export class GameEngineService {
  private game: Phaser.Game | null = null;
  private activeTrack: TrackDefinition | null = null;
  private readonly stateSignal = signal<RaceSnapshot>(INITIAL_RACE_SNAPSHOT);

  readonly state = this.stateSignal.asReadonly();

  start(parent: HTMLElement, track: TrackDefinition): void {
    this.destroy();
    this.activeTrack = track;
    const bestTimeMs = this.readBestTime(track.id);
    const scene = new RacingScene({
      track,
      bestTimeMs,
      onStateChange: (snapshot) => this.stateSignal.set({
        ...snapshot,
        bestTimeMs: this.readBestTime(track.id),
      }),
      onBestTime: (elapsedMs) => this.saveBestTime(track.id, elapsedMs),
    });
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      parent,
      width: parent.clientWidth,
      height: parent.clientHeight,
      backgroundColor: track.backgroundColor,
      physics: {
        default: 'arcade',
        arcade: { debug: false },
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
      },
      scene: [scene],
    });
  }

  restart(): void {
    const scene = this.game?.scene.getScenes(true)[0];
    scene?.scene.restart();
  }

  destroy(): void {
    this.game?.destroy(true);
    this.game = null;
    this.stateSignal.set(INITIAL_RACE_SNAPSHOT);
  }

  private readBestTime(trackId: string): number | null {
    const value = localStorage.getItem(`pulse-racing.best-time.${trackId}`);
    return value ? Number(value) : null;
  }

  private saveBestTime(trackId: string, elapsedMs: number): void {
    localStorage.setItem(`pulse-racing.best-time.${trackId}`, String(Math.round(elapsedMs)));
  }
}
