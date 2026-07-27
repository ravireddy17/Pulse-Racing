import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Pulse Racing',
    loadComponent: () =>
      import('./pages/landing/landing.page').then((module) => module.LandingPage),
  },
  {
    path: 'login',
    title: 'Login | Pulse Racing',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then((module) => module.LoginPage),
  },
  {
    path: 'register',
    title: 'Register | Pulse Racing',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/register/register.page').then((module) => module.RegisterPage),
  },
  {
    path: 'dashboard',
    title: 'Race Hub | Pulse Racing',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((module) => module.DashboardPage),
  },
  {
    path: 'tracks',
    title: 'Select Track | Pulse Racing',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/track-select/track-select.page').then(
        (module) => module.TrackSelectPage,
      ),
  },
  {
    path: 'race/:trackId',
    title: 'Race | Pulse Racing',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/game/game.page').then((module) => module.GamePage),
  },
  {
    path: 'garage',
    title: 'Garage | Pulse Racing',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/garage/garage.page').then((module) => module.GaragePage),
  },
  {
    path: 'profile',
    title: 'Profile | Pulse Racing',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.page').then((module) => module.ProfilePage),
  },
  {
    path: 'settings',
    title: 'Settings | Pulse Racing',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/settings/settings.page').then((module) => module.SettingsPage),
  },
  {
    path: 'leaderboard',
    title: 'Leaderboard | Pulse Racing',
    loadComponent: () =>
      import('./pages/leaderboard/leaderboard.page').then(
        (module) => module.LeaderboardPage,
      ),
  },
  { path: '**', redirectTo: '' },
];
