import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Candidate, Vacancy, CandidateStatus } from '../../shared/models';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './candidates.component.html',
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

  constructor(private api: ApiService, private zone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.api.getCandidates().subscribe({
      next: data => {
        this.zone.run(() => {
          try {
            console.log('Received data:', data);
            const normalized = Array.isArray(data) ? data : ((data as { results?: Candidate[] })?.results ?? []);
            this.candidates = normalized;
            this.applyFilters();
          } finally {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          this.error = 'Failed to load candidates.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      }
    });
    this.api.getVacancies().subscribe({
      next: v => {
        this.zone.run(() => {
          console.log('Received data:', v);
          this.vacancies = Array.isArray(v) ? v : ((v as { results?: Vacancy[] })?.results ?? []);
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.vacancies = [];
          this.cdr.detectChanges();
        });
      }
    });
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
        console.log('Received data:', updated);
        const idx = this.candidates.findIndex(x => x.id === c.id);
        if (idx !== -1) this.candidates[idx] = updated;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to update status.';
        this.cdr.detectChanges();
      }
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
        console.log('Received data:', saved);
        if (this.editing) {
          const idx = this.candidates.findIndex(c => c.id === saved.id);
          if (idx !== -1) this.candidates[idx] = saved;
        } else {
          this.candidates.unshift(saved);
        }
        this.applyFilters();
        this.saving = false;
        this.closeForm();
        this.cdr.detectChanges();
      },
      error: () => {
        this.formError = 'Failed to save. Check the form.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  confirmDelete(c: Candidate): void { this.deleteTarget = c; }

  deleteCandidate(): void {
    if (!this.deleteTarget) return;
    this.api.deleteCandidate(this.deleteTarget.id).subscribe({
      next: () => {
        console.log('Received data:', { deletedId: this.deleteTarget?.id });
        this.candidates = this.candidates.filter(c => c.id !== this.deleteTarget!.id);
        this.applyFilters();
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
