
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.study_companion.services.session_service import study_session_service


router = APIRouter(
    prefix="/study-companion",
    tags=["Study Companion"]
)


class QuestionRequest(BaseModel):

    session_id: str = Field(min_length=1)

    question: str = Field(
        min_length=1,
        max_length=2000
    )


# ==========================================
# ASK DOCUMENT QUESTION
# ==========================================

@router.post("/ask")
def ask_question(request: QuestionRequest):

    try:

        document_service = study_session_service.get_session(
            request.session_id
        )

        result = document_service.ask_question(
            request.question
        )

        return result

    except ValueError as error:

        if str(error) == "Study session not found.":

            raise HTTPException(
                status_code=404,
                detail=str(error)
            )

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Unable to answer your question."
        )
