
import random


class TopicService:

    def generate_topic(
        self,
        available_topics,
        category=None,
        difficulty=None
    ):

        if not available_topics:
            raise ValueError("No speaking topics are available")

        filtered_topics = available_topics

        # Filter by category
        if category:
            filtered_topics = [
                topic for topic in filtered_topics
                if topic.get("category") == category
            ]

        # Filter by difficulty
        if difficulty:
            filtered_topics = [
                topic for topic in filtered_topics
                if topic.get("difficulty") == difficulty
            ]

        if not filtered_topics:
            raise ValueError(
                "No topics found for the selected filters"
            )

        selected_topic = random.choice(filtered_topics)

        return {
            "success": True,
            "topic": selected_topic
        }
