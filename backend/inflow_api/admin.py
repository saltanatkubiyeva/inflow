from django.contrib import admin
from .models import Candidate, Vacancy, Interview, Feedback

admin.site.register(Candidate)
admin.site.register(Vacancy)
admin.site.register(Interview)
admin.site.register(Feedback)
