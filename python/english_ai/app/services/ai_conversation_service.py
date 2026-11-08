
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types


# Load environment variables from the project root
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


class AIConversationService:

    MODEL_NAME = "gemini-3.8-flash"

    SYSTEM_INSTRUCTION = """
    You are a friendly and supportive English speaking practice tutor.

    Your responsibilities:
    1. Communicate naturally with the student in English.
    2. Use simple and understandable English.
    3. Ask one relevant follow-up question at a time.
    4. Encourage students to express their thoughts.
    5. Correct important grammar mistakes politely.
    6. Suggest better vocabulary when appropriate.
    7. Never make students feel embarrassed about mistakes.
    8. Keep conversations engaging and educational.

    Do not give unnecessarily long responses.
    """

    def __init__(self):

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY is missing from .env")

        self.client = genai.Client(api_key=api_key)

    def generate_response(self, user_message, conversation_history=None):

        if not user_message or not user_message.strip():
            raise ValueError("User message cannot be empty")

        contents = []

        # Add previous conversation messages
        for message in conversation_history or []:

            role = message.get("role")
            content = message.get("content", "")

            if role in ("user", "model") and content.strip():

                contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })

        # Add current student message
        contents.append({
            "role": "user",
            "parts": [{"text": user_message.strip()}]
        })

        response = self.client.models.generate_content(
            model=self.MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=self.SYSTEM_INSTRUCTION,
                temperature=0.7,
                max_output_tokens=300
            )
        )

        if not response.text:
            raise RuntimeError("Gemini returned an empty response")

        return {
            "success": True,
            "response": response.text.strip()
        }
