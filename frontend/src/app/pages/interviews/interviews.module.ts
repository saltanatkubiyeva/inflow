import { NgModule, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Interview, Candidate, Feedback } from '../../shared/models';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [FormsModule, DatePipe, TitleCasePipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Interviews</h1>
          <p class="page-subtitle">{{ interviews.length }} total</p>
        </div>
        <button class="btn-primary" (click)="openInterviewForm()">+ Schedule Interview</button>
      </div>

      @if (error) {
      <div class="error-banner">{{ error }}</div>
      }

      <div class="filters-bar">
        <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No show</option>
        </select>
      </div>

      @if (loading) {
      <div class="loading">Loading interviews…</div>
      }

      @if (!loading) {
      <div class="interview-list">
        @if (filtered.length === 0) {
        <div class="empty-state">No interviews found.</div>
        }

        @for (i of filtered; track i.id) {
        <div class="interview-card">
          <div class="interview-card-date">
            <span class="idate-day">{{ i.scheduled_at | date:'d' }}</span>
            <span class="idate-month">{{ i.scheduled_at | date:'MMM' }}</span>
            <span class="idate-time">{{ i.scheduled_at | date:'HH:mm' }}</span>
          </div>
          <div class="interview-card-body">
            <div class="interview-card-top">
              <h3>{{ i.candidate_name }}</h3>
              <span class="badge" [class]="'badge-itype-' + i.interview_type">
                {{ typeLabel(i.interview_type) }}
              </span>
            </div>
            <div class="interview-card-meta">
              @if (i.vacancy_title) {
              <span>📋 {{ i.vacancy_title }}</span>
              }
              <span>⏱ {{ i.duration_minutes }} min</span>
              @if (i.location) {
              <span>📍 {{ i.location }}</span>
              }
              @if (i.interviewer_name) {
              <span>👤 {{ i.interviewer_name }}</span>
              }
            </div>
            @if (i.notes) {
            <p class="interview-notes">{{ i.notes }}</p>
            }
          </div>
          <div class="interview-card-actions">
            <span class="badge" [class]="'badge-istatus-' + i.status">{{ i.status }}</span>
            <div class="action-btns">
              @if (i.status === 'scheduled') {
              <button class="btn-sm" (click)="markCompleted(i)">✓ Complete</button>
              }
              @if (i.status === 'completed' && !i.has_feedback) {
              <button class="btn-sm accent" (click)="openFeedbackForm(i)">+ Feedback</button>
              }
              @if (i.has_feedback) {
              <button class="btn-sm ghost" (click)="viewFeedback(i)">View feedback</button>
              }
              <button class="btn-icon danger" (click)="deleteInterview(i)">✕</button>
            </div>
          </div>
        </div>
        }
      </div>
      }

      <!-- Schedule interview modal -->
      @if (showInterviewForm) {
      <div class="modal-overlay" (click)="closeInterviewForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Schedule Interview</h2>
            <button class="btn-icon" (click)="closeInterviewForm()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Candidate *</label>
              <select [(ngModel)]="iForm.candidate" name="candidate">
                <option [ngValue]="null">— Select candidate —</option>
                @for (c of candidates; track c.id) {
                <option [value]="c.id">{{ c.full_name }}</option>
                }
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Interview type</label>
                <select [(ngModel)]="iForm.interview_type" name="itype">
                  <option value="phone">Phone Screen</option>
                  <option value="technical">Technical</option>
                  <option value="hr">HR Interview</option>
                  <option value="final">Final Round</option>
                </select>
              </div>
              <div class="form-group">
                <label>Duration (minutes)</label>
                <input type="number" [(ngModel)]="iForm.duration_minutes" name="dur" min="15" step="15" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Date & Time *</label>
                <input type="datetime-local" [(ngModel)]="iForm.scheduled_at" name="scheduled" />
              </div>
              <div class="form-group">
                <label>Location / Link</label>
                <input type="text" [(ngModel)]="iForm.location" name="location" placeholder="Room 3 or https://meet.google.com/…" />
              </div>
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="iForm.notes" name="notes" rows="2" placeholder="Preparation notes…"></textarea>
            </div>
            @if (iFormError) {
            <div class="form-error">{{ iFormError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="closeInterviewForm()">Cancel</button>
            <button class="btn-primary" (click)="saveInterview()" [disabled]="iSaving">
              {{ iSaving ? 'Scheduling…' : 'Schedule' }}
            </button>
          </div>
        </div>
      </div>
      }

      <!-- Feedback modal -->
      @if (showFeedbackForm) {
      <div class="modal-overlay" (click)="closeFeedbackForm()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Add Feedback — {{ feedbackInterview?.candidate_name }}</h2>
            <button class="btn-icon" (click)="closeFeedbackForm()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Overall rating *</label>
                <div class="star-row">
                  @for (n of [1,2,3,4,5]; track n) {
                  <button
                    class="star-btn"
                    [class.active]="(fForm?.overall_rating ?? 0) >= n"
                    (click)="fForm.overall_rating = n"
                  >★</button>
                  }
                </div>
              </div>
              <div class="form-group">
                <label>Recommendation *</label>
                <select [(ngModel)]="fForm.recommendation" name="rec">
                  <option value="strong_yes">Strong Yes</option>
                  <option value="yes">Yes</option>
                  <option value="neutral">Neutral</option>
                  <option value="no">No</option>
                  <option value="strong_no">Strong No</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Technical (1–5)</label>
                <input type="number" [(ngModel)]="fForm.technical_rating" name="tech" min="1" max="5" />
              </div>
              <div class="form-group">
                <label>Communication (1–5)</label>
                <input type="number" [(ngModel)]="fForm.communication_rating" name="comm" min="1" max="5" />
              </div>
              <div class="form-group">
                <label>Cultural fit (1–5)</label>
                <input type="number" [(ngModel)]="fForm.cultural_fit_rating" name="fit" min="1" max="5" />
              </div>
            </div>
            <div class="form-group">
              <label>Strengths</label>
              <textarea [(ngModel)]="fForm.strengths" name="strengths" rows="2" placeholder="What stood out positively…"></textarea>
            </div>
            <div class="form-group">
              <label>Weaknesses</label>
              <textarea [(ngModel)]="fForm.weaknesses" name="weaknesses" rows="2" placeholder="Areas of concern…"></textarea>
            </div>
            <div class="form-group">
              <label>Comments *</label>
              <textarea [(ngModel)]="fForm.comments" name="comments" rows="3" placeholder="Overall impression…"></textarea>
            </div>
            @if (fFormError) {
            <div class="form-error">{{ fFormError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="closeFeedbackForm()">Cancel</button>
            <button class="btn-primary" (click)="saveFeedback()" [disabled]="fSaving">
              {{ fSaving ? 'Saving…' : 'Submit feedback' }}
            </button>
          </div>
        </div>
      </div>
      }

      <!-- View feedback modal -->
      @if (viewingFeedback) {
      <div class="modal-overlay" (click)="viewingFeedback = null">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Feedback</h2>
            <button class="btn-icon" (click)="viewingFeedback = null">✕</button>
          </div>
          @if (viewingFeedback) {
          <div class="modal-body">
            <div class="feedback-ratings">
              <div class="rating-item">
                <span>Overall</span>
                <span class="stars">{{ '★'.repeat(viewingFeedback?.overall_rating ?? 0) }}{{ '☆'.repeat(5 - (viewingFeedback?.overall_rating ?? 0)) }}</span>
              </div>
              @if (viewingFeedback?.technical_rating) {
              <div class="rating-item">
                <span>Technical</span><span>{{ viewingFeedback?.technical_rating }}/5</span>
              </div>
              }
              @if (viewingFeedback?.communication_rating) {
              <div class="rating-item">
                <span>Communication</span><span>{{ viewingFeedback?.communication_rating }}/5</span>
              </div>
              }
              @if (viewingFeedback?.cultural_fit_rating) {
              <div class="rating-item">
                <span>Cultural fit</span><span>{{ viewingFeedback?.cultural_fit_rating }}/5</span>
              </div>
              }
            </div>
            <div class="feedback-rec">
              Recommendation: <strong>{{ viewingFeedback?.recommendation?.replace('_', ' ') | titlecase }}</strong>
            </div>
            @if (viewingFeedback?.strengths) {
            <div class="feedback-block">
              <label>Strengths</label><p>{{ viewingFeedback?.strengths }}</p>
            </div>
            }
            @if (viewingFeedback?.weaknesses) {
            <div class="feedback-block">
              <label>Weaknesses</label><p>{{ viewingFeedback?.weaknesses }}</p>
            </div>
            }
            <div class="feedback-block">
              <label>Comments</label><p>{{ viewingFeedback?.comments }}</p>
            </div>
          </div>
          }
        </div>
      </div>
      }
    </div>
  `,
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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getInterviews().subscribe({
      next: data => { this.interviews = data; this.applyFilters(); this.loading = false; },
      error: () => { this.error = 'Failed to load interviews.'; this.loading = false; }
    });
    this.api.getCandidates().subscribe({ next: c => this.candidates = c });
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
        this.interviews.unshift(saved);
        this.applyFilters();
        this.iSaving = false;
        this.closeInterviewForm();
      },
      error: () => { this.iFormError = 'Failed to schedule.'; this.iSaving = false; }
    });
  }

  markCompleted(i: Interview): void {
    this.api.updateInterview(i.id, { status: 'completed' }).subscribe({
      next: updated => {
        const idx = this.interviews.findIndex(x => x.id === i.id);
        if (idx !== -1) this.interviews[idx] = updated;
        this.applyFilters();
      },
      error: () => this.error = 'Failed to update.'
    });
  }

  deleteInterview(i: Interview): void {
    if (!confirm(`Delete interview with ${i.candidate_name}?`)) return;
    this.api.deleteInterview(i.id).subscribe({
      next: () => { this.interviews = this.interviews.filter(x => x.id !== i.id); this.applyFilters(); },
      error: () => this.error = 'Failed to delete.'
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
        const idx = this.interviews.findIndex(x => x.id === this.feedbackInterview?.id);
        if (idx !== -1) this.interviews[idx].has_feedback = true;
        this.applyFilters();
        this.fSaving = false;
        this.closeFeedbackForm();
      },
      error: () => { this.fFormError = 'Failed to save feedback.'; this.fSaving = false; }
    });
  }

  viewFeedback(i: Interview): void {
    this.api.getFeedback(i.candidate).subscribe({
      next: feedbacks => {
        const fb = feedbacks.find(f => f.interview === i.id);
        if (fb) this.viewingFeedback = fb;
      },
      error: () => this.error = 'Failed to load feedback.'
    });
  }
}

@NgModule({
  declarations: [],
  imports: [InterviewsComponent, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: InterviewsComponent }])]
})
export class InterviewsModule {}
