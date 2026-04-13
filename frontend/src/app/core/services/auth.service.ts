import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthTokens, User } from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.API}/auth/login/`, { username, password }).pipe(
      tap(tokens => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('current_user', JSON.stringify(tokens.user));
        this.currentUserSubject.next(tokens.user);
      })
    );
  }

  logout(): void {
    const refresh = localStorage.getItem('refresh_token');
    this.http.post(`${this.API}/auth/logout/`, { refresh }).subscribe();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post<{ access: string }>(`${this.API}/auth/refresh/`, { refresh }).pipe(
      tap(res => localStorage.setItem('access_token', res.access))
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  }
}
