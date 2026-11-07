
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.speech_service import SpeechService

router = APIRouter(prefix="/api/speech", tags=["Speech"])

speech_service = None


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    global speech_service

    if not file.filename.lower().endswith((".wav", ".mp3", ".m4a")):
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format"
        )

    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    temp_path = upload_dir / f"{uuid4()}{Path(file.filename).suffix}"

    try:
        audio_data = await file.read()

        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="Uploaded audio file is empty"
            )

        temp_path.write_bytes(audio_data)

        if speech_service is None:
            speech_service = SpeechService()

        result = speech_service.transcribe_audio(str(temp_path))

        return result

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Speech recognition failed: {str(error)}"
        )

    finally:
        if temp_path.exists():
            temp_path.unlink()

        await file.close()
