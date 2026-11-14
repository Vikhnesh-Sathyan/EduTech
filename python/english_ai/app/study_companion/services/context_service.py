
class ContextService:

    @staticmethod
    def build_context(search_results):

        if not search_results:
            return ""

        context_parts = []

        for result in search_results:

            page_number = result["page_number"]
            content = result["content"].strip()

            if not content:
                continue

            context_parts.append(
                f"[Page {page_number}]\n{content}"
            )

        return "\n\n".join(context_parts)
