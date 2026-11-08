
from collections import Counter


class ProgressReportService:

    def generate_report(self, sessions):

        if not isinstance(sessions, list):
            raise ValueError("Sessions must be a list")

        total_sessions = 0

        total_words = 0
        total_filler_words = 0
        total_repetitions = 0
        total_pauses = 0
        total_long_pauses = 0

        total_wpm = 0
        wpm_session_count = 0

        feature_counts = Counter()
        evaluation_totals = Counter()
        evaluation_counts = Counter()

        for session in sessions:

            if not isinstance(session, dict):
                continue

            total_sessions += 1

            feature = session.get("feature", "unknown")
            feature_counts[feature] += 1

            # Speech analysis
            analysis = session.get("analysis") or {}

            total_words += analysis.get("total_words", 0)
            total_filler_words += analysis.get("filler_word_count", 0)
            total_repetitions += analysis.get("repetition_count", 0)
            total_pauses += analysis.get("pause_count", 0)
            total_long_pauses += analysis.get("long_pause_count", 0)

            wpm = analysis.get("words_per_minute")

            if isinstance(wpm, (int, float)):
                total_wpm += wpm
                wpm_session_count += 1

            # Evaluation scores
            evaluation = session.get("evaluation") or {}

            # Support both direct and wrapped evaluation responses
            scores = (
                evaluation.get("evaluation", {}).get("scores")
                or evaluation.get("scores")
                or {}
            )

            for metric, score in scores.items():

                if isinstance(score, (int, float)):
                    evaluation_totals[metric] += score
                    evaluation_counts[metric] += 1

        # Average speaking speed across sessions
        average_wpm = (
            round(total_wpm / wpm_session_count, 2)
            if wpm_session_count else 0
        )

        # Average evaluation scores
        average_scores = {}

        for metric, total in evaluation_totals.items():

            average_scores[metric] = round(
                total / evaluation_counts[metric], 2
            )

        return {
            "success": True,
            "report": {
                "total_sessions": total_sessions,
                "total_words": total_words,
                "average_wpm": average_wpm,
                "total_filler_words": total_filler_words,
                "total_repetitions": total_repetitions,
                "total_pauses": total_pauses,
                "total_long_pauses": total_long_pauses,
                "average_evaluation_scores": average_scores,
                "feature_statistics": dict(feature_counts)
            }
        }
