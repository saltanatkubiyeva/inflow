import { NgModule, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Candidate, Vacancy, CandidateStatus } from '../../shared/models';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Candidates</h1>
          <p class="page-subtitle">{{ filtered.length }} candidates found</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Add Candidate</button>
      </div>

      @if (error) {
      <div class="error-banner">{{ error }}</div>
      }

      <!-- Filters -->
      <div class="filters-bar">
        <input
          type="text"
          class="search-input"
          placeholder="Search by name or email…"
          [(ngModel)]="searchTerm"
          (ngModelChange)="applyFilters()"
        />
        <select [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
          <option value="">All statuses</option>
          @for (s of statuses; track s.value) {
          <option [value]="s.value">{{ s.label }}</option>
          }
        </select>
        <select [(ngModel)]="vacancyFilter" (ngModelChange)="applyFilters()">
          <option value="">All vacancies</option>
          @for (v of vacancies; track v.id) {
          <option [value]="v.id">{{ v.title }}</option>
          }
        </select>
      </div>

      <!-- Pipeline tab bar -->
      <div class="pipeline-tabs">
        @for (s of statuses; track s.value) {
        <button
          class="pipeline-tab"
          [class.active]="statusFilter === s.value"
          (click)="filterByStatus(s.value)"
        >
          <span class="tab-dot" [class]="'dot-' + s.value"></span>
          {{ s.label }}
          <span class="tab-count">{{ countByStatus(s.value) }}</span>
        </button>
        }
      </div>

      <!-- Candidate table -->
      @if (!loading) {
      <div class="table-wrap">
        @if (filtered.length === 0) {
        <div class="empty-state">
          No candidates match your filters.
        </div>
        }
        @if (filtered.length > 0) {
        <table class="data-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Vacancy</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Source</th>
              <th>Interviews</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (c of filtered; track c.id) {
            <tr>
              <td>
                <div class="cell-person">
                  <div class="avatar">{{ c.full_name[0] }}</div>
                  <div>
                    <div class="person-name">{{ c.full_name }}</div>
                    <div class="person-email">{{ c.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ c.vacancy_title || '—' }}</td>
              <td>
                <select
                  class="status-select"
                  [ngModel]="c.status"
                  (ngModelChange)="changeStatus(c, $any($event))"
                  [class]="'status-' + c.status"
                >
                  @for (s of statuses; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                  }
                </select>
              </td>
              <td><span class="badge" [class]="'badge-priority-' + c.priority">{{ c.priority }}</span></td>
              <td>{{ c.source }}</td>
              <td>{{ c.interviews_count }}</td>
              <td>
                <div class="action-btns">
                  <button class="btn-icon" title="Edit" (click)="openForm(c)">✎</button>
                  <button class="btn-icon danger" title="Delete" (click)="confirmDelete(c)">✕</button>
                </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
        }
      </div>
      }
      @if (loading) {
      <div class="loading">Loading candidates…</div>
      }

      <!-- Modal form -->
      @if (showForm) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing ? 'Edit Candidate' : 'Add Candidate' }}</h2>
            <button class="btn-icon" (click)="closeForm()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>First name *</label>
                <input type="text" [(ngModel)]="form.first_name" name="first_name" placeholder="John" />
              </div>
              <div class="form-group">
                <label>Last name *</label>
                <input type="text" [(ngModel)]="form.last_name" name="last_name" placeholder="Smith" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" [(ngModel)]="form.email" name="email" placeholder="john@example.com" />
              </div>
              <div class="form-group">
                <label>Phone</label>
                <input type="text" [(ngModel)]="form.phone" name="phone" placeholder="+7 700 000 0000" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Vacancy</label>
                <select [(ngModel)]="form.vacancy" name="vacancy">
                  <option [ngValue]="null">— No vacancy —</option>
                  @for (v of vacancies; track v.id) {
                  <option [value]="v.id">{{ v.title }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Source</label>
                <select [(ngModel)]="form.source" name="source">
                  <option value="linkedin">LinkedIn</option>
                  <option value="referral">Referral</option>
                  <option value="website">Website</option>
                  <option value="headhunter">HeadHunter</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="form.status" name="status">
                  @for (s of statuses; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label>Priority</label>
                <select [(ngModel)]="form.priority" name="priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Expected salary</label>
                <input type="number" [(ngModel)]="form.expected_salary" name="salary" placeholder="0" />
              </div>
              <div class="form-group">
                <label>LinkedIn URL</label>
                <input type="url" [(ngModel)]="form.linkedin_url" name="linkedin" placeholder="https://linkedin.com/in/…" />
              </div>
            </div>
            <div class="form-group">
              <label>Resume URL</label>
              <input type="url" [(ngModel)]="form.resume_url" name="resume" placeholder="https://…" />
            </div>
            <div class="form-group">
              <label>Notes</label>
              <textarea [(ngModel)]="form.notes" name="notes" rows="3" placeholder="Additional notes…"></textarea>
            </div>
            @if (formError) {
            <div class="form-error">{{ formError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="closeForm()">Cancel</button>
            <button class="btn-primary" (click)="saveCandidate()" [disabled]="saving">
              {{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Add candidate') }}
            </button>
          </div>
        </div>
      </div>
      }

      <!-- Delete confirm -->
      @if (deleteTarget) {
      <div class="modal-overlay" (click)="deleteTarget = null">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Delete candidate?</h2>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ deleteTarget?.full_name }}</strong>? This cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="deleteTarget = null">Cancel</button>
            <button class="btn-danger" (click)="deleteCandidate()">Delete</button>
          </div>
        </div>
      </div>
      }
    </div>
  `,
})
export class CandidatesComponent implements OnInit {
  candidates: Candidate[] = [];
  filtered: Candidate[] = [];
  vacancies: Vacancy[] = [];
  loading = true;
  error = '';

  searchTerm = '';
  statusFilter = '';
  vacancyFilter = '';

  showForm = false;
  editing: Candidate | null = null;
  deleteTarget: Candidate | null = null;
  saving = false;
  formError = '';

  form: Partial<Candidate> = {};

  statuses = [
    { value: 'new', label: 'New' },
    { value: 'screening', label: 'Screening' },
    { value: 'interview', label: 'Interview' },
    { value: 'offer', label: 'Offer' },
    { value: 'hired', label: 'Hired' },
    { value: 'rejected', label: 'Rejected' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getCandidates().subscribe({
      next: data => { this.candidates = data; this.applyFilters(); this.loading = false; },
      error: () => { this.error = 'Failed to load candidates.'; this.loading = false; }
    });
    this.api.getVacancies().subscribe({ next: v => this.vacancies = v });
  }

  applyFilters(): void {
    this.filtered = this.candidates.filter(c => {
      const matchSearch = !this.searchTerm ||
        c.full_name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchStatus = !this.statusFilter || c.status === this.statusFilter;
      const matchVacancy = !this.vacancyFilter || String(c.vacancy) === String(this.vacancyFilter);
      return matchSearch && matchStatus && matchVacancy;
    });
  }

  filterByStatus(val: string): void {
    this.statusFilter = this.statusFilter === val ? '' : val;
    this.applyFilters();
  }

  countByStatus(status: string): number {
    return this.candidates.filter(c => c.status === status).length;
  }

  changeStatus(c: Candidate, newStatus: CandidateStatus): void {
    this.api.updateCandidateStatus(c.id, newStatus).subscribe({
      next: updated => {
        const idx = this.candidates.findIndex(x => x.id === c.id);
        if (idx !== -1) this.candidates[idx] = updated;
        this.applyFilters();
      },
      error: () => this.error = 'Failed to update status.'
    });
  }

  openForm(candidate?: Candidate): void {
    this.editing = candidate || null;
    this.form = candidate ? { ...candidate } : { status: 'new', source: 'other', priority: 'medium' };
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editing = null; }

  saveCandidate(): void {
    if (!this.form.first_name || !this.form.last_name || !this.form.email) {
      this.formError = 'First name, last name and email are required.';
      return;
    }
    this.saving = true;
    this.formError = '';
    const req = this.editing
      ? this.api.updateCandidate(this.editing.id, this.form)
      : this.api.createCandidate(this.form);

    req.subscribe({
      next: saved => {
        if (this.editing) {
          const idx = this.candidates.findIndex(c => c.id === saved.id);
          if (idx !== -1) this.candidates[idx] = saved;
        } else {
          this.candidates.unshift(saved);
        }
        this.applyFilters();
        this.saving = false;
        this.closeForm();
      },
      error: () => { this.formError = 'Failed to save. Check the form.'; this.saving = false; }
    });
  }

  confirmDelete(c: Candidate): void { this.deleteTarget = c; }

  deleteCandidate(): void {
    if (!this.deleteTarget) return;
    this.api.deleteCandidate(this.deleteTarget.id).subscribe({
      next: () => {
        this.candidates = this.candidates.filter(c => c.id !== this.deleteTarget!.id);
        this.applyFilters();
        this.deleteTarget = null;
      },
      error: () => { this.error = 'Failed to delete.'; this.deleteTarget = null; }
    });
  }
}

@NgModule({
  declarations: [],
  imports: [CandidatesComponent, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: CandidatesComponent }])]
})
export class CandidatesModule {}
