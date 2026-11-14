
import faiss
import numpy as np

from sentence_transformers import SentenceTransformer


class RetrievalService:

    MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
    MIN_SIMILARITY_SCORE = 0.35

    # Shared embedding model across all document sessions.
    _model = None

    def __init__(self):

        if RetrievalService._model is None:
            RetrievalService._model = SentenceTransformer(
                self.MODEL_NAME
            )

        self.model = RetrievalService._model

        self.index = None
        self.chunks = []

    # ==========================================
    # BUILD DOCUMENT SEARCH INDEX
    # ==========================================

    def build_index(self, chunks):

        if not chunks:
            raise ValueError("No document chunks available.")

        valid_chunks = [
            chunk for chunk in chunks
            if chunk.get("content", "").strip()
        ]

        if not valid_chunks:
            raise ValueError("No valid document content found.")

        texts = [
            chunk["content"]
            for chunk in valid_chunks
        ]

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        embeddings = np.ascontiguousarray(
            embeddings,
            dtype=np.float32
        )

        self.index = faiss.IndexFlatIP(
            embeddings.shape[1]
        )

        self.index.add(embeddings)

        self.chunks = valid_chunks

        return len(self.chunks)

    # ==========================================
    # SEARCH RELEVANT DOCUMENT CONTENT
    # ==========================================

    def search(self, question, top_k=5):

        if not question or not question.strip():
            raise ValueError("Search question cannot be empty.")

        if not isinstance(top_k, int) or top_k < 1:
            raise ValueError("top_k must be a positive integer.")

        if self.index is None:
            raise ValueError("Document search index is not ready.")

        query_embedding = self.model.encode(
            [question.strip()],
            convert_to_numpy=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )

        query_embedding = np.ascontiguousarray(
            query_embedding,
            dtype=np.float32
        )

        result_count = min(top_k, self.index.ntotal)

        scores, indices = self.index.search(
            query_embedding,
            result_count
        )

        results = []

        for score, index_position in zip(
            scores[0],
            indices[0]
        ):

            if index_position < 0:
                continue

            if score < self.MIN_SIMILARITY_SCORE:
                continue

            chunk = self.chunks[index_position]

            results.append({
                "page_number": chunk["page_number"],
                "content": chunk["content"],
                "score": float(score)
            })

        return results
