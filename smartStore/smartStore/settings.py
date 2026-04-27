from pathlib import Path
import os
import dj_database_url
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-j_q!!85)+pa^rbb=f%cmq9$-&!($ig&ks=n#(bdqr=38my!60c'
DEBUG = True
# ALLOWED_HOSTS = ["localhost","iot-v52t.onrender.com", "127.0.0.1","10.241.23.100"]
ALLOWED_HOSTS = [
    "iot-v52t.onrender.com"
]
# Allow the frontend dev server origin for CORS and CSRF
CORS_ALLOW_CREDENTIALS = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://iotses.netlify.app/",
    "https://iot-enabled-retail-business-flow-with-qr-based-self-3fdjsvfqw.vercel.app"
]

CSRF_TRUSTED_ORIGINS = [
    "https://iot-v52t.onrender.com",
    "https://iotses.netlify.app/",
    "https://iot-enabled-retail-business-flow-with-qr-based-self-3fdjsvfqw.vercel.app"

]
# Required for Django's CSRF origin checking when frontend runs on a separate origin
# CSRF_TRUSTED_ORIGINS = [
#     "http://localhost:5173",
#     "http://127.0.0.1:5173",
#     "https://iot-enabled-retail-business-flow-wi.vercel.app"
# ]
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

INSTALLED_APPS = [
    'daphne',
    'channels',
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'app'
]
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),
}
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
ROOT_URLCONF = 'smartStore.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'smartStore.wsgi.application'
ASGI_APPLICATION = 'smartStore.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer'
    }
}

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DJANGO_USE_SQLITE = os.getenv("DJANGO_USE_SQLITE", "").strip().lower() in {"1", "true", "yes"}

if DATABASE_URL:
    # Render (and most hosts) provide a DATABASE_URL for managed DBs.
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
        )
    }
elif DJANGO_USE_SQLITE:
    # Optional: allow deployments without an external DB (demo only).
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    # Local development default (existing behavior)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': "store",
            "USER": "store",
            "PASSWORD": "Store@123",
            # Use 127.0.0.1 (TCP) instead of localhost (socket) to be explicit.
            "HOST": os.getenv("MYSQL_HOST", "127.0.0.1"),
            "PORT": os.getenv("MYSQL_PORT", "3306"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = '/static/'

# Required for `collectstatic` (e.g. on Render/Heroku-like deploys).
STATIC_ROOT = BASE_DIR / 'staticfiles'
