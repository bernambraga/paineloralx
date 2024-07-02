from django.http import JsonResponse
import os
from django.views import View
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
        interval = int(request.POST.get('interval', 5))  # Default to 5 minutes if not specified
        script_path = '/home/oralx/paineloralx/bots/test/script.py'
        python_path = '/usr/bin/python3'

        # Create a new cron job
        cron = CronTab(user=os.getlogin())
        job = cron.new(command=f'{python_path} {script_path} >> /home/oralx/paineloralx/bots/test/logfile.log 2>&1')
        job.minute.every(interval)

        # Remove existing jobs with the same command
        cron.remove_all(command=f'{python_path} {script_path} >> /home/oralx/paineloralx/bots/test/logfile.log 2>&1')

        # Add the new job
        cron.write()

        return JsonResponse({'status': 'success', 'message': f'Cron job updated to run every {interval} minutes.'})
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method.'})
