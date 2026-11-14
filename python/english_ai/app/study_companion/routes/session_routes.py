
from typing import Annotated

from fastapi import APIRouter, HTTPException, Path

from app.study_companion.services.session_service import study_session_service


router = APIRouter(
    prefix="/study-companion",
    tags=["Study Companion"]
)


# ==========================================
# DELETE STUDY SESSION
# ==========================================

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: Annotated[str, Path(min_length=1)]
):

    try:

        return study_session_service.delete_session(
            session_id
        )

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Study session not found."
        )
