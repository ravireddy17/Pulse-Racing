import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { RouterLink } from '@angular/router';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, MatButtonModule, MatSlideToggleModule, MatSliderModule, RouterLink],
  templateUrl: './settings.page.html',
  styleUrls: ['../page-shell.scss', './settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage implements OnInit {
  private readonly progressService = inject(ProgressService);
  protected readonly volume = signal(80);
  protected readonly reducedMotion = signal(false);
  protected readonly message = signal('');

  async ngOnInit(): Promise<void> {
    try {
      const save = await this.progressService.getSave();
      this.volume.set(save.settings.masterVolume);
      this.reducedMotion.set(save.settings.reducedMotion);
      document.documentElement.classList.toggle(
        'reduced-motion',
        save.settings.reducedMotion,
      );
    } catch {
      this.message.set('Settings could not be loaded.');
    }
  }

  protected async save(): Promise<void> {
    try {
      await this.progressService.updateSettings(this.volume(), this.reducedMotion());
      document.documentElement.classList.toggle('reduced-motion', this.reducedMotion());
      this.message.set('Settings saved.');
    } catch {
      this.message.set('Settings could not be saved.');
    }
  }
}
