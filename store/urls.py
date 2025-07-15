from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.index, name='home'),
    path('products/', views.products, name='products'),
    path('contact/', views.contact, name='contact'),
    path('faq/', views.faq, name='faq'),
    path('api/products/', views.products_api, name='products_api'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

