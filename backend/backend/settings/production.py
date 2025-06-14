from .base import *

DEBUG = False
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'painel'),
        'USER': os.getenv('POSTGRES_USER', 'painel_user'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'senha_forte'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': '5432',
    }
}

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'localhost:8000',
    'localhost:3000',
    '127.0.0.1:8000',
    '127.0.0.1:3000',
    '191.252.202.133',
    'paineloralx.com.br',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'http://191.252.202.133:3000',
    'https://paineloralx.com.br',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost',
    'http://127.0.0.1',
    'http://0.0.0.0',
    'https://paineloralx.com.br',
]


CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
