import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Interview, Candidate, Feedback } from '../../shared/models';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [FormsModule, DatePipe, TitleCasePipe],
  templateUrl: './interviews.component.html',
})
export class InterviewsComponent implements OnInit {
  interviews: Interview[] = [];
  filtered: Interview[] = [];
  candidates: Candidate[] = [];
  loading = true;
  error = '';
  statusFilter = '';

  showInterviewForm = false;
  iSaving = false;
  iFormError = '';
  iForm: Partial<Interview> = {};

  showFeedbackForm = false;
  feedbackInterview: Interview | null = null;
  fSaving = false;
  fFormError = '';
  fForm: Partial<Feedback> = {};
  viewingFeedback: Feedback | null = null;

  constructor(private api: ApiService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getInterviews().subscribe({
      next: data => {
        this.zone.run(() => {
          try {
            console.log('Received data:', data);
            this.interviews = Array.isArray(data) ? data : ((data as { results?: Interview[] })?.results ?? []);
            this.applyFilters();
          } finally {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.error = 'Failed to load interviews.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
    this.api.getCandidates().subscribe({
      next: c => {
        this.zone.run(() => {
          console.log('Received data:', c);
          this.candidates = Array.isArray(c) ? c : ((c as { results?: Candidate[] })?.results ?? []);
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.candidates = [];
          this.cdr.detectChanges();
        });
      }
    });
  }

  applyFilters(): void {
    this.filtered = this.statusFilter
      ? this.interviews.filter(i => i.status === this.statusFilter)
      : [...this.interviews];
  }

  typeLabel(t: string): string {
    const map: Record<string, string> = { phone: 'Phone', technical: 'Technical', hr: 'HR', final: 'Final' };
    return map[t] || t;
  }

  openInterviewForm(): void {
    this.iForm = { interview_type: 'hr', duration_minutes: 60, status: 'scheduled' };
    this.iFormError = '';
    this.showInterviewForm = true;
  }

  closeInterviewForm(): void { this.showInterviewForm = false; }

  saveInterview(): void {
    if (!this.iForm.candidate || !this.iForm.scheduled_at) {
      this.iFormError = 'Candidate and date/time are required.';
      return;
    }
    this.iSaving = true;
    this.api.createInterview(this.iForm).subscribe({
      next: saved => {
        console.log('Received data:', saved);
        this.interviews.unshift(saved);
        this.applyFilters();
        this.iSaving = false;
        this.closeInterviewForm();
        this.cdr.detectChanges();
      },
      error: () => {
        this.iFormError = 'Failed to schedule.';
        this.iSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  markCompleted(i: Interview): void {
    this.api.updateInterview(i.id, { status: 'completed' }).subscribe({
      next: updated => {
        console.log('Received data:', updated);
        const idx = this.interviews.findIndex(x => x.id === i.id);
        if (idx !== -1) this.interviews[idx] = updated;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to update.';
        this.cdr.detectChanges();
      }
    });
  }

  deleteInterview(i: Interview): void {
    if (!confirm(`Delete interview with ${i.candidate_name}?`)) return;
    this.api.deleteInterview(i.id).subscribe({
      next: () => {
        console.log('Received data:', { deletedId: i.id });
        this.interviews = this.interviews.filter(x => x.id !== i.id);
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to delete.';
        this.cdr.detectChanges();
      }
    });
  }

  openFeedbackForm(i: Interview): void {
    this.feedbackInterview = i;
    this.fForm = { interview: i.id, candidate: i.candidate, overall_rating: 3, recommendation: 'neutral' };
    this.fFormError = '';
    this.showFeedbackForm = true;
  }

  closeFeedbackForm(): void { this.showFeedbackForm = false; this.feedbackInterview = null; }

  saveFeedback(): void {
    if (!this.fForm.comments || !this.fForm.overall_rating) {
      this.fFormError = 'Overall rating and comments are required.';
      return;
    }
    this.fSaving = true;
    this.api.createFeedback(this.fForm).subscribe({
      next: () => {
        console.log('Received data:', this.fForm);
        const idx = this.interviews.findIndex(x => x.id === this.feedbackInterview?.id);
        if (idx !== -1) this.interviews[idx].has_feedback = true;
        this.applyFilters();
        this.fSaving = false;
        this.closeFeedbackForm();
        this.cdr.detectChanges();
      },
      error: () => {
        this.fFormError = 'Failed to save feedback.';
        this.fSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewFeedback(i: Interview): void {
    this.api.getFeedback(i.candidate).subscribe({
      next: feedbacks => {
        console.log('Received data:', feedbacks);
        const fb = feedbacks.find(f => f.interview === i.id);
        if (fb) this.viewingFeedback = fb;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load feedback.';
        this.cdr.detectChanges();
      }
    });
  }
}
