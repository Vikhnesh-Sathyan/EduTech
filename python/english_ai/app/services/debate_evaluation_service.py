
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


class DebateEvaluationService:

    MODEL_NAME = "gemini-3.8-flash"

    SYSTEM_INSTRUCTION = """
    You are an English debate performance evaluator.

    Evaluate the student's debate performance based on
    their arguments and the debate topic.

    Score these areas from 0 to 10:

    1. Argument quality
    2. Topic relevance
    3. Grammar
    4. Vocabulary
    5. Critical thinking

    Provide:
    - Overall score out of 10.
    - Strengths.
    - Areas to improve.
    - Specific suggestions.
    - A short encouraging summary.

    Be fair and constructive.
    Do not invent mistakes.
    Return valid JSON only.

    Use this structure:

    {
        "scores": {
            "argument_quality": 0,
            "topic_relevance": 0,
            "grammar": 0,
            "vocabulary": 0,
            "critical_thinking": 0
        },
        "overall_score": 0,
        "strengths": [],
        "improvements": [],
        "suggestions": [],
        "summary": ""
    }
    """

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing from .env")

        self.client = genai.Client(api_key=api_key)

    def evaluate_debate(self, topic, student_arguments):

        if not topic or not topic.strip():
            raise ValueError("Debate topic cannot be empty")

        if not student_arguments:
            raise ValueError("Debate arguments cannot be empty")

        arguments_text = "\n".join(
            f"Round {index + 1}: {argument}"
            for index, argument in enumerate(student_arguments)
        )

        prompt = f"""
        Debate topic:
        {topic}

        Student's debate arguments:
        {arguments_text}

        Evaluate the student's overall debate performance.
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
