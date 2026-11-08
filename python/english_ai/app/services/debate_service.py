
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


class DebateService:

    MODEL_NAME = "gemini-3.8-flash"

    SYSTEM_INSTRUCTION = """
    You are an intelligent English debate opponent.

    Your responsibilities:

    1. Debate respectfully with the student.
    2. Take the opposite position from the student.
    3. Give logical counterarguments.
    4. Ask challenging but understandable questions.
    5. Encourage critical thinking.
    6. Use clear and natural English.
    7. Keep responses concise.
    8. Never insult or discourage the student.
    9. Do not simply agree with every argument.
    10. Stay focused on the debate topic.

    You are participating in an educational English debate.
    """

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing from .env")

        self.client = genai.Client(api_key=api_key)

    def generate_opponent_response(
        self,
        topic,
        student_position,
        student_argument,
        conversation_history=None
    ):

        if not topic or not topic.strip():
            raise ValueError("Debate topic cannot be empty")

        if student_position not in ["for", "against"]:
            raise ValueError("Position must be 'for' or 'against'")

        if not student_argument or not student_argument.strip():
            raise ValueError("Student argument cannot be empty")

        ai_position = (
            "against" if student_position == "for" else "for"
        )

        contents = []

        for message in conversation_history or []:

            role = message.get("role")
            content = message.get("content", "")

            if role in ["user", "model"] and content.strip():

                contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })

        contents.append({
            "role": "user",
            "parts": [{
                "text": f"""
                Debate topic: {topic}

                Student's position: {student_position}

                Your position: {ai_position}

                Student's argument:
                {student_argument}

                Respond as the opposing debater.
                Give one strong counterargument and ask
                one follow-up question.
                """
            }]
        })

        response = self.client.models.generate_content(
            model=self.MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=self.SYSTEM_INSTRUCTION,
                temperature=0.7,
                max_output_tokens=350
            )
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty response")

        return {
            "success": True,
            "ai_position": ai_position,
            "response": response.text.strip()
        }
