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
          <span class="logo-icon">⬡</span>
          <span class="logo-text">inflow</span>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⊞</span> Dashboard
          </a>
          <a routerLink="/candidates" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">◎</span> Candidates
          </a>
          <a routerLink="/vacancies" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">◈</span> Vacancies
          </a>
          <a routerLink="/interviews" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">◷</span> Interviews
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
