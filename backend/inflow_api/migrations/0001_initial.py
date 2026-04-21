from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Candidate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('phone', models.CharField(blank=True, max_length=30)),
                ('status', models.CharField(choices=[('new', 'New'), ('screening', 'Screening'), ('interview', 'Interview'), ('offer', 'Offer'), ('hired', 'Hired'), ('rejected', 'Rejected')], default='new', max_length=15)),
                ('source', models.CharField(choices=[('linkedin', 'LinkedIn'), ('referral', 'Referral'), ('website', 'Website'), ('headhunter', 'HeadHunter'), ('other', 'Other')], default='other', max_length=20)),
                ('resume_url', models.URLField(blank=True)),
                ('resume_text', models.TextField(blank=True, help_text='Parsed resume content')),
                ('linkedin_url', models.URLField(blank=True)),
                ('expected_salary', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('notes', models.TextField(blank=True)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High')], default='medium', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='candidates', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Vacancy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('department', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                ('requirements', models.TextField(blank=True)),
                ('salary_min', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('salary_max', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('priority', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent')], default='medium', max_length=10)),
                ('status', models.CharField(choices=[('open', 'Open'), ('paused', 'Paused'), ('closed', 'Closed')], default='open', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('deadline', models.DateField(blank=True, null=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vacancies', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Vacancies',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Interview',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('interview_type', models.CharField(choices=[('phone', 'Phone Screen'), ('technical', 'Technical'), ('hr', 'HR Interview'), ('final', 'Final Round')], default='hr', max_length=15)),
                ('status', models.CharField(choices=[('scheduled', 'Scheduled'), ('completed', 'Completed'), ('cancelled', 'Cancelled'), ('no_show', 'No Show')], default='scheduled', max_length=15)),
                ('scheduled_at', models.DateTimeField()),
                ('duration_minutes', models.PositiveIntegerField(default=60)),
                ('location', models.CharField(blank=True, help_text='Room or video link', max_length=200)),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews', to='inflow_api.candidate')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='interviews_created', to=settings.AUTH_USER_MODEL)),
                ('interviewer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='interviews_as_interviewer', to=settings.AUTH_USER_MODEL)),
                ('vacancy', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='interviews', to='inflow_api.vacancy')),
            ],
            options={
                'ordering': ['scheduled_at'],
            },
        ),
        migrations.CreateModel(
            name='Feedback',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('overall_rating', models.PositiveSmallIntegerField(choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')])),
                ('technical_rating', models.PositiveSmallIntegerField(blank=True, choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')], null=True)),
                ('communication_rating', models.PositiveSmallIntegerField(blank=True, choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')], null=True)),
                ('cultural_fit_rating', models.PositiveSmallIntegerField(blank=True, choices=[(1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5')], null=True)),
                ('strengths', models.TextField(blank=True)),
                ('weaknesses', models.TextField(blank=True)),
                ('comments', models.TextField()),
                ('recommendation', models.CharField(choices=[('strong_yes', 'Strong Yes'), ('yes', 'Yes'), ('neutral', 'Neutral'), ('no', 'No'), ('strong_no', 'Strong No')], max_length=15)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feedbacks_given', to=settings.AUTH_USER_MODEL)),
                ('candidate', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='feedbacks', to='inflow_api.candidate')),
                ('interview', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='feedback', to='inflow_api.interview')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='candidate',
            name='vacancy',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='candidates', to='inflow_api.vacancy'),
        ),
    ]
