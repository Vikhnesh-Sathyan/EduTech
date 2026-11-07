
from fastapi import FastAPI

from app.routes.health import router as health_router
from app.routes.speech import router as speech_router

app = FastAPI(
    title="EduTech AI English Practice",
    description="AI-powered English speaking practice system",
    version="1.0.0"
)

app.include_router(health_router)
app.include_router(speech_router)
