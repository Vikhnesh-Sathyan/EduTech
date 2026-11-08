
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.debate_service import DebateService


router = APIRouter(
    prefix="/api/debate",
    tags=["AI Debate Practice"]
)

debate_service = None


class DebateRequest(BaseModel):

    topic: str
    student_position: str
    argument: str
    history: list[dict] = []


@router.post("/respond")
async def debate_response(request: DebateRequest):

    global debate_service

    try:

        if debate_service is None:
            debate_service = DebateService()

        result = debate_service.generate_opponent_response(
            topic=request.topic,
            student_position=request.student_position,
            student_argument=request.argument,
            conversation_history=request.history
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
            detail=f"Debate response failed: {str(error)}"
        )
