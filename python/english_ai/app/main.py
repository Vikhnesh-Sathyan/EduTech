from fastapi import FastAPI

from app.routes.health import router as health_router
from app.routes.speech import router as speech_router
from app.routes.conversation import router as conversation_router
from app.routes.topics import router as topics_router
from app.routes.topic_evaluation import router as topic_evaluation_router
from app.routes.debate import router as debate_router
from app.routes.debate_evaluation import router as debate_evaluation_router
from app.routes.progress import router as progress_router

from app.study_companion.routes.document_routes import router as study_companion_router
from app.study_companion.routes.summary_routes import router as summary_router
from app.study_companion.routes.question_routes import router as question_router
from app.study_companion.routes.session_routes import router as session_router

app = FastAPI(
    title="EduTech AI English Practice",
    description="AI-powered English speaking practice system",
    version="1.0.0"
)

app.include_router(health_router)
app.include_router(speech_router)
app.include_router(conversation_router)
app.include_router(topics_router)
app.include_router(topic_evaluation_router)
app.include_router(debate_router)
app.include_router(debate_evaluation_router)
app.include_router(progress_router)

app.include_router(study_companion_router)
app.include_router(summary_router)
app.include_router(question_router)
app.include_router(session_router)
