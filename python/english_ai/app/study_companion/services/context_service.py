
class ContextService:

    @staticmethod
    def build_context(search_results):

        if not search_results:
            return ""

        context_parts = []
        seen_content = set()

        for result in search_results:

            page_number = result.get("page_number")
            content = result.get("content", "").strip()

            if not content:
                continue

            # Avoid adding identical chunks.
            normalized_content = " ".join(content.split()).lower()

            if normalized_content in seen_content:
                continue

            seen_content.add(normalized_content)

            context_parts.append(
                f"[Page {page_number}]\n{content}"
            )

        return "\n\n".join(context_parts)
