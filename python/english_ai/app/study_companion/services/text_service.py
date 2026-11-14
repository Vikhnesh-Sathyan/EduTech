
class TextService:

    @staticmethod
    def validate_text(text):

        if not isinstance(text, str) or not text.strip():
            raise ValueError("Text content cannot be empty.")

        cleaned_text = text.strip()

        if len(cleaned_text) < 50:
            raise ValueError(
                "Please provide at least 50 characters."
            )

        return cleaned_text

    @staticmethod
    def prepare_pages(pages):

        if not pages:
            raise ValueError("No document content available.")

        prepared_pages = []

        for page in pages:

            content = page.get("content", "").strip()

            if content:

                prepared_pages.append({
                    "page_number": page["page_number"],
                    "content": content
                })

        if not prepared_pages:
            raise ValueError("No readable text available.")

        return prepared_pages

    @staticmethod
    def get_selected_pages(pages, start_page, end_page):

        if (
            not isinstance(start_page, int)
            or not isinstance(end_page, int)
            or start_page < 1
            or end_page < start_page
        ):
            raise ValueError("Invalid page range.")

        total_pages = max(
            page["page_number"] for page in pages
        )

        if end_page > total_pages:
            raise ValueError(
                "Selected page range exceeds document pages."
            )

        selected_pages = [
            page for page in pages
            if start_page <= page["page_number"] <= end_page
        ]

        if not selected_pages:
            raise ValueError(
                "No content found in the selected pages."
            )

        return selected_pages
