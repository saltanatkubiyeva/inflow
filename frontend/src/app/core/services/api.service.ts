import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Candidate, Vacancy, Interview, Feedback,
  DashboardStats, CandidateStatus
} from '../../shared/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Dashboard ──────────────────────────────────────────────────────────────
  getDashboard(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.API}/dashboard/`);
  }

  // ── Candidates ─────────────────────────────────────────────────────────────
  getCandidates(filters?: { status?: string; vacancy?: number; search?: string }): Observable<Candidate[]> {
    let params = new HttpParams();
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.vacancy) params = params.set('vacancy', filters.vacancy);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<Candidate[]>(`${this.API}/candidates/`, { params });
  }

  getCandidate(id: number): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.API}/candidates/${id}/`);
  }

  createCandidate(data: Partial<Candidate>): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.API}/candidates/`, data);
  }

  updateCandidate(id: number, data: Partial<Candidate>): Observable<Candidate> {
    return this.http.patch<Candidate>(`${this.API}/candidates/${id}/`, data);
  }

  updateCandidateStatus(id: number, status: CandidateStatus): Observable<Candidate> {
    return this.http.patch<Candidate>(`${this.API}/candidates/${id}/`, { status });
  }

  deleteCandidate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/candidates/${id}/`);
  }

  // ── Vacancies ──────────────────────────────────────────────────────────────
  getVacancies(status?: string): Observable<Vacancy[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<Vacancy[]>(`${this.API}/vacancies/`, { params });
  }

  getVacancy(id: number): Observable<Vacancy> {
    return this.http.get<Vacancy>(`${this.API}/vacancies/${id}/`);
  }

  createVacancy(data: Partial<Vacancy>): Observable<Vacancy> {
    return this.http.post<Vacancy>(`${this.API}/vacancies/`, data);
  }

  updateVacancy(id: number, data: Partial<Vacancy>): Observable<Vacancy> {
    return this.http.patch<Vacancy>(`${this.API}/vacancies/${id}/`, data);
  }

  deleteVacancy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/vacancies/${id}/`);
  }

  // ── Interviews ─────────────────────────────────────────────────────────────
  getInterviews(candidateId?: number): Observable<Interview[]> {
    let params = new HttpParams();
    if (candidateId) params = params.set('candidate', candidateId);
    return this.http.get<Interview[]>(`${this.API}/interviews/`, { params });
  }

  createInterview(data: Partial<Interview>): Observable<Interview> {
    return this.http.post<Interview>(`${this.API}/interviews/`, data);
  }

  updateInterview(id: number, data: Partial<Interview>): Observable<Interview> {
    return this.http.patch<Interview>(`${this.API}/interviews/${id}/`, data);
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/interviews/${id}/`);
  }

  // ── Feedback ───────────────────────────────────────────────────────────────
  getFeedback(candidateId?: number): Observable<Feedback[]> {
    let params = new HttpParams();
    if (candidateId) params = params.set('candidate', candidateId);
    return this.http.get<Feedback[]>(`${this.API}/feedback/`, { params });
  }

  createFeedback(data: Partial<Feedback>): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.API}/feedback/`, data);
  }

  updateFeedback(id: number, data: Partial<Feedback>): Observable<Feedback> {
    return this.http.patch<Feedback>(`${this.API}/feedback/${id}/`, data);
  }

  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/feedback/${id}/`);
  }
}
