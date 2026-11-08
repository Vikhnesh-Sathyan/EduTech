
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.debate_evaluation_service import DebateEvaluationService


router = APIRouter(
    prefix="/api/debate",
    tags=["AI Debate Practice"]
)

evaluation_service = None


class DebateEvaluationRequest(BaseModel):

    topic: str
    student_arguments: list[str]


@router.post("/evaluate")
async def evaluate_debate(request: DebateEvaluationRequest):

    global evaluation_service

    try:

        if evaluation_service is None:
            evaluation_service = DebateEvaluationService()

        result = evaluation_service.evaluate_debate(
            topic=request.topic,
            student_arguments=request.student_arguments
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
            detail=f"Debate evaluation failed: {str(error)}"
        )
