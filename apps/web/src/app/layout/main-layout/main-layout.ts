import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly collapsed = signal(false);

  readonly nav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Trainers', path: '/trainers', icon: '🏋️' },
    { label: 'Trainees', path: '/trainees', icon: '🧑' },
    { label: 'Packages', path: '/packages', icon: '📦' },
    { label: 'Appointments', path: '/appointments', icon: '📅' },
  ];

  toggle(): void {
    this.collapsed.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
