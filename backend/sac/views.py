from django.views import View
import os
import getpass
from django.http import JsonResponse
from crontab import CronTab

class LogView(View):
    def get(self, request):
        # Calcula o caminho para a pasta principal subindo três níveis a partir do arquivo atual
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

        # Adiciona os subdiretórios 'bots' e 'test' ao caminho
        log_file_path = os.path.join(base_dir, 'bots', 'test', 'logfile.log')
        print(f"Reading log file from: {log_file_path}")  # Debugging information
        try:
            with open(log_file_path, 'r') as file:
                logs = file.readlines()
            #print(f"Log contents: {logs}")  # Debugging information
            return JsonResponse({'logs': logs, 'log_file_path': log_file_path}, safe=False)
        except FileNotFoundError:
            print("Log file not found")  # Debugging information
            return JsonResponse({'error': 'Log file not found', 'log_file_path': log_file_path}, status=404)
        

def update_cron(request):
    if request.method == 'POST':
        try:
            interval = int(request.POST.get('interval', 5))  # Default to 5 minutes if not specified
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            script_path = os.path.join(base_dir, 'bots', 'test', 'script.py')
            log_path = os.path.join(base_dir, 'bots', 'test', 'logfile.log')
            python_path = '/usr/bin/python3'

            command = f'{python_path} {script_path} >> {log_path} 2>&1'

            # Debugging: Print paths and command
            print(f'Debug: base_dir={base_dir}')
            print(f'Debug: script_path={script_path}')
            print(f'Debug: log_path={log_path}')
            print(f'Debug: command={command}')

            # Create a new cron job
            cron = CronTab(user=getpass.getuser())
            job = cron.new(command=command)
            job.minute.every(interval)

            # Remove existing jobs with the same command
            cron.remove_all(command=command)

            # Add the new job
            cron.write()

            # Verifica se o cron job foi adicionado
            cron_jobs = list(cron.find_command(command))
            if cron_jobs:
                return JsonResponse({'status': 'success', 'message': f'Cron job updated to run every {interval} minutes.', 'cron_job': str(cron_jobs[0])})
            else:
                # Debugging: No job found
                print(f'Debug: No cron job found with command {command}')
                return JsonResponse({'status': 'failed', 'message': 'Failed to add cron job.'})

        except Exception as e:
            # Debugging: Catch and print exception details
            print(f'Debug: Exception occurred: {e}')
            return JsonResponse({'status': 'failed', 'message': f'Exception occurred: {str(e)}'})

    return JsonResponse({'status': 'failed', 'message': 'Invalid request method.'})