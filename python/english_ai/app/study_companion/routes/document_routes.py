
import os
import tempfile

from uuid import UUID

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    HTTPException,
    Depends
)

from pydantic import BaseModel, Field

from app.study_companion.services.session_service import (
    study_session_service
)

from app.study_companion.services.document_service import (
    StudyDocumentService
)

from app.study_companion.internal_auth import (
    verify_internal_request
)


router = APIRouter(
    prefix="/study-companion",
    tags=["Study Companion"],
    dependencies=[Depends(verify_internal_request)]
)


MAX_PDF_SIZE = 10 * 1024 * 1024


# ==========================================
# REQUEST MODELS
# ==========================================


class TextDocumentRequest(BaseModel):

    session_id: UUID

    text: str = Field(
        min_length=50,
        max_length=1_000_000
    )



class RestorePage(BaseModel):

    page_number: int = Field(ge=1)

    content: str = Field(
        min_length=1
    )


class RestoreChunk(BaseModel):

    page_number: int = Field(ge=1)

    content: str = Field(
        min_length=1
    )


class RestoreSessionRequest(BaseModel):

    session_id: UUID

    pages: list[RestorePage] = Field(
        min_length=1
    )

    chunks: list[RestoreChunk] = Field(
        min_length=1
    )


# ==========================================
# UPLOAD PDF
# ==========================================

@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    session_id: UUID = Form(...)
):

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

        document_info = document_service.load_pdf(
            file_path
        )

        session = study_session_service.create_session(
            document_service,
            session_id=str(session_id)
        )

        return {
            "success": True,
            "session_id": session["session_id"],
            "filename": file.filename,
            "total_pages": document_info["total_pages"],
            "pages": document_service.pages,
            "chunks": document_service.chunks,
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
            document_service,
            session_id=str(request.session_id)
        )

        return {
            "success": True,
            "session_id": session["session_id"],
            "total_pages": document_info["total_pages"],
            "pages": document_service.pages,
            "chunks": document_service.chunks,
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

# ==========================================
# RESTORE SESSION FROM SAVED DATA
# ==========================================

@router.post("/restore-session")
def restore_session(request: RestoreSessionRequest):

    try:

        session_id = str(request.session_id)

        # Check whether the session already exists in memory.
        try:

            existing_session = study_session_service.get_session(
                session_id
            )

            return {
                "success": True,
                "session_id": session_id,
                "message": "Study session is already available."
            }

        except ValueError:
            pass

        # Restore only when the session is not in memory.
        document_service = StudyDocumentService()

        pages = [
            page.model_dump()
            for page in request.pages
        ]

        chunks = [
            chunk.model_dump()
            for chunk in request.chunks
        ]

        document_service.restore_document(
            pages,
            chunks
        )

        session = study_session_service.create_session(
            document_service,
            session_id=session_id
        )

        return {
            "success": True,
            "session_id": session["session_id"],
            "total_pages": len(pages),
            "total_chunks": len(chunks),
            "message": "Study session restored successfully."
        }

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="Unable to restore the study session."
        )
