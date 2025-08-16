import asyncio

from routers.login import login_router
from routers.messages import message_router
from uvicorn import Config, Server

from fastapi import FastAPI

app = FastAPI()


class ApplicationServer(Server):
    def __init__(self, port: int, *args, **kwargs):
        self.app = FastAPI()
        self.app.include_router(login_router)
        self.app.include_router(message_router)
        self.config = Config(app=self.app, host="0.0.0.0", port=port, loop="asyncio")
        super(ApplicationServer, self).__init__(config=self.config, *args, **kwargs)

    async def run(self, sockets=None):
        self.config.setup_event_loop()
        return await self.serve(sockets=sockets)


if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(
        ApplicationServer(
            port=4444,
        ).run()
    )
