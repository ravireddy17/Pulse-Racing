import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CarColor, Profile } from '../../models/progress.models';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-garage-page',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './garage.page.html',
  styleUrls: ['../page-shell.scss', './garage.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaragePage implements OnInit {
  private readonly progressService = inject(ProgressService);
  protected readonly profile = signal<Profile | null>(null);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly colors: readonly CarColor[] = ['RED', 'BLUE', 'BLACK', 'WHITE', 'SILVER'];

  async ngOnInit(): Promise<void> {
    try {
      this.profile.set(await this.progressService.getProfile());
    } catch {
      this.message.set('Garage data could not be loaded.');
    }
  }

  protected async selectColor(color: CarColor): Promise<void> {
    if (this.saving() || this.profile()?.selectedCarColor === color) {
      return;
    }
    this.saving.set(true);
    this.message.set('');
    try {
      this.profile.set(await this.progressService.updateProfile({ selectedCarColor: color }));
      this.message.set('Car color saved.');
    } catch {
      this.message.set('Car color could not be saved.');
    } finally {
      this.saving.set(false);
    }
  }
}
