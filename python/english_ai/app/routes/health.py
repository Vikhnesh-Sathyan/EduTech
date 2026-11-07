from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def home():
    return {
        "success": True,
        "message": "EduTech English AI Service is running"
    }


@router.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy"
    }