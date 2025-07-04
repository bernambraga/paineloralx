# manage.py
import os
import sys

def main():
    #env = os.getenv('DJANGO_ENV', 'production')
    env = os.getenv('DJANGO_ENV', 'development')
    settings_module = f"backend.settings.{env}"
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', settings_module)
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()

