from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegistroView, CustomTokenObtainPairView

urlpatterns = [
    path('registro/', RegistroView.as_view(), name='auth_registro'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth_token_refresh'),
]
