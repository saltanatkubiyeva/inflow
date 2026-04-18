import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { User } from './shared/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  template: `
  @if (isLoggedIn) {
    <div class="app-shell">
      <aside class="sidebar">
        <div class="sidebar-logo">
          <svg class="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 6.5V12c0 5 3.8 9.7 9 10.9C17.2 21.7 21 17 21 12V6.5L12 2z" fill="#818cf8"/>
            <path d="M9 12l2 2 4-4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">inflow</span>
        </div>
       <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a routerLink="/candidates" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><path d="M21 21v-2a4 4 0 0 0-3-3.87"/></svg>
            Candidates
          </a>
          <a routerLink="/vacancies" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            Vacancies
          </a>
          <a routerLink="/interviews" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Interviews
          </a>
        </nav>
        <div class="sidebar-footer">
          @if (currentUser) {
          <div class="user-info">
            <div class="user-avatar">{{ initials }}</div>
            <div class="user-details">
              <span class="user-name">{{ currentUser?.username }}</span>
              <span class="user-role">HR Manager</span>
            </div>
          </div>
          }
          <button class="logout-btn" (click)="logout()">Sign out</button>
        </div>
      </aside>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  } @else {
    <router-outlet></router-outlet>
  }
  `,
})
export class AppComponent {
  constructor(public auth: AuthService, private router: Router) {}

  get isLoggedIn(): boolean { return this.auth.isLoggedIn(); }
  get currentUser(): User | null { return this.auth.currentUser; }
  get initials(): string {
    const u = this.auth.currentUser;
    if (!u) return '?';
    return (u.first_name?.[0] || u.username[0]).toUpperCase();
  }

  logout(): void { this.auth.logout(); }
}
