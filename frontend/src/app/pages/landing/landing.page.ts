import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../services/auth.store';

@Component({
  selector: 'app-landing-page',
  imports: [MatButtonModule, RouterLink],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  protected play(): void {
    void this.router.navigate([this.authStore.isAuthenticated() ? '/dashboard' : '/login']);
  }
}
