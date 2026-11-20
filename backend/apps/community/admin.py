from django.contrib import admin
from .models import Batch


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ("number", "name", "start_date", "end_date", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "number")
