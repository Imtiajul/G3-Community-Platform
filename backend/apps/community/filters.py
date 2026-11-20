import django_filters
from django.db.models import Q
from django.utils import timezone
from .models import Session


class SessionFilter(django_filters.FilterSet):
    date = django_filters.DateFilter(field_name="date")
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")
    session_number = django_filters.NumberFilter(field_name="session_number")
    batch = django_filters.NumberFilter(field_name="batch__number")
    batch_id = django_filters.NumberFilter(field_name="batch__id")
    tag = django_filters.CharFilter(method="filter_tag")
    state = django_filters.CharFilter(method="filter_state")
    is_featured = django_filters.BooleanFilter(field_name="is_featured")
    status = django_filters.ChoiceFilter(choices=Session.Status.choices)
    search = django_filters.CharFilter(method="filter_search")

    class Meta:
        model = Session
        fields = [
            "date",
            "date_from",
            "date_to",
            "session_number",
            "batch",
            "batch_id",
            "tag",
            "state",
            "is_featured",
            "status",
            "search",
        ]

    def filter_tag(self, queryset, name, value):
        return queryset.filter(Q(tags__slug=value) | Q(tags__name__iexact=value)).distinct()

    def filter_state(self, queryset, name, value):
        today = timezone.localdate()
        val = value.strip().lower()
        if val == "upcoming":
            return queryset.filter(
                Q(status=Session.Status.PUBLISHED, date__gt=today)
                | Q(status=Session.Status.SCHEDULED)
            )
        elif val == "completed":
            return queryset.filter(
                Q(status=Session.Status.PUBLISHED, date__lte=today)
                | Q(status=Session.Status.ARCHIVED)
            )
        return queryset

    def filter_search(self, queryset, name, value):
        if not value:
            return queryset
        val = value.strip()
        # Case-insensitive substring search handles Bangla UTF-8 text flawlessly on all databases
        return queryset.filter(
            Q(title__icontains=val) | Q(content__icontains=val) | Q(seo_description__icontains=val)
        ).distinct()
