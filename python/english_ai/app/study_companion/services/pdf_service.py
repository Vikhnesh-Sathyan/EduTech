
import pymupdf


class PDFService:

    @staticmethod
    def extract_pages(file_path):

        try:

            with pymupdf.open(file_path) as document:

                if document.is_encrypted:
                    raise ValueError(
                        "Password-protected PDFs are not supported."
                    )

                if len(document) == 0:
                    raise ValueError(
                        "The PDF contains no pages."
                    )

                pages = []

                for page_number, page in enumerate(
                    document,
                    start=1
                ):

                    page_text = page.get_text("text").strip()

                    pages.append({
                        "page_number": page_number,
                        "content": page_text
                    })

            if not any(page["content"] for page in pages):
                raise ValueError(
                    "No readable text found in this PDF."
                )

            return pages

        except ValueError:
            raise

        except Exception as error:
            raise RuntimeError(
                "Unable to read the uploaded PDF."
            ) from error
