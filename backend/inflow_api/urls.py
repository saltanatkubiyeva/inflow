from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Dashboard
    path('dashboard/', views.dashboard_stats, name='dashboard'),

    # Candidates (full CRUD)
    path('candidates/', views.CandidateListCreateView.as_view(), name='candidate-list'),
    path('candidates/<int:pk>/', views.CandidateDetailView.as_view(), name='candidate-detail'),

    # Vacancies
    path('vacancies/', views.VacancyListCreateView.as_view(), name='vacancy-list'),
    path('vacancies/<int:pk>/', views.VacancyDetailView.as_view(), name='vacancy-detail'),

    # Interviews
    path('interviews/', views.InterviewListCreateView.as_view(), name='interview-list'),
    path('interviews/<int:pk>/', views.InterviewDetailView.as_view(), name='interview-detail'),

    # Feedback
    path('feedback/', views.FeedbackListCreateView.as_view(), name='feedback-list'),
    path('feedback/<int:pk>/', views.FeedbackDetailView.as_view(), name='feedback-detail'),
]
