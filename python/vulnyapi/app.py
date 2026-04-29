import asyncio

from fastapi import FastAPI
from uvicorn import Config, Server

from routers.admin import admin_router
from routers.auth import auth_router
from routers.files import files_router
from routers.notes import notes_router
from routers.users import users_router
from routers.webhooks import webhooks_router


def build_app() -> FastAPI:
    app = FastAPI(title="vulnyapi", version="0.1.0")
    app.include_router(auth_router, prefix="/auth")
    app.include_router(users_router, prefix="/users")
    app.include_router(notes_router, prefix="/notes")
    app.include_router(webhooks_router, prefix="/webhooks")
    app.include_router(admin_router, prefix="/admin")
    app.include_router(files_router, prefix="/files")
    return app


app = build_app()


class ApplicationServer(Server):
    def __init__(self, port: int, *args, **kwargs):
        self.app = build_app()
        self.config = Config(app=self.app, host="0.0.0.0", port=port, loop="asyncio")
        super().__init__(config=self.config, *args, **kwargs)

    async def run(self, sockets=None):
        self.config.setup_event_loop()
        return await self.serve(sockets=sockets)


if __name__ == "__main__":
    asyncio.run(ApplicationServer(port=4444).run())
