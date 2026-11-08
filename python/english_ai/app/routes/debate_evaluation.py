
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.debate_evaluation_service import DebateEvaluationService


router = APIRouter(
    prefix="/api/debate",
    tags=["AI Debate Practice"]
)


evaluation_service = None


class DebateEvaluationRequest(BaseModel):

    topic: str

    student_arguments: list[str] = Field(min_length=1)

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, value):

        if not value.strip():
            raise ValueError("Debate topic cannot be empty")

        return value.strip()

    @field_validator("student_arguments")
    @classmethod
    def validate_arguments(cls, value):

        cleaned_arguments = [
            argument.strip()
            for argument in value
            if argument.strip()
        ]

        if not cleaned_arguments:
            raise ValueError("At least one debate argument is required")

        return cleaned_arguments


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
