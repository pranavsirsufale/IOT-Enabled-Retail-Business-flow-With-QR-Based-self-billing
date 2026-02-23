from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from app.views import LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('app.urls')),

    # Login & token generation
    path("api/v1/login/", LoginView.as_view(), name="login"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh")
]
