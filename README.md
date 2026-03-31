# Inflow — HR Interview Tracker

Inflow is a web application for HR managers to track candidates, vacancies, interviews, and feedback — all in one place.

## Tech Stack

- **Frontend:** Angular
- **Backend:** Django + Django REST Framework
- **Authentication:** JWT (JSON Web Tokens)

## Features

- Candidate management (add, edit, delete, view)
- Vacancy and interview scheduling
- Interview feedback system
- Dashboard with candidate pipeline overview
- JWT-based authentication

## Group Members

| Name | Role |
|------|------|
| Saltanat Kubiyeva | Feedback & Dashboard |
| Alua Kudaibergenova | Vacancies & Interviews |
| Denis Tursynbayev | Candidates (CRUD) & Authentication |

## Project Structure

```
inflow/
├── frontend/   # Angular application
└── backend/    # Django REST API
```

## Getting Started

### Frontend
```bash
cd frontend
npm install
ng serve
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Group: InflowDev
**Course:** Web Development 
