import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <span class="logo-icon">⬡</span>
          <h1>inflow</h1>
          <p>HR Interview Tracker</p>
        </div>
        <form class="login-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Enter your username"
              [class.error]="error"
              required
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter your password"
              [class.error]="error"
              required
            />
          </div>
          @if (error) {
          <div class="error-msg">
            {{ error }}
          </div>
          }
          <button type="submit" class="btn-primary" [disabled]="loading">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Invalid username or password.';
        this.loading = false;
      }
    });
  }
}

@NgModule({
  declarations: [],
  imports: [LoginComponent, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: LoginComponent }])]
})
export class LoginModule {}
