from django.db import models
from django.contrib.auth.models import User


class CandidateManager(models.Manager):
    def active(self):
        return self.exclude(status='rejected')

    def by_hr(self, user):
        return self.filter(created_by=user)

    def pipeline_summary(self, user):
        qs = self.by_hr(user)
        summary = {}
        for status, _ in Candidate.STATUS_CHOICES:
            summary[status] = qs.filter(status=status).count()
        return summary


class Vacancy(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('paused', 'Paused'),
        ('closed', 'Closed'),
    ]

    title = models.CharField(max_length=200)
    department = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    requirements = models.TextField(blank=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vacancies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deadline = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Vacancies'

    def __str__(self):
        return f"{self.title} ({self.department})"


class Candidate(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('screening', 'Screening'),
        ('interview', 'Interview'),
        ('offer', 'Offer'),
        ('hired', 'Hired'),
        ('rejected', 'Rejected'),
    ]
    SOURCE_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('referral', 'Referral'),
        ('website', 'Website'),
        ('headhunter', 'HeadHunter'),
        ('other', 'Other'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='other')
    vacancy = models.ForeignKey(Vacancy, on_delete=models.SET_NULL, null=True, blank=True, related_name='candidates')
    resume_url = models.URLField(blank=True)
    resume_text = models.TextField(blank=True, help_text='Parsed resume content')
    linkedin_url = models.URLField(blank=True)
    expected_salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=[('low','Low'),('medium','Medium'),('high','High')], default='medium')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='candidates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CandidateManager()

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} — {self.get_status_display()}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Interview(models.Model):
    TYPE_CHOICES = [
        ('phone', 'Phone Screen'),
        ('technical', 'Technical'),
        ('hr', 'HR Interview'),
        ('final', 'Final Round'),
    ]
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='interviews')
    vacancy = models.ForeignKey(Vacancy, on_delete=models.SET_NULL, null=True, blank=True, related_name='interviews')
    interview_type = models.CharField(max_length=15, choices=TYPE_CHOICES, default='hr')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='scheduled')
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    location = models.CharField(max_length=200, blank=True, help_text='Room or video link')
    interviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='interviews_as_interviewer')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interviews_created')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['scheduled_at']

    def __str__(self):
        return f"{self.get_interview_type_display()} with {self.candidate} at {self.scheduled_at:%Y-%m-%d %H:%M}"


class Feedback(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    RECOMMENDATION_CHOICES = [
        ('strong_yes', 'Strong Yes'),
        ('yes', 'Yes'),
        ('neutral', 'Neutral'),
        ('no', 'No'),
        ('strong_no', 'Strong No'),
    ]

    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='feedback')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='feedbacks')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks_given')
    overall_rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    technical_rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    communication_rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    cultural_fit_rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES, null=True, blank=True)
    strengths = models.TextField(blank=True)
    weaknesses = models.TextField(blank=True)
    comments = models.TextField()
    recommendation = models.CharField(max_length=15, choices=RECOMMENDATION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback for {self.candidate} by {self.author} — {self.overall_rating}/5"
