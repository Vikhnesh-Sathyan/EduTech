
import re


class ChunkService:

    CHUNK_SIZE = 3000
    CHUNK_OVERLAP = 300

    @classmethod
    def create_chunks(cls, pages):

        if not pages:
            raise ValueError(
                "No document pages available."
            )

        if cls.CHUNK_SIZE <= 0:
            raise ValueError(
                "Chunk size must be positive."
            )

        if cls.CHUNK_OVERLAP < 0:
            raise ValueError(
                "Chunk overlap cannot be negative."
            )

        if cls.CHUNK_OVERLAP >= cls.CHUNK_SIZE:
            raise ValueError(
                "Chunk overlap must be smaller than chunk size."
            )

        chunks = []

        for page in pages:

            page_number = page.get("page_number")
            content = page.get("content", "")

            if not isinstance(content, str):
                continue

            content = content.strip()

            if not content:
                continue

            page_chunks = cls._split_content(content)

            for chunk_text in page_chunks:

                chunks.append({
                    "page_number": page_number,
                    "content": chunk_text
                })

        if not chunks:
            raise ValueError(
                "No valid document chunks could be created."
            )

        return chunks

    # ==========================================
    # SPLIT CONTENT INTO OVERLAPPING CHUNKS
    # ==========================================

    @classmethod
    def _split_content(cls, content):

        chunks = []

        start = 0
        content_length = len(content)

        while start < content_length:

            end = min(
                start + cls.CHUNK_SIZE,
                content_length
            )

            # Prefer ending at a paragraph or sentence boundary.
            if end < content_length:

                minimum_end = start + int(
                    cls.CHUNK_SIZE * 0.7
                )

                boundary = max(
                    content.rfind("\n\n", minimum_end, end),
                    content.rfind("\n", minimum_end, end),
                    content.rfind(". ", minimum_end, end),
                    content.rfind("; ", minimum_end, end)
                )

                if boundary > start:
                    end = boundary + 1

            chunk_text = content[start:end].strip()

            if chunk_text:
                chunks.append(chunk_text)

            if end >= content_length:
                break

            next_start = end - cls.CHUNK_OVERLAP

            # Avoid repeatedly selecting the same position.
            if next_start <= start:
                next_start = end

            start = next_start

        return chunks
