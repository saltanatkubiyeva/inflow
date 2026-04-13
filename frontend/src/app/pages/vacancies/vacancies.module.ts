import { NgModule, Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Vacancy } from '../../shared/models';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [FormsModule, DatePipe, SlicePipe, DecimalPipe],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h1>Vacancies</h1>
          <p class="page-subtitle">{{ vacancies.length }} open positions</p>
        </div>
        <button class="btn-primary" (click)="openForm()">+ Add Vacancy</button>
      </div>

      @if (error) {
      <div class="error-banner">{{ error }}</div>
      }

      <div class="filters-bar">
        <select [(ngModel)]="statusFilter" (ngModelChange)="loadVacancies()">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      @if (loading) {
      <div class="loading">Loading vacancies…</div>
      }

      @if (!loading) {
      <div class="vacancy-grid">
        @if (vacancies.length === 0) {
        <div class="empty-state">No vacancies yet. Create one!</div>
        }

        @for (v of vacancies; track v.id) {
        <div class="vacancy-card">
          <div class="vacancy-card-header">
            <div>
              <h3 class="vacancy-title">{{ v.title }}</h3>
              <span class="vacancy-dept">{{ v.department }}</span>
            </div>
            <span class="badge" [class]="'badge-priority-' + v.priority">{{ v.priority }}</span>
          </div>
          <p class="vacancy-desc">{{ v.description | slice:0:120 }}{{ v.description.length > 120 ? '…' : '' }}</p>
          <div class="vacancy-meta">
            @if (v.salary_min) {
            <span>
              💰 {{ v.salary_min | number }} – {{ v.salary_max | number }}
            </span>
            }
            @if (v.deadline) {
            <span>📅 {{ v.deadline | date:'dd MMM' }}</span>
            }
            <span>👤 {{ v.candidates_count }} candidates</span>
          </div>
          <div class="vacancy-footer">
            <span class="badge" [class]="'badge-vstatus-' + v.status">{{ v.status }}</span>
            <div class="action-btns">
              <button class="btn-icon" (click)="openForm(v)">✎</button>
              <button class="btn-icon danger" (click)="confirmDelete(v)">✕</button>
            </div>
          </div>
        </div>
        }
      </div>
      }

      <!-- Form modal -->
      @if (showForm) {
      <div class="modal-overlay" (click)="closeForm()">
        <div class="modal modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editing ? 'Edit Vacancy' : 'New Vacancy' }}</h2>
            <button class="btn-icon" (click)="closeForm()">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Job title *</label>
                <input type="text" [(ngModel)]="form.title" name="title" placeholder="e.g. Senior Frontend Developer" />
              </div>
              <div class="form-group">
                <label>Department *</label>
                <input type="text" [(ngModel)]="form.department" name="dept" placeholder="Engineering" />
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea [(ngModel)]="form.description" name="desc" rows="3" placeholder="Role overview…"></textarea>
            </div>
            <div class="form-group">
              <label>Requirements</label>
              <textarea [(ngModel)]="form.requirements" name="req" rows="3" placeholder="Required skills and experience…"></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Salary min</label>
                <input type="number" [(ngModel)]="form.salary_min" name="sal_min" placeholder="0" />
              </div>
              <div class="form-group">
                <label>Salary max</label>
                <input type="number" [(ngModel)]="form.salary_max" name="sal_max" placeholder="0" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Priority</label>
                <select [(ngModel)]="form.priority" name="priority">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status</label>
                <select [(ngModel)]="form.status" name="status">
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div class="form-group">
                <label>Deadline</label>
                <input type="date" [(ngModel)]="form.deadline" name="deadline" />
              </div>
            </div>
            @if (formError) {
            <div class="form-error">{{ formError }}</div>
            }
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="closeForm()">Cancel</button>
            <button class="btn-primary" (click)="saveVacancy()" [disabled]="saving">
              {{ saving ? 'Saving…' : (editing ? 'Save changes' : 'Create vacancy') }}
            </button>
          </div>
        </div>
      </div>
      }

      <!-- Delete confirm -->
      @if (deleteTarget) {
      <div class="modal-overlay" (click)="deleteTarget = null">
        <div class="modal modal-sm" (click)="$event.stopPropagation()">
          <div class="modal-header"><h2>Delete vacancy?</h2></div>
          <div class="modal-body">
            <p>Delete <strong>{{ deleteTarget?.title }}</strong>? Candidates linked to it will remain.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-ghost" (click)="deleteTarget = null">Cancel</button>
            <button class="btn-danger" (click)="deleteVacancy()">Delete</button>
          </div>
        </div>
      </div>
      }
    </div>
  `,
})
export class VacanciesComponent implements OnInit {
  vacancies: Vacancy[] = [];
  loading = true;
  error = '';
  statusFilter = '';
  showForm = false;
  editing: Vacancy | null = null;
  deleteTarget: Vacancy | null = null;
  saving = false;
  formError = '';
  form: Partial<Vacancy> = {};

  constructor(private api: ApiService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.loadVacancies(); }

  loadVacancies(): void {
    this.loading = true;
    this.api.getVacancies(this.statusFilter || undefined).subscribe({
      next: data => {
        this.zone.run(() => {
          try {
            console.log('Received data:', data);
            this.vacancies = Array.isArray(data) ? data : ((data as { results?: Vacancy[] })?.results ?? []);
          } finally {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.error = 'Failed to load vacancies.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  openForm(v?: Vacancy): void {
    this.editing = v || null;
    this.form = v ? { ...v } : { priority: 'medium', status: 'open' };
    this.formError = '';
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; this.editing = null; }

  saveVacancy(): void {
    if (!this.form.title || !this.form.department) {
      this.formError = 'Title and department are required.';
      return;
    }
    this.saving = true;
    const req = this.editing
      ? this.api.updateVacancy(this.editing.id, this.form)
      : this.api.createVacancy(this.form);

    req.subscribe({
      next: saved => {
        console.log('Received data:', saved);
        if (this.editing) {
          const idx = this.vacancies.findIndex(v => v.id === saved.id);
          if (idx !== -1) this.vacancies[idx] = saved;
        } else {
          this.vacancies.unshift(saved);
        }
        this.saving = false;
        this.closeForm();
        this.cdr.detectChanges();
      },
      error: () => {
        this.formError = 'Failed to save.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(v: Vacancy): void { this.deleteTarget = v; }

  deleteVacancy(): void {
    if (!this.deleteTarget) return;
    this.api.deleteVacancy(this.deleteTarget.id).subscribe({
      next: () => {
        console.log('Received data:', { deletedId: this.deleteTarget?.id });
        this.vacancies = this.vacancies.filter(v => v.id !== this.deleteTarget!.id);
        this.deleteTarget = null;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to delete.';
        this.deleteTarget = null;
        this.cdr.detectChanges();
      }
    });
  }
}

@NgModule({
  declarations: [],
  imports: [VacanciesComponent, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: VacanciesComponent }])]
})
export class VacanciesModule {}
