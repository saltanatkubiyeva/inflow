import { NgModule, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats, PipelineSummary } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, DatePipe, TitleCasePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="page-subtitle">Your hiring pipeline at a glance</p>
      </div>

      @if (error) {
      <div class="error-banner">{{ error }}</div>
      }

      @if (stats) {
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-value">{{ stats?.total_candidates }}</span>
          <span class="stat-label">Total Candidates</span>
        </div>
        <div class="stat-card accent">
          <span class="stat-value">{{ stats?.total_vacancies }}</span>
          <span class="stat-label">Open Vacancies</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">{{ stats?.upcoming_interviews?.length }}</span>
          <span class="stat-label">Upcoming Interviews</span>
        </div>
        <div class="stat-card success">
          <span class="stat-value">{{ stats?.pipeline?.hired }}</span>
          <span class="stat-label">Hired This Period</span>
        </div>
      </div>
      }

      @if (stats) {
      <div class="pipeline-section">
        <h2>Candidate Pipeline</h2>
        <div class="pipeline-track">
          @for (stage of pipelineStages; track stage.key) {
          <div class="pipeline-stage">
            <div class="stage-count" [class]="'stage-' + stage.key">
              {{ stats?.pipeline?.[stage.key] }}
            </div>
            <div class="stage-label">{{ stage.label }}</div>
            <div class="stage-bar">
              <div class="stage-fill" [style.width.%]="getPercent(stats?.pipeline?.[stage.key] ?? 0)"></div>
            </div>
          </div>
          }
        </div>
      </div>
      }

      @if (stats) {
      <div class="two-col">
        <div class="card">
          <div class="card-header">
            <h3>Recent Candidates</h3>
            <a routerLink="/candidates" class="link-sm">View all →</a>
          </div>
          @if (stats?.recent_candidates?.length === 0) {
          <div class="empty-state">No candidates yet</div>
          }
          @for (c of stats?.recent_candidates; track c.id) {
          <div class="candidate-row">
            <div class="candidate-avatar">{{ c.full_name[0] }}</div>
            <div class="candidate-info">
              <span class="candidate-name">{{ c.full_name }}</span>
              <span class="candidate-role">{{ c.vacancy_title || 'No vacancy' }}</span>
            </div>
            <span class="badge" [class]="'badge-' + c.status">{{ c.status }}</span>
          </div>
          }
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Upcoming Interviews</h3>
            <a routerLink="/interviews" class="link-sm">View all →</a>
          </div>
          @if (stats?.upcoming_interviews?.length === 0) {
          <div class="empty-state">No interviews scheduled</div>
          }
          @for (i of stats?.upcoming_interviews; track i.id) {
          <div class="interview-row">
            <div class="interview-date">
              <span class="date-day">{{ i.scheduled_at | date:'d' }}</span>
              <span class="date-mon">{{ i.scheduled_at | date:'MMM' }}</span>
            </div>
            <div class="interview-info">
              <span class="interview-name">{{ i.candidate_name }}</span>
              <span class="interview-type">{{ i.interview_type | titlecase }} · {{ i.scheduled_at | date:'HH:mm' }}</span>
            </div>
            <span class="badge badge-scheduled">{{ i.status }}</span>
          </div>
          }
        </div>
      </div>
      }

      @if (loading) {
      <div class="loading">Loading dashboard…</div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  error = '';

  pipelineStages = [
    { key: 'new', label: 'New' },
    { key: 'screening', label: 'Screening' },
    { key: 'interview', label: 'Interview' },
    { key: 'offer', label: 'Offer' },
    { key: 'hired', label: 'Hired' },
    { key: 'rejected', label: 'Rejected' },
  ] as { key: keyof PipelineSummary, label: string }[];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: data => { this.stats = data; this.loading = false; },
      error: () => { this.error = 'Failed to load dashboard.'; this.loading = false; }
    });
  }

  getPercent(val: number): number {
    if (!this.stats) return 0;
    return Math.round((val / Math.max(this.stats.total_candidates, 1)) * 100);
  }
}

@NgModule({
  declarations: [],
  imports: [DashboardComponent, CommonModule, RouterModule.forChild([{ path: '', component: DashboardComponent }])]
})
export class DashboardModule {}
