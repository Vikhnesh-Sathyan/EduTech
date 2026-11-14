
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, model_validator

from app.study_companion.services.session_service import study_session_service


router = APIRouter(
    prefix="/study-companion",
    tags=["Study Companion"]
)


class SummaryRequest(BaseModel):

    session_id: str

    summary_type: Literal["short", "medium", "detailed"] = "medium"


class PageSummaryRequest(BaseModel):

    session_id: str

    start_page: int = Field(ge=1)

    end_page: int = Field(ge=1)

    summary_type: Literal["short", "medium", "detailed"] = "medium"

    @model_validator(mode="after")
    def validate_page_range(self):

        if self.end_page < self.start_page:
            raise ValueError("Invalid page range.")

        return self


class ImportantPointsRequest(BaseModel):

    session_id: str


# ==========================================
# GET DOCUMENT SERVICE
# ==========================================

def get_document_service(session_id):

    try:
        return study_session_service.get_session(session_id)

    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Study session not found."
        )


# ==========================================
# GENERATE SUMMARY
# ==========================================

@router.post("/summary")
def generate_summary(request: SummaryRequest):

    try:

        document_service = get_document_service(
            request.session_id
        )

        summary = document_service.generate_summary(
            request.summary_type
        )

        return {
            "success": True,
            "summary_type": request.summary_type,
            "summary": summary
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate summary."
        )


# ==========================================
# SUMMARIZE SELECTED PAGES
# ==========================================

@router.post("/summary/pages")
def summarize_pages(request: PageSummaryRequest):

    try:

        document_service = get_document_service(
            request.session_id
        )

        summary = document_service.summarize_page_range(
            request.start_page,
            request.end_page,
            request.summary_type
        )

        return {
            "success": True,
            "start_page": request.start_page,
            "end_page": request.end_page,
            "summary_type": request.summary_type,
            "summary": summary
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to summarize selected pages."
        )


# ==========================================
# GENERATE IMPORTANT POINTS
# ==========================================

@router.post("/important-points")
def generate_important_points(request: ImportantPointsRequest):

    try:

        document_service = get_document_service(
            request.session_id
        )

        points = document_service.generate_important_points()

        return {
            "success": True,
            "important_points": points
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to extract important points."
        )
