from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.topic_service import TopicService


router = APIRouter(
    prefix="/api/topics",
    tags=["Topic Speaking"]
)

topic_service = TopicService()


class TopicRequest(BaseModel):

    available_topics: list[dict] = Field(default_factory=list)

    category: str | None = None

    difficulty: str | None = None


@router.post("/random")
async def get_random_topic(request: TopicRequest):

    try:

        return topic_service.generate_topic(
            available_topics=request.available_topics,
            category=request.category,
            difficulty=request.difficulty
        )

    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Topic generation failed: {str(error)}"
        )
