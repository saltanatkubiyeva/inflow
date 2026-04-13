# inflow — HR Interview Tracker

Inflow is a web application for HR managers to track candidates, vacancies, interviews, and feedback — all in one place.

## Tech Stack

- **Frontend:** Angular 17
- **Backend:** Django 4.2 + Django REST Framework
- **Authentication:** JWT (SimpleJWT)
- **Database:** SQLite (dev)

## Features

- Candidate management — full CRUD with pipeline statuses
- Vacancy management with salary ranges and priorities
- Interview scheduling (phone, technical, HR, final)
- Interview feedback with ratings and recommendations
- Dashboard with pipeline summary and upcoming interviews
- JWT-based auth — each HR sees only their own data

## Group Members

| Name | Role |
|------|------|
| Saltanat Kubiyeva | Feedback & Dashboard |
| Alua Kudaibergenova | Vacancies & Interviews |
| Denis Tursynbayev | Candidates (CRUD) & Authentication |

## Group: InflowDev | Course: Web Development | KBTU

---

## Getting Started

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # create your HR account
python manage.py runserver
```

API runs at: `http://localhost:8000/api/`

### Frontend

```bash
cd frontend
npm install
ng serve
```

App runs at: `http://localhost:4200`

---

## Project Structure

```
inflow/
├── backend/
│   ├── config/             # Django settings, urls, wsgi
│   ├── inflow_api/         # Main app
│   │   ├── models.py       # Candidate, Vacancy, Interview, Feedback
│   │   ├── serializers.py  # 2× Serializer + 2× ModelSerializer
│   │   ├── views.py        # 2× FBV + CBV for all resources
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   └── src/app/
│       ├── core/
│       │   ├── interceptors/jwt.interceptor.ts
│       │   ├── guards/auth.guard.ts
│       │   └── services/    # auth.service.ts, api.service.ts
│       ├── pages/
│       │   ├── login/
│       │   ├── dashboard/
│       │   ├── candidates/  # Full CRUD
│       │   ├── vacancies/
│       │   └── interviews/  # + feedback
│       └── shared/models/   # TypeScript interfaces
└── postman_collection.json
```

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/login/` | Login, returns JWT |
| POST | `/api/auth/logout/` | Blacklist refresh token |
| POST | `/api/auth/refresh/` | Refresh access token |
| GET | `/api/dashboard/` | Pipeline stats |
| GET/POST | `/api/candidates/` | List / create |
| GET/PATCH/DELETE | `/api/candidates/:id/` | Detail / update / delete |
| GET/POST | `/api/vacancies/` | List / create |
| GET/PATCH/DELETE | `/api/vacancies/:id/` | Detail / update / delete |
| GET/POST | `/api/interviews/` | List / schedule |
| GET/PATCH/DELETE | `/api/interviews/:id/` | Detail / update / delete |
| GET/POST | `/api/feedback/` | List / create |
| GET/PATCH/DELETE | `/api/feedback/:id/` | Detail / update / delete |

## Requirements Coverage

### Backend (Django + DRF)
- ✅ 4 models: `Candidate`, `Vacancy`, `Interview`, `Feedback`
- ✅ 1 custom model manager: `CandidateManager`
- ✅ 2+ ForeignKey relationships
- ✅ 2× `serializers.Serializer`: `LoginSerializer`, `PipelineSummarySerializer`
- ✅ 2× `serializers.ModelSerializer`: `CandidateSerializer`, `VacancySerializer` (+ Interview, Feedback)
- ✅ 2× FBV: `login_view`, `dashboard_stats`
- ✅ 2+ CBV: `CandidateListCreateView`, `CandidateDetailView`, etc.
- ✅ JWT auth with login/logout endpoints
- ✅ Full CRUD on `Candidate`
- ✅ `request.user` linked on create
- ✅ CORS configured for `localhost:4200`
- ✅ Postman collection included

### Frontend (Angular 17)
- ✅ Interfaces and services for all models
- ✅ 4+ click events triggering API requests
- ✅ 4+ `[(ngModel)]` form controls (FormsModule)
- ✅ CSS styling
- ✅ Routing: `/login`, `/dashboard`, `/candidates`, `/vacancies`, `/interviews`
- ✅ `@for` and `@if` used throughout
- ✅ JWT: HTTP interceptor + login page + logout
- ✅ `ApiService` using `HttpClient`
- ✅ Error handling with user-facing messages
