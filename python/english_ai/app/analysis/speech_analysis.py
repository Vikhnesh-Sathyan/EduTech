
import re
from collections import Counter


class SpeechAnalysisService:

    FILLER_WORDS = [
        "um", "uh", "erm", "actually",
        "basically", "literally", "like",
        "well", "you know", "i mean",
        "kind of", "sort of"
    ]

    PAUSE_THRESHOLD = 0.5
    LONG_PAUSE_THRESHOLD = 2.0

    def analyze_speech(self, transcript, duration_seconds, segments=None):

        text = transcript.lower()

        words = re.findall(r"\b[\w']+\b", text)
        total_words = len(words)

        filler_counts = {}

        for filler in self.FILLER_WORDS:

            pattern = r"\b" + re.escape(filler) + r"\b"
            count = len(re.findall(pattern, text))

            if count:
                filler_counts[filler] = count

        total_filler_words = sum(filler_counts.values())

        repeated_words = []

        for index in range(1, len(words)):

            if words[index] == words[index - 1]:
                repeated_words.append(words[index])

        repetition_counts = dict(Counter(repeated_words))
        total_repetitions = len(repeated_words)

        duration_seconds = max(0, float(duration_seconds))
        duration_minutes = duration_seconds / 60

        words_per_minute = (
            round(total_words / duration_minutes, 2)
            if duration_minutes > 0 else 0
        )

        filler_percentage = (
            round(total_filler_words / total_words * 100, 2)
            if total_words else 0
        )

        repetition_percentage = (
            round(total_repetitions / total_words * 100, 2)
            if total_words else 0
        )

        pauses = []

        sorted_segments = sorted(
            segments or [],
            key=lambda segment: segment["start"]
        )

        for index in range(1, len(sorted_segments)):

            previous = sorted_segments[index - 1]
            current = sorted_segments[index]

            gap = current["start"] - previous["end"]

            if gap >= self.PAUSE_THRESHOLD:

                pauses.append({
                    "start": round(previous["end"], 2),
                    "end": round(current["start"], 2),
                    "duration": round(gap, 2),
                    "is_long_pause": gap >= self.LONG_PAUSE_THRESHOLD
                })

        return {
            "total_words": total_words,
            "duration_seconds": round(duration_seconds, 2),
            "words_per_minute": words_per_minute,
            "filler_word_count": total_filler_words,
            "filler_percentage": filler_percentage,
            "filler_words": filler_counts,
            "repetition_count": total_repetitions,
            "repetition_percentage": repetition_percentage,
            "repeated_words": repetition_counts,
            "pause_count": len(pauses),
            "long_pause_count": sum(
                1 for pause in pauses if pause["is_long_pause"]
            ),
            "total_pause_duration": round(
                sum(pause["duration"] for pause in pauses), 2
            ),
            "pauses": pauses
        }
