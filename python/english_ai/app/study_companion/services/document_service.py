
from .pdf_service import PDFService
from .text_service import TextService
from .chunk_service import ChunkService
from .retrieval_service import RetrievalService
from .context_service import ContextService
from .ai_service import StudyCompanionAIService
from .summary_service import SummaryService


class StudyDocumentService:

    def __init__(self):

        self.pages = []
        self.chunks = []

        # One AI service shared by summary and Q&A.
        self.ai_service = StudyCompanionAIService()

        self.retrieval_service = RetrievalService()

        self.summary_service = SummaryService(
            self.ai_service
        )

        self.document_loaded = False

    # ==========================================
    # LOAD PDF DOCUMENT
    # ==========================================

    def load_pdf(self, file_path):

        pages = PDFService.extract_pages(file_path)

        self.pages = TextService.prepare_pages(pages)

        self._prepare_document()

        return {
            "success": True,
            "total_pages": len(self.pages),
            "message": "PDF processed successfully."
        }

    # ==========================================
    # LOAD DIRECT TEXT
    # ==========================================

    def load_text(self, text):

        cleaned_text = TextService.validate_text(text)

        self.pages = [{
            "page_number": 1,
            "content": cleaned_text
        }]

        self._prepare_document()

        return {
            "success": True,
            "total_pages": 1,
            "message": "Text processed successfully."
        }

    # ==========================================
    # PREPARE DOCUMENT
    # ==========================================

    def _prepare_document(self):

        self.chunks = ChunkService.create_chunks(self.pages)

        if not self.chunks:
            raise ValueError("No readable document content.")

        self.retrieval_service.build_index(self.chunks)

        self.document_loaded = True

    # ==========================================
    # GENERATE SUMMARY
    # ==========================================

    def generate_summary(self, summary_type="medium"):

        self._check_document()

        return self.summary_service.generate_summary(
            self.pages,
            summary_type
        )

    # ==========================================
    # SUMMARIZE SELECTED PAGES
    # ==========================================

    def summarize_page_range(
        self,
        start_page,
        end_page,
        summary_type="medium"
    ):

        self._check_document()

        selected_pages = TextService.get_selected_pages(
            self.pages,
            start_page,
            end_page
        )

        return self.summary_service.generate_summary(
            selected_pages,
            summary_type
        )

    # ==========================================
    # GENERATE IMPORTANT POINTS
    # ==========================================

    def generate_important_points(self):

        self._check_document()

        return self.summary_service.generate_important_points(
            self.pages
        )

    # ==========================================
    # ASK DOCUMENT QUESTION
    # ==========================================

    def ask_question(self, question):

        self._check_document()

        if not question or not question.strip():
            raise ValueError("Please enter a question.")

        search_results = self.retrieval_service.search(
            question,
            top_k=5
        )

        if not search_results:
            return {
                "success": True,
                "answer": "This information is not available in the uploaded document.",
                "sources": []
            }

        context = ContextService.build_context(search_results)

        answer = self.ai_service.answer_question(
            question,
            context
        )

        return {
            "success": True,
            "answer": answer,
            "sources": [
                {
                    "page_number": result["page_number"],
                    "score": result["score"]
                }
                for result in search_results
            ]
        }

    # ==========================================
    # CHECK DOCUMENT STATUS
    # ==========================================

    def _check_document(self):

        if not self.document_loaded:
            raise ValueError("Please load a document first.")
