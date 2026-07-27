import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { GameEngineService } from '../../game/game-engine.service';
import { getTrack } from '../../game/tracks';
import { ProgressService } from '../../services/progress.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-game-page',
  imports: [MatButtonModule],
  providers: [GameEngineService],
  templateUrl: './game.page.html',
  styleUrl: './game.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePage implements AfterViewInit, OnDestroy {
  @ViewChild('gameHost', { static: true })
  private gameHost!: ElementRef<HTMLElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly engine = inject(GameEngineService);
  private readonly progressService = inject(ProgressService);
  protected readonly track = getTrack(this.route.snapshot.paramMap.get('trackId'));
  protected readonly saveStatus = signal('');
  private lastSavedTime = -1;

  private readonly autosaveEffect = effect(() => {
    const state = this.engine.state();
    if (!this.track || !state.finished || state.elapsedMs === this.lastSavedTime) {
      return;
    }
    this.lastSavedTime = state.elapsedMs;
    void this.saveResult(state.elapsedMs);
  });

  async ngAfterViewInit(): Promise<void> {
    if (!this.track) {
      void this.router.navigate(['/tracks']);
      return;
    }
    if (this.track.id === 'desert-track') {
      try {
        const save = await this.progressService.getSave();
        if (!save.unlockedMaps.includes(this.track.id)) {
          await this.router.navigate(['/tracks']);
          return;
        }
      } catch {
        await this.router.navigate(['/tracks']);
        return;
      }
    }
    this.engine.start(this.gameHost.nativeElement, this.track);
  }

  ngOnDestroy(): void {
    this.engine.destroy();
  }

  protected exit(): void {
    void this.router.navigate(['/dashboard']);
  }

  protected formatTime(milliseconds: number | null): string {
    if (milliseconds === null) {
      return '--:--.---';
    }
    const minutes = Math.floor(milliseconds / 60_000);
    const seconds = Math.floor((milliseconds % 60_000) / 1000);
    const millis = Math.floor(milliseconds % 1000);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
  }

  private async saveResult(elapsedMs: number): Promise<void> {
    this.saveStatus.set('Saving result...');
    try {
      await this.progressService.saveRace(this.track!.id, elapsedMs);
      this.saveStatus.set('Progress saved');
    } catch {
      this.saveStatus.set('Result will need to be retried');
    }
  }
}
