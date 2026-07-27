import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AuthStore } from '../../services/auth.store';
import { GameSave, Profile } from '../../models/progress.models';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);
  private readonly progressService = inject(ProgressService);
  protected readonly profile = signal<Profile | null>(null);
  protected readonly save = signal<GameSave | null>(null);

  async ngOnInit(): Promise<void> {
    const [profile, save] = await Promise.allSettled([
      this.progressService.getProfile(),
      this.progressService.getSave(),
    ]);
    if (profile.status === 'fulfilled') this.profile.set(profile.value);
    if (save.status === 'fulfilled') this.save.set(save.value);
  }

  protected logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}
