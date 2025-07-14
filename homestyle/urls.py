from django.contrib import admin
from django.urls import path, include
from django.views.static import serve
from django.conf import settings
from django.urls import re_path
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('store.urls')),
    re_path(r'^assets/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'store', 'static', 'assets'),
    }),
]
