
import os
import hmac
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Header, HTTPException


# Load the existing project .env file.
ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_PATH)


async def verify_internal_request(
    x_internal_secret: str = Header(default="")
):

    expected_secret = os.getenv(
        "STUDY_COMPANION_INTERNAL_SECRET"
    )

    if not expected_secret:
        raise HTTPException(
            status_code=503,
            detail="Internal authentication is not configured."
        )

    if not hmac.compare_digest(
        x_internal_secret,
        expected_secret
    ):
        raise HTTPException(
            status_code=403,
            detail="Internal access denied."
        )
