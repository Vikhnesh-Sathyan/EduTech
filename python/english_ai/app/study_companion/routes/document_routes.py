
import os
import tempfile

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field

from app.study_companion.services.session_service import study_session_service
from app.study_companion.services.document_service import StudyDocumentService


router = APIRouter(
    prefix="/study-companion",
    tags=["Study Companion"]
)


MAX_PDF_SIZE = 10 * 1024 * 1024


class TextDocumentRequest(BaseModel):

    text: str = Field(
        min_length=50,
        max_length=1_000_000
    )


# ==========================================
# UPLOAD PDF
# ==========================================

@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = None

    try:

        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=400,
                detail="Please upload a valid PDF file."
            )

        file_content = await file.read(MAX_PDF_SIZE + 1)

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="The uploaded PDF is empty."
            )

        if len(file_content) > MAX_PDF_SIZE:
            raise HTTPException(
                status_code=413,
                detail="PDF file size cannot exceed 10 MB."
            )

        if not file_content.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid PDF."
            )

        with tempfile.NamedTemporaryFile(
            suffix=".pdf",
            delete=False
        ) as temporary_file:

            temporary_file.write(file_content)
            file_path = temporary_file.name

        document_service = StudyDocumentService()

        document_info = document_service.load_pdf(file_path)

        session = study_session_service.create_session(
            document_service
        )

        return {
            "success": True,
            "session_id": session["session_id"],
            "filename": file.filename,
            "total_pages": document_info["total_pages"],
            "message": "PDF uploaded and processed successfully."
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
            detail="Unable to process the uploaded PDF."
        )

    finally:

        if file_path and os.path.exists(file_path):
            os.remove(file_path)

        await file.close()


# ==========================================
# UPLOAD DIRECT TEXT
# ==========================================

@router.post("/upload-text")
def upload_text(request: TextDocumentRequest):

    try:

        document_service = StudyDocumentService()

        document_info = document_service.load_text(
            request.text
        )

        session = study_session_service.create_session(
            document_service
        )

        return {
            "success": True,
            "session_id": session["session_id"],
            "total_pages": document_info["total_pages"],
            "message": "Text processed successfully."
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to process the text."
        )
