
from faster_whisper import WhisperModel


class SpeechService:

    def __init__(self):

        self.model = WhisperModel(
            "tiny",
            device="cpu",
            compute_type="int8"
        )

    def transcribe_audio(self, audio_path):

        segments, info = self.model.transcribe(
            audio_path,
            language="en",
            task="transcribe",
            beam_size=5,
            vad_filter=True
        )

        transcript_parts = []
        segment_details = []

        for segment in segments:

            transcript_parts.append(segment.text.strip())

            segment_details.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip()
            })

        transcript = " ".join(transcript_parts)

        return {
            "success": True,
            "language": info.language,
            "transcript": transcript,
            "duration_seconds": round(info.duration, 2),
            "segments": segment_details
        }
