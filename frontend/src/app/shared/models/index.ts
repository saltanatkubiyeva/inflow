export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
export type Priority = 'low' | 'medium' | 'high';

export interface Candidate {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  status: CandidateStatus;
  source: string;
  vacancy: number | null;
  vacancy_title: string;
  resume_url: string;
  resume_text: string;
  linkedin_url: string;
  expected_salary: number | null;
  notes: string;
  priority: Priority;
  created_by: User;
  created_at: string;
  updated_at: string;
  interviews_count: number;
}

export interface Vacancy {
  id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  priority: Priority;
  status: 'open' | 'paused' | 'closed';
  created_by: User;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  candidates_count: number;
}

export interface Interview {
  id: number;
  candidate: number;
  candidate_name: string;
  vacancy: number | null;
  vacancy_title: string;
  interview_type: 'phone' | 'technical' | 'hr' | 'final';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  scheduled_at: string;
  duration_minutes: number;
  location: string;
  interviewer: number | null;
  interviewer_name: string;
  notes: string;
  created_by: User;
  created_at: string;
  updated_at: string;
  has_feedback: boolean;
}

export interface Feedback {
  id: number;
  interview: number;
  candidate: number;
  candidate_name: string;
  author: User;
  overall_rating: number;
  technical_rating: number | null;
  communication_rating: number | null;
  cultural_fit_rating: number | null;
  strengths: string;
  weaknesses: string;
  comments: string;
  recommendation: 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';
  created_at: string;
  updated_at: string;
}

export interface PipelineSummary {
  new: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
  rejected: number;
}

export interface DashboardStats {
  pipeline: PipelineSummary;
  total_candidates: number;
  total_vacancies: number;
  upcoming_interviews: Interview[];
  recent_candidates: Candidate[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}
