
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.progress_report_service import ProgressReportService


router = APIRouter(
    prefix="/api/progress",
    tags=["Speaking Progress"]
)

progress_service = ProgressReportService()


class ProgressReportRequest(BaseModel):

    sessions: list[dict] = Field(default_factory=list)


@router.post("/report")
async def generate_progress_report(request: ProgressReportRequest):

    try:

        result = progress_service.generate_report(
            request.sessions
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
            detail=f"Progress report generation failed: {str(error)}"
        )
