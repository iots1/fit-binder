import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type {
  IJsonApiResponse,
  IPaginatedResult,
  IPagination,
  ITrainer,
} from '@contracts';
import { Observable, map } from 'rxjs';

const EMPTY_PAGINATION: IPagination = {
  page: 1,
  page_size: 10,
  total: 0,
  total_records: 0,
  total_pages: 0,
};

/**
 * API client for trainer-bc. Consumes the shared `@contracts` types (single source
 * of truth with the backend) and flattens the JSON:API envelope into typed rows.
 */
@Injectable({ providedIn: 'root' })
export class TrainerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/trainer/v1/trainers';

  /** Paginated list of trainers, flattened to `ITrainer` rows. */
  list(page = 1, limit = 10): Observable<IPaginatedResult<ITrainer>> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http
      .get<IJsonApiResponse<ITrainer>>(this.baseUrl, { params })
      .pipe(map((res) => this.toPaginated(res)));
  }

  getById(id: string): Observable<ITrainer> {
    return this.http.get<IJsonApiResponse<ITrainer>>(`${this.baseUrl}/${id}`).pipe(
      map((res) => {
        const resource = Array.isArray(res.data) ? res.data[0] : res.data;
        return { ...(resource?.attributes as ITrainer), id: resource?.id } as ITrainer;
      }),
    );
  }

  private toPaginated(res: IJsonApiResponse<ITrainer>): IPaginatedResult<ITrainer> {
    const resources = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
    return {
      data: resources.map((r) => ({ ...(r.attributes as ITrainer), id: r.id }) as ITrainer),
      pagination: res.meta.pagination ?? EMPTY_PAGINATION,
    };
  }
}
