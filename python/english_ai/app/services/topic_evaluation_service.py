
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


class TopicEvaluationService:

    MODEL_NAME = "gemini-3.8-flash"

    SYSTEM_INSTRUCTION = """
    You are an English speaking evaluation assistant.

    Evaluate the student's spoken answer based on its transcript.

    Evaluate these four areas:
    1. Topic relevance
    2. Grammar
    3. Vocabulary
    4. Clarity

    Give each area a score from 0 to 10.

    Be fair and encouraging.
    Do not invent mistakes that are not present.
    Do not penalize a student simply for giving a short answer.
    Consider the topic before evaluating relevance.

    Return valid JSON only, using this structure:

    {
        "scores": {
            "topic_relevance": 0,
            "grammar": 0,
            "vocabulary": 0,
            "clarity": 0
        },
        "overall_score": 0,
        "strengths": [],
        "improvements": [],
        "grammar_corrections": [],
        "suggestion": ""
    }

    Keep feedback simple and useful.
    """

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing from .env")

        self.client = genai.Client(api_key=api_key)

    def evaluate_answer(self, topic, transcript):

        if not topic or not topic.strip():
            raise ValueError("Topic cannot be empty")

        if not transcript or not transcript.strip():
            raise ValueError("Student answer cannot be empty")

        prompt = f"""
        Speaking topic:
        {topic}

        Student's spoken answer:
        {transcript}

        Evaluate this answer using the evaluation criteria.
        """

        response = self.client.models.generate_content(
            model=self.MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=self.SYSTEM_INSTRUCTION,
                temperature=0.3,
                response_mime_type="application/json"
            )
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty evaluation")

        evaluation = json.loads(response.text)

        return {
            "success": True,
            "evaluation": evaluation
        }
