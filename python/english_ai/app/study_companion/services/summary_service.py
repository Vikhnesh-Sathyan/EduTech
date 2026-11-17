
import logging
import time

from .chunk_service import ChunkService


logger = logging.getLogger(__name__)


class SummaryService:

    BATCH_SIZE = 5

    def __init__(self, ai_service):

        self.ai_service = ai_service

    # ==========================================
    # GENERATE DOCUMENT SUMMARY
    # ==========================================

    def generate_summary(
        self,
        pages,
        summary_type="medium"
    ):

        if not pages:
            raise ValueError(
                "No document content available."
            )

        if summary_type not in [
            "short",
            "medium",
            "detailed"
        ]:
            raise ValueError(
                "Invalid summary type."
            )

        chunks = self._get_chunks(pages)

        batches = list(self._get_batches(chunks))

        logger.info(
            "Starting summary generation: %s chunks, %s batches.",
            len(chunks),
            len(batches)
        )

        partial_summaries = []

        # Generate one summary for each batch.
        for batch_index, batch in enumerate(batches, start=1):

            batch_text = "\n\n".join(
                f"Page {chunk['page_number']}:\n{chunk['content']}"
                for chunk in batch
            )

            start_time = time.monotonic()

            logger.info(
                "Generating summary for batch %s/%s.",
                batch_index,
                len(batches)
            )

            try:

                partial_summary = self.ai_service.generate_summary(
                    batch_text,
                    summary_type="medium"
                )

                if not partial_summary:
                    raise RuntimeError(
                        f"Empty summary returned for batch {batch_index}."
                    )

                partial_summaries.append(partial_summary)

                logger.info(
                    "Summary batch %s/%s completed in %.2f seconds.",
                    batch_index,
                    len(batches),
                    time.monotonic() - start_time
                )

            except Exception:

                logger.exception(
                    "Summary generation failed for batch %s/%s.",
                    batch_index,
                    len(batches)
                )

                raise

        # Combine all partial summaries.
        combined_summary = "\n\n".join(partial_summaries)

        logger.info(
            "Generating final combined summary."
        )

        final_start_time = time.monotonic()

        final_summary = self.ai_service.generate_summary(
            combined_summary,
            summary_type=summary_type
        )

        logger.info(
            "Final summary completed in %.2f seconds.",
            time.monotonic() - final_start_time
        )

        return final_summary

    # ==========================================
    # EXTRACT IMPORTANT STUDY POINTS
    # ==========================================

    def generate_important_points(self, pages):

        if not pages:
            raise ValueError(
                "No document content available."
            )

        chunks = self._get_chunks(pages)

        batches = list(self._get_batches(chunks))

        logger.info(
            "Starting important points generation: %s chunks, %s batches.",
            len(chunks),
            len(batches)
        )

        all_points = []

        for batch_index, batch in enumerate(batches, start=1):

            batch_text = "\n\n".join(
                f"Page {chunk['page_number']}:\n{chunk['content']}"
                for chunk in batch
            )

            start_time = time.monotonic()

            logger.info(
                "Generating important points for batch %s/%s.",
                batch_index,
                len(batches)
            )

            try:

                points = self.ai_service.generate_important_points(
                    batch_text
                )

                if not isinstance(points, list):
                    raise ValueError(
                        "Invalid important points response."
                    )

                all_points.extend(points)

                logger.info(
                    "Important points batch %s/%s completed in %.2f seconds. "
                    "Points generated: %s.",
                    batch_index,
                    len(batches),
                    time.monotonic() - start_time,
                    len(points)
                )

            except Exception:

                logger.exception(
                    "Important points generation failed for batch %s/%s.",
                    batch_index,
                    len(batches)
                )

                raise

        logger.info(
            "Important points generation completed. Total points: %s.",
            len(all_points)
        )

        return all_points

    # ==========================================
    # VALIDATE AND CREATE CHUNKS
    # ==========================================

    def _get_chunks(self, pages):

        if self.BATCH_SIZE <= 0:
            raise ValueError(
                "Batch size must be positive."
            )

        chunks = ChunkService.create_chunks(pages)

        if not chunks:
            raise ValueError(
                "No readable document content."
            )

        return chunks

    # ==========================================
    # SPLIT CHUNKS INTO BATCHES
    # ==========================================

    def _get_batches(self, chunks):

        for start in range(0, len(chunks), self.BATCH_SIZE):

            yield chunks[start:start + self.BATCH_SIZE]
