from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from app.views import LoginView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('app.urls')),

    # Legacy login endpoint (session-based)
    path("api/v1/login/", LoginView.as_view(), name="login"),

    # JWT auth (SimpleJWT)
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Backwards-compatible refresh path
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh_v1"),
]
