
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.topic_evaluation_service import TopicEvaluationService


router = APIRouter(
    prefix="/api/topics",
    tags=["Topic Speaking"]
)

evaluation_service = None


class TopicEvaluationRequest(BaseModel):

    topic: str
    transcript: str


@router.post("/evaluate")
async def evaluate_topic_answer(request: TopicEvaluationRequest):

    global evaluation_service

    try:

        if evaluation_service is None:
            evaluation_service = TopicEvaluationService()

        result = evaluation_service.evaluate_answer(
            request.topic,
            request.transcript
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Topic evaluation failed: {str(error)}"
        )
