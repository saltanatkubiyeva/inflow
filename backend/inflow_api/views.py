from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404

from .models import Candidate, Vacancy, Interview, Feedback
from .serializers import (
    LoginSerializer, PipelineSummarySerializer,
    CandidateSerializer, VacancySerializer,
    InterviewSerializer, FeedbackSerializer,
)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.get_full_name(),
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    pipeline = Candidate.objects.pipeline_summary(user)
    pipeline_serializer = PipelineSummarySerializer(data=pipeline)
    pipeline_serializer.is_valid()

    upcoming_interviews = Interview.objects.filter(
        created_by=user,
        status='scheduled'
    ).order_by('scheduled_at')[:5]

    recent_candidates = Candidate.objects.by_hr(user).order_by('-created_at')[:5]

    return Response({
        'pipeline': pipeline,
        'total_candidates': Candidate.objects.by_hr(user).count(),
        'total_vacancies': Vacancy.objects.filter(created_by=user, status='open').count(),
        'upcoming_interviews': InterviewSerializer(
            upcoming_interviews, many=True, context={'request': request}
        ).data,
        'recent_candidates': CandidateSerializer(
            recent_candidates, many=True, context={'request': request}
        ).data,
    })


class CandidateListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Candidate.objects.by_hr(request.user)
        status_filter = request.query_params.get('status')
        vacancy_filter = request.query_params.get('vacancy')
        search = request.query_params.get('search')

        if status_filter:
            qs = qs.filter(status=status_filter)
        if vacancy_filter:
            qs = qs.filter(vacancy_id=vacancy_filter)
        if search:
            qs = qs.filter(
                first_name__icontains=search
            ) | qs.filter(
                last_name__icontains=search
            ) | qs.filter(
                email__icontains=search
            )

        serializer = CandidateSerializer(qs.distinct(), many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = CandidateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CandidateDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk, user):
        return get_object_or_404(Candidate, pk=pk, created_by=user)

    def get(self, request, pk):
        candidate = self._get_object(pk, request.user)
        return Response(CandidateSerializer(candidate, context={'request': request}).data)

    def put(self, request, pk):
        candidate = self._get_object(pk, request.user)
        serializer = CandidateSerializer(candidate, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, pk):
        candidate = self._get_object(pk, request.user)
        serializer = CandidateSerializer(
            candidate, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        candidate = self._get_object(pk, request.user)
        candidate.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class VacancyListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Vacancy.objects.filter(created_by=request.user)
        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(VacancySerializer(qs, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = VacancySerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VacancyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk, user):
        return get_object_or_404(Vacancy, pk=pk, created_by=user)

    def get(self, request, pk):
        return Response(VacancySerializer(self._get_object(pk, request.user), context={'request': request}).data)

    def put(self, request, pk):
        vacancy = self._get_object(pk, request.user)
        s = VacancySerializer(vacancy, data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)

    def patch(self, request, pk):
        vacancy = self._get_object(pk, request.user)
        s = VacancySerializer(vacancy, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)

    def delete(self, request, pk):
        self._get_object(pk, request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InterviewListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Interview.objects.filter(created_by=request.user)
        candidate_id = request.query_params.get('candidate')
        if candidate_id:
            qs = qs.filter(candidate_id=candidate_id)
        return Response(InterviewSerializer(qs, many=True, context={'request': request}).data)

    def post(self, request):
        s = InterviewSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)


class InterviewDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk, user):
        return get_object_or_404(Interview, pk=pk, created_by=user)

    def get(self, request, pk):
        return Response(InterviewSerializer(self._get_object(pk, request.user), context={'request': request}).data)

    def patch(self, request, pk):
        interview = self._get_object(pk, request.user)
        s = InterviewSerializer(interview, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)

    def delete(self, request, pk):
        self._get_object(pk, request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FeedbackListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Feedback.objects.filter(author=request.user)
        candidate_id = request.query_params.get('candidate')
        if candidate_id:
            qs = qs.filter(candidate_id=candidate_id)
        return Response(FeedbackSerializer(qs, many=True, context={'request': request}).data)

    def post(self, request):
        s = FeedbackSerializer(data=request.data, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data, status=status.HTTP_201_CREATED)


class FeedbackDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        fb = get_object_or_404(Feedback, pk=pk, author=request.user)
        return Response(FeedbackSerializer(fb, context={'request': request}).data)

    def patch(self, request, pk):
        fb = get_object_or_404(Feedback, pk=pk, author=request.user)
        s = FeedbackSerializer(fb, data=request.data, partial=True, context={'request': request})
        s.is_valid(raise_exception=True)
        s.save()
        return Response(s.data)

    def delete(self, request, pk):
        get_object_or_404(Feedback, pk=pk, author=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
    except Exception:
        pass
    return Response({'detail': 'Successfully logged out.'})
