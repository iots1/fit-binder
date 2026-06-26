import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';

import { Observable, tap } from 'rxjs';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

const ACCESS_TOKEN_KEY = 'fb_access_token';
const REFRESH_TOKEN_KEY = 'fb_refresh_token';

/**
 * Authentication state for the web client. Talks to auth-bc via the `/api/auth`
 * dev proxy and persists tokens in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly accessToken = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  login(username: string, password: string): Observable<AuthTokens> {
    return this.http
      .post<AuthTokens>('/api/auth/v1/auth/login', { username, password })
      .pipe(tap((tokens) => this.storeTokens(tokens)));
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessToken.set(null);
  }

  token(): string | null {
    return this.accessToken();
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    this.accessToken.set(tokens.access_token);
  }
}
