from .base import *

DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    'localhost:8000',
    'localhost:3000',
    '127.0.0.1:8000',
    '127.0.0.1:3000',
    '191.252.202.133',
    'dev.paineloralx.com.br'
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'http://191.252.202.133:3000',
    'https://dev.paineloralx.com.br',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost', 
    'http://127.0.0.1', 
    'http://0.0.0.0',
    'https://dev.paineloralx.com.br',
    ]
