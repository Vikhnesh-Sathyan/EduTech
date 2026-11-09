
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from app.services.ai_conversation_service import AIConversationService


router = APIRouter(
    prefix="/api/conversation",
    tags=["AI Conversation"]
)


conversation_service = None


class ConversationRequest(BaseModel):

    message: str

    history: list[dict] = Field(default_factory=list)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value):

        if not value.strip():
            raise ValueError("Message cannot be empty")

        return value.strip()

    @field_validator("history")
    @classmethod
    def validate_history(cls, value):

        if len(value) > 30:
            raise ValueError("Conversation history cannot exceed 30 messages")

        for item in value:

            if not isinstance(item, dict):
                raise ValueError("Invalid conversation history")

            if item.get("role") not in ["user", "model"]:
                raise ValueError("Invalid conversation history role")

            content = item.get("content")

            if not isinstance(content, str) or not content.strip():
                raise ValueError("Invalid conversation history content")

        return value


@router.post("/chat")
async def chat_with_ai(request: ConversationRequest):

    global conversation_service

    try:

        if conversation_service is None:
            conversation_service = AIConversationService()

        result = conversation_service.generate_response(
            request.message,
            request.history
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"AI conversation failed: {str(error)}"
        )
