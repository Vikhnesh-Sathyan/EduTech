
from .chunk_service import ChunkService


class SummaryService:

    BATCH_SIZE = 5

    def __init__(self, ai_service):

        self.ai_service = ai_service

    # ==========================================
    # GENERATE DOCUMENT SUMMARY
    # ==========================================

    def generate_summary(self, pages, summary_type="medium"):

        if not pages:
            raise ValueError("No document content available.")

        if summary_type not in ["short", "medium", "detailed"]:
            raise ValueError("Invalid summary type.")

        chunks = self._get_chunks(pages)

        partial_summaries = []

        for batch in self._get_batches(chunks):

            batch_text = "\n\n".join(
                f"Page {chunk['page_number']}:\n{chunk['content']}"
                for chunk in batch
            )

            partial_summary = self.ai_service.generate_summary(
                batch_text,
                summary_type="medium"
            )

            partial_summaries.append(partial_summary)

        combined_summary = "\n\n".join(partial_summaries)

        return self.ai_service.generate_summary(
            combined_summary,
            summary_type=summary_type
        )

    # ==========================================
    # EXTRACT IMPORTANT STUDY POINTS
    # ==========================================

    def generate_important_points(self, pages):

        if not pages:
            raise ValueError("No document content available.")

        chunks = self._get_chunks(pages)

        partial_points = []

        for batch in self._get_batches(chunks):

            batch_text = "\n\n".join(
                f"Page {chunk['page_number']}:\n{chunk['content']}"
                for chunk in batch
            )

            points = self.ai_service.generate_important_points(
                batch_text
            )

            partial_points.append(points)

        return "\n\n".join(partial_points)

    # ==========================================
    # VALIDATE AND CREATE CHUNKS
    # ==========================================

    def _get_chunks(self, pages):

        if self.BATCH_SIZE <= 0:
            raise ValueError("Batch size must be positive.")

        chunks = ChunkService.create_chunks(pages)

        if not chunks:
            raise ValueError("No readable document content.")

        return chunks

    # ==========================================
    # SPLIT CHUNKS INTO BATCHES
    # ==========================================

    def _get_batches(self, chunks):

        for start in range(0, len(chunks), self.BATCH_SIZE):

            yield chunks[start:start + self.BATCH_SIZE]
