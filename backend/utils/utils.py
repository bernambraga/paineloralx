# utils/utils.py

import logging
import psycopg2
from django.conf import settings

class DatabaseLogHandler(logging.Handler):
    def emit(self, record):
        try:
            conn = psycopg2.connect(
                dbname=settings.DATABASES['default']['NAME'],
                user=settings.DATABASES['default']['USER'],
                password=settings.DATABASES['default']['PASSWORD'],
                host=settings.DATABASES['default']['HOST'],
                port=settings.DATABASES['default']['PORT']
            )
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO logs (timestamp, level, message, user_id, endpoint)
                VALUES (CURRENT_TIMESTAMP, %s, %s, %s, %s)
            """, (record.levelname, record.getMessage(), getattr(record, 'user_id', None), getattr(record, 'endpoint', None)))
            conn.commit()
            cursor.close()
            conn.close()
        except Exception as e:
            print(f"Failed to log message to database: {e}")

# Adicionar o manipulador ao logger do Django
logging.getLogger('django').addHandler(DatabaseLogHandler())
