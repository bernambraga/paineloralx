from django.views import View
import json
import os
import getpass
from django.http import JsonResponse, FileResponse
from crontab import CronTab

class LogView(View):
    def get(self, request):
        script_folder = request.GET.get('folder')
        if not script_folder:
            return JsonResponse({'error': 'Folder parameter is required'}, status=400)

        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        log_file_path = os.path.join(base_dir, 'bots', script_folder, 'logfile.log')
        try:
            with open(log_file_path, 'r') as file:
                logs = file.readlines()
            return JsonResponse({'logs': logs, 'log_file_path': log_file_path}, safe=False)
        except FileNotFoundError:
            return JsonResponse({'error': f'Log file not found in folder {script_folder}', 'log_file_path': log_file_path}, status=404)

def list_scripts(request):
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    bots_dir = os.path.join(base_dir, 'bots')
    try:
        folders = [f for f in os.listdir(bots_dir) if os.path.isdir(os.path.join(bots_dir, f))]
        return JsonResponse({'scripts': folders}, safe=False)
    except Exception as e:
        return JsonResponse({'status': 'failed', 'message': f'Exception occurred: {str(e)}'})

def update_cron(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            hour = data.get('hour')
            minute = data.get('minute')
            script_folder = data.get('script_name')
            if hour is None or minute is None or script_folder is None:
                return JsonResponse({'status': 'failed', 'message': 'Hour, minute, and script folder name must be provided.'})
            
            hour = int(hour)
            minute = int(minute)

            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            script_path = os.path.join(base_dir, 'bots', script_folder, 'script.py')
            log_path = os.path.join(base_dir, 'bots', script_folder, 'logfile.log')
            python_path = '/usr/bin/python3'
            user = getpass.getuser()

            command = f'{python_path} {script_path} >> {log_path} 2>&1'

            cron = CronTab(user=user)
            cron.remove_all(command=command)
            cron.write()

            job = cron.new(command=command)
            job.setall(f'{minute} {hour} * * *')
            cron.write()

            cron_jobs = list(cron.find_command(command))
            if cron_jobs:
                return JsonResponse({'status': 'success', 'message': f'Cron job updated to run {script_folder}/script.py at {hour:02d}:{minute:02d}', 'cron_job': str(cron_jobs[0])})
            else:
                return JsonResponse({'status': 'failed', 'message': 'Failed to add cron job.'})

        except Exception as e:
            return JsonResponse({'status': 'failed', 'message': f'Exception occurred: {str(e)}'})

    return JsonResponse({'status': 'failed', 'message': 'Invalid request method.'})

def list_cronjobs(request):
    try:
        user = getpass.getuser()
        cron = CronTab(user=user)
        jobs = []
        for job in cron:
            jobs.append({
                'command': job.command,
                'schedule': str(job.slices)
            })
        return JsonResponse({'status': 'success', 'jobs': jobs})
    except Exception as e:
        return JsonResponse({'status': 'failed', 'message': f'Exception occurred: {str(e)}'})

def download_log(request):
    script_folder = request.GET.get('folder')
    if not script_folder:
        return JsonResponse({'error': 'Folder parameter is required'}, status=400)

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    log_file_path = os.path.join(base_dir, 'bots', script_folder, 'logfile.log')
    try:
        return FileResponse(open(log_file_path, 'rb'), as_attachment=True, filename=f'{script_folder}_logfile.log')
    except FileNotFoundError:
        return JsonResponse({'error': f'Log file not found in folder {script_folder}'}, status=404)
