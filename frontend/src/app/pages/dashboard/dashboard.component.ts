import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats, PipelineSummary } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, DatePipe, TitleCasePipe],
  templateUrl: './dashboard.component.html',
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

  constructor(private api: ApiService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  private normalizeDashboard(data: unknown): DashboardStats | null {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const obj = data as Record<string, unknown>;
      if (obj['results'] && typeof obj['results'] === 'object' && !Array.isArray(obj['results'])) {
        return obj['results'] as DashboardStats;
      }
      return data as unknown as DashboardStats;
    }
    return null;
  }

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: data => {
        this.zone.run(() => {
          try {
            console.log('Received data:', data);
            this.stats = this.normalizeDashboard(data);
          } finally {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.error = 'Failed to load dashboard.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  getPercent(val: number): number {
    if (!this.stats) return 0;
    return Math.round((val / Math.max(this.stats.total_candidates, 1)) * 100);
  }
}
