
import logging

import faiss
import numpy as np

from sentence_transformers import SentenceTransformer


logger = logging.getLogger(__name__)


class RetrievalService:

    MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

    MIN_SIMILARITY_SCORE = 0.35

    # Shared embedding model across document sessions.
    _model = None

    def __init__(self):

        if RetrievalService._model is None:

            logger.info(
                "Loading sentence transformer model: %s",
                self.MODEL_NAME
            )

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
            raise ValueError(
                "No document chunks available."
            )

        valid_chunks = [
            chunk
            for chunk in chunks
            if isinstance(chunk.get("content"), str)
            and chunk["content"].strip()
        ]

        if not valid_chunks:
            raise ValueError(
                "No valid document content found."
            )

        texts = [
            chunk["content"].strip()
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

        logger.info(
            "Document search index built successfully | Chunks: %s | Embedding dimensions: %s",
            len(self.chunks),
            embeddings.shape[1]
        )

        return len(self.chunks)

    # ==========================================
    # SEARCH RELEVANT DOCUMENT CONTENT
    # ==========================================

    def search(self, question, top_k=5):

        if not question or not question.strip():
            raise ValueError(
                "Search question cannot be empty."
            )

        if not isinstance(top_k, int) or isinstance(top_k, bool) or top_k < 1:
            raise ValueError(
                "top_k must be a positive integer."
            )

        if self.index is None or self.index.ntotal == 0:
            raise ValueError(
                "Document search index is not ready."
            )

        if len(self.chunks) != self.index.ntotal:
            raise RuntimeError(
                "Document chunks and search index are inconsistent."
            )

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

        result_count = min(
            top_k,
            self.index.ntotal
        )

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

            chunk = self.chunks[index_position]

            similarity_score = float(score)

            is_accepted = (
                similarity_score >= self.MIN_SIMILARITY_SCORE
            )

            # Diagnostic logging
            logger.info(
                "Retrieval result | Page: %s | Score: %.4f | Accepted: %s",
                chunk["page_number"],
                similarity_score,
                is_accepted
            )
# TEMPORARY DIAGNOSTIC: do not filter by similarity score.

            results.append({
                "page_number": chunk["page_number"],
                "content": chunk["content"],
                "score": similarity_score
            })

        print(
             f"RETRIEVAL | Page: {chunk['page_number']} "
            f"| Score: {similarity_score:.4f}"
        )

        return results
