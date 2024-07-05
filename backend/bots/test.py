from crontab import CronTab

command = '/usr/bin/python3 /home/berna/GITHUB/paineloralx/bots/script.py >> /home/berna/GITHUB/paineloralx/bots/logfile.log 2>&1'

cron = CronTab(user='berna')
cron.remove_all(command=command)
cron.write()