from django.urls import path
from .views import LogView
from .views import update_cron

urlpatterns = [
    path('logs/', LogView.as_view(), name='log-view'),
    path('update-cron/', update_cron, name='update_cron'),
]