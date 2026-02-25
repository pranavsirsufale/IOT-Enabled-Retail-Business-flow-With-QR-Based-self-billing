from pathlib import Path
import dj_database_url
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-j_q!!85)+pa^rbb=f%cmq9$-&!($ig&ks=n#(bdqr=38my!60c'
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# Allow the frontend dev server origin for CORS and CSRF
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173"
]

# Required for Django's CSRF origin checking when frontend runs on a separate origin
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

INSTALLED_APPS = [
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
# DATABASES = {
#     'default': dj_database_url.parse(
#         "postgresql://store_su5t_user:ZJ4cOwIRGY0wbJPfsxxhGMqJEann7ZCe@dpg-d6cot0pr0fns739d68ng-a.oregon-postgres.render.com/store_su5t"
#     )
# }
# DATABASES = {
#     # This reads your URL string directly
#     'default': dj_database_url.parse('mysql://store_finefellup:29f885175d586f289a3d2b78b993089fc92359f7@rywkqr.h.filess.io:61002/store_finefellup')
#   }
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': "store",
        "USER": "store",
        "PASSWORD": "Store@123",
        "HOST": "localhost",
        "PORT": "3306"
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
STATIC_URL = 'static/'
