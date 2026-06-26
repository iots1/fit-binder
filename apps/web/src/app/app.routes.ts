import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { MainLayout } from './layout/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/login/login';
import { Placeholder } from './pages/placeholder/placeholder';
import { Register } from './pages/register/register';
import { Trainers } from './pages/trainers/trainers';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'trainers', component: Trainers },
      { path: 'trainees', component: Placeholder, data: { title: 'Trainees' } },
      { path: 'packages', component: Placeholder, data: { title: 'Packages' } },
      { path: 'appointments', component: Placeholder, data: { title: 'Appointments' } },
    ],
  },
  { path: '**', redirectTo: '' },
];
