from django.urls import path
from .views import LogView
from .views import *


urlpatterns = [
    path('logs/', LogView.as_view(), name='log-view'),
    path('update-cron/', update_cron, name='update_cron'),
    path('list-scripts/', list_scripts, name='list-scripts'),
    path('list-cronjobs/', list_cronjobs, name='list-cronjobs'),
    path('download-log/', download_log, name='download-log'),
]