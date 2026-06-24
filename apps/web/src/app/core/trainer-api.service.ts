import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import type { IJsonApiResponse, IPaginatedResult, ITrainer } from '@contracts';
import { Observable } from 'rxjs';

/**
 * Example API client showing how the web app consumes the trainer-bc API using
 * the shared `@contracts` types (single source of truth with the backend).
 */
@Injectable({ providedIn: 'root' })
export class TrainerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/trainer/v1/trainers';

  list(): Observable<IJsonApiResponse<ITrainer>> {
    return this.http.get<IJsonApiResponse<ITrainer>>(this.baseUrl);
  }

  getById(id: string): Observable<IJsonApiResponse<ITrainer>> {
    return this.http.get<IJsonApiResponse<ITrainer>>(`${this.baseUrl}/${id}`);
  }

  // Demonstrates the paginated service shape for typed list rendering.
  toRows(result: IPaginatedResult<ITrainer>): ITrainer[] {
    return result.data;
  }
}
