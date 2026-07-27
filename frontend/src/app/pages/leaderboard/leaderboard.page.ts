import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { LeaderboardEntry } from '../../models/progress.models';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-leaderboard-page',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './leaderboard.page.html',
  styleUrls: ['../page-shell.scss', './leaderboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardPage implements OnInit {
  private readonly progressService = inject(ProgressService);
  protected readonly entries = signal<readonly LeaderboardEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  async ngOnInit(): Promise<void> {
    try {
      this.entries.set(await this.progressService.getLeaderboard());
    } catch {
      this.failed.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  protected formatTime(value: number): string {
    const minutes = Math.floor(value / 60_000);
    const seconds = Math.floor((value % 60_000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(value % 1000).padStart(3, '0')}`;
  }
}
