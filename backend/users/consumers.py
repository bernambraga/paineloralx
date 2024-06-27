import asyncio
import os
from channels.generic.websocket import AsyncWebsocketConsumer

class LogConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Ajuste o caminho do arquivo de log
        self.logfile = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'logfile.log')
        print(str(self.logfile))
        self.task = asyncio.create_task(self.send_logs())

    async def disconnect(self, close_code):
        self.task.cancel()

    async def send_logs(self):
        with open(self.logfile) as f:
            f.seek(0, os.SEEK_END)
            while True:
                line = f.readline()
                if line:
                    await self.send(text_data=line)
                await asyncio.sleep(1)
