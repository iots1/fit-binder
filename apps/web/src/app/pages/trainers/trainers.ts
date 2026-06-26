import { Component, OnInit, inject, signal } from '@angular/core';

import type { ITrainer, TrainerStatus } from '@contracts';

import { TrainerApiService } from '../../core/trainer-api.service';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.html',
})
export class Trainers implements OnInit {
  private readonly api = inject(TrainerApiService);

  readonly rows = signal<ITrainer[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly page = signal(1);
  readonly totalPages = signal(0);
  readonly total = signal(0);
  private readonly pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.list(this.page(), this.pageSize).subscribe({
      next: (result) => {
        this.rows.set(result.data);
        this.total.set(result.pagination.total_records);
        this.totalPages.set(result.pagination.total_pages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load trainers. Is trainer-bc running?');
        this.loading.set(false);
      },
    });
  }

  prev(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  next(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  fullName(t: ITrainer): string {
    return `${t.first_name} ${t.last_name}`;
  }

  statusClass(status: TrainerStatus): string {
    switch (status) {
      case 'active':
        return 'bg-brand-100 text-brand-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-ink-200 text-ink-600';
    }
  }
}
