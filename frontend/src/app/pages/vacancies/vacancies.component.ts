import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Vacancy } from '../../shared/models';

@Component({
  selector: 'app-vacancies',
  standalone: true,
  imports: [FormsModule, DatePipe, SlicePipe, DecimalPipe],
  templateUrl: './vacancies.component.html',
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
