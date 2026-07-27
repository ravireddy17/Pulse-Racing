import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TRACKS } from '../../game/tracks';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-track-select-page',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './track-select.page.html',
  styleUrl: './track-select.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackSelectPage implements OnInit {
  private readonly progressService = inject(ProgressService);
  protected readonly tracks = TRACKS;
  protected readonly unlockedMaps = signal<readonly string[]>(['green-hills']);

  async ngOnInit(): Promise<void> {
    try {
      this.unlockedMaps.set((await this.progressService.getSave()).unlockedMaps);
    } catch {
      this.unlockedMaps.set(['green-hills']);
    }
  }

  protected isUnlocked(trackId: string): boolean {
    return this.unlockedMaps().includes(trackId);
  }
}
