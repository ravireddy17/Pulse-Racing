import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { Profile } from '../../models/progress.models';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-profile-page',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile.page.html',
  styleUrls: ['../page-shell.scss', './profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage implements OnInit {
  private readonly progressService = inject(ProgressService);
  protected readonly profile = signal<Profile | null>(null);
  protected readonly message = signal('');
  protected readonly username = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[A-Za-z0-9_]+$/)],
  });

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this.progressService.getProfile();
      this.profile.set(profile);
      this.username.setValue(profile.username);
    } catch {
      this.message.set('Profile could not be loaded.');
    }
  }

  protected async saveUsername(): Promise<void> {
    if (this.username.invalid) {
      this.username.markAsTouched();
      return;
    }
    try {
      this.profile.set(await this.progressService.updateProfile({ username: this.username.value }));
      this.message.set('Profile saved.');
    } catch {
      this.message.set('Profile could not be saved.');
    }
  }

  protected formatTime(value: number | null): string {
    if (value === null) return '--:--.---';
    const minutes = Math.floor(value / 60_000);
    const seconds = Math.floor((value % 60_000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, '0')}.${String(value % 1000).padStart(3, '0')}`;
  }
}
