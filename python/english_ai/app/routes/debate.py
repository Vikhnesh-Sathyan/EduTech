
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

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

    history: list[dict] = Field(default_factory=list)

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, value):

        if not value.strip():
            raise ValueError("Debate topic cannot be empty")

        return value.strip()

    @field_validator("student_position")
    @classmethod
    def validate_position(cls, value):

        value = value.strip().lower()

        if value not in ["for", "against"]:
            raise ValueError("Position must be 'for' or 'against'")

        return value

    @field_validator("argument")
    @classmethod
    def validate_argument(cls, value):

        if not value.strip():
            raise ValueError("Debate argument cannot be empty")

        return value.strip()


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
