
class ChunkService:

    CHUNK_SIZE = 3000
    CHUNK_OVERLAP = 300

    @classmethod
    def create_chunks(cls, pages):

        if cls.CHUNK_SIZE <= 0:
            raise ValueError("Chunk size must be positive.")

        if cls.CHUNK_OVERLAP < 0:
            raise ValueError("Chunk overlap cannot be negative.")

        if cls.CHUNK_OVERLAP >= cls.CHUNK_SIZE:
            raise ValueError("Chunk overlap must be smaller than chunk size.")

        chunks = []

        for page in pages:

            page_number = page["page_number"]
            content = page["content"].strip()

            if not content:
                continue

            start = 0

            while start < len(content):

                end = start + cls.CHUNK_SIZE

                chunk_text = content[start:end].strip()

                if chunk_text:

                    chunks.append({
                        "page_number": page_number,
                        "content": chunk_text
                    })

                if end >= len(content):
                    break

                start = end - cls.CHUNK_OVERLAP

        return chunks
