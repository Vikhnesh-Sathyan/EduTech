
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.speech_service import SpeechService
from app.analysis.speech_analysis import SpeechAnalysisService


router = APIRouter(prefix="/api/speech", tags=["Speech"])


# Service instances
speech_service = None
speech_analysis_service = SpeechAnalysisService()


@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):

    global speech_service

    # ----------------------------------
    # 1. Validate audio format
    # ----------------------------------

    if not file.filename or not file.filename.lower().endswith(
        (".wav", ".mp3", ".m4a")
    ):
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format"
        )

    upload_dir = Path("uploads")
    upload_dir.mkdir(exist_ok=True)

    temp_path = upload_dir / f"{uuid4()}{Path(file.filename).suffix}"

    try:

        # ----------------------------------
        # 2. Read uploaded audio
        # ----------------------------------

        audio_data = await file.read()

        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="Uploaded audio file is empty"
            )

        temp_path.write_bytes(audio_data)

        # ----------------------------------
        # 3. Initialize Whisper
        # ----------------------------------

        if speech_service is None:
            speech_service = SpeechService()

        # ----------------------------------
        # 4. Convert audio into transcript
        # ----------------------------------

        result = speech_service.transcribe_audio(str(temp_path))

        transcript = result["transcript"]

        # ----------------------------------
        # 5. Analyse transcript
        # ----------------------------------

        analysis = speech_analysis_service.analyze_speech(transcript)

        # ----------------------------------
        # 6. Return combined response
        # ----------------------------------

        return {
            "success": True,
            "language": result["language"],
            "transcript": transcript,
            "analysis": analysis
        }

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
