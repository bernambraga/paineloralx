# utils/utils.py
import sys
import logging

class DatabaseLogHandler(logging.Handler):
    def emit(self, record):
        try:
            # Ignora durante as migrações
            if 'makemigrations' in sys.argv or 'migrate' in sys.argv:
                return

            from api.models import Log
            Log.objects.create(
                level=record.levelname,
                message=record.getMessage(),
                user_id=getattr(record, 'user_id', None),
                endpoint=getattr(record, 'endpoint', None)
            )
        except Exception as e:
            print(f"Erro ao salvar log no banco: {e}")