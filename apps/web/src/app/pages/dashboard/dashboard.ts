import { Component } from '@angular/core';

interface StatCard {
  label: string;
  value: string;
  delta: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly stats: StatCard[] = [
    { label: 'Active trainers', value: '12', delta: '+2 this month', icon: '🏋️' },
    { label: 'Active trainees', value: '148', delta: '+18 this month', icon: '🧑' },
    { label: 'Packages sold', value: '63', delta: '+9 this week', icon: '📦' },
    { label: 'Upcoming sessions', value: '27', delta: 'next 7 days', icon: '📅' },
  ];
}
