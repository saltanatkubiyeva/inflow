from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Candidate, Vacancy, Interview, Feedback


# ── Plain Serializers (serializers.Serializer) ──────────────────────────────

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


class PipelineSummarySerializer(serializers.Serializer):
    new = serializers.IntegerField()
    screening = serializers.IntegerField()
    interview = serializers.IntegerField()
    offer = serializers.IntegerField()
    hired = serializers.IntegerField()
    rejected = serializers.IntegerField()


# ── ModelSerializers ─────────────────────────────────────────────────────────

class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        read_only_fields = fields


class VacancySerializer(serializers.ModelSerializer):
    created_by = UserShortSerializer(read_only=True)
    candidates_count = serializers.SerializerMethodField()

    class Meta:
        model = Vacancy
        fields = [
            'id', 'title', 'department', 'description', 'requirements',
            'salary_min', 'salary_max', 'priority', 'status',
            'created_by', 'created_at', 'updated_at', 'deadline',
            'candidates_count',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_candidates_count(self, obj):
        return obj.candidates.count()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class CandidateSerializer(serializers.ModelSerializer):
    created_by = UserShortSerializer(read_only=True)
    vacancy_title = serializers.CharField(source='vacancy.title', read_only=True)
    full_name = serializers.CharField(read_only=True)
    interviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Candidate
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'email', 'phone',
            'status', 'source', 'vacancy', 'vacancy_title',
            'resume_url', 'resume_text', 'linkedin_url',
            'expected_salary', 'notes', 'priority',
            'created_by', 'created_at', 'updated_at',
            'interviews_count',
        ]
        read_only_fields = ['id', 'full_name', 'created_by', 'created_at', 'updated_at']

    def get_interviews_count(self, obj):
        return obj.interviews.count()

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class InterviewSerializer(serializers.ModelSerializer):
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    vacancy_title = serializers.CharField(source='vacancy.title', read_only=True)
    interviewer_name = serializers.CharField(source='interviewer.get_full_name', read_only=True)
    created_by = UserShortSerializer(read_only=True)
    has_feedback = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            'id', 'candidate', 'candidate_name', 'vacancy', 'vacancy_title',
            'interview_type', 'status', 'scheduled_at', 'duration_minutes',
            'location', 'interviewer', 'interviewer_name',
            'notes', 'created_by', 'created_at', 'updated_at',
            'has_feedback',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_has_feedback(self, obj):
        return hasattr(obj, 'feedback')

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackSerializer(serializers.ModelSerializer):
    author = UserShortSerializer(read_only=True)
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)

    class Meta:
        model = Feedback
        fields = [
            'id', 'interview', 'candidate', 'candidate_name',
            'author', 'overall_rating', 'technical_rating',
            'communication_rating', 'cultural_fit_rating',
            'strengths', 'weaknesses', 'comments', 'recommendation',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)
