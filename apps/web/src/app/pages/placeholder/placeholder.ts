import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

import { map } from 'rxjs';

/**
 * Temporary page for nav routes that don't have a screen yet.
 * Reads its title from the route's `data.title`.
 */
@Component({
  selector: 'app-placeholder',
  templateUrl: './placeholder.html',
})
export class Placeholder {
  private readonly route = inject(ActivatedRoute);

  readonly title = toSignal(this.route.data.pipe(map((d) => (d['title'] as string) ?? 'Page')), {
    initialValue: 'Page',
  });
}
