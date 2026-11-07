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
            beam_size=5
        )

        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        )

        return {
            "success": True,
            "language": info.language,
            "transcript": transcript
        }