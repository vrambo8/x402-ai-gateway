from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse, JSONResponse
from aiohttp import ClientSession
import json
import structlog
from datetime import datetime
from decimal import Decimal
from app.config import settings
from app.cost.token_counter import count_message_tokens, count_tokens
from app.cost.pricing_engine import PricingEngine
from app.monitoring.metrics import api_calls_total, cost_per_request, active_requests
from app.db.session import get_session
from app.db.models import APICall, Payment
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import time
from pathlib import Path

router = APIRouter()
logger = structlog.get_logger(__name__)

OPENAI_API_BASE = "https://api.openai.com"


async def call_openai(body: dict):
    async with ClientSession() as session:
        headers = {
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json"
        }
        async with session.post(
            f"{OPENAI_API_BASE}/v1/responses",
            json=body,
            headers=headers
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                logger.error("openai_request_failed", status=resp.status, error=error_text)

                raise HTTPException(status_code=resp.status, detail=error_text)

            response_data = await resp.json()

        return response_data

@router.post("/v1/responses")
async def proxy_chat_completions(
    request: Request,
    db: AsyncSession = Depends(get_session)
):
    """Proxy chat completions to OpenAI API with escrow and refund tracking"""
    active_requests.inc()
    start_time = time.time()

    try:
        # Parse request body
        body = await request.json()
        logger.info("proxy_request", body=body)

        # Forward to OpenAI or use mock response
        if settings.mock_openai:
            # Load mock response from sample_response.json
            logger.info("using_mock_openai_response")
            mock_file = Path(__file__).parents[2] / "sample_response.json"
            with open(mock_file, 'r') as f:
                response_data = json.load(f)
        else:
            response_data = await call_openai(body)
        
        logger.info(
            "proxy_response",
            data=response_data,
        )

        return JSONResponse(content=response_data)

    except Exception as e:
        logger.error("proxy_error", error=str(e))
        
        raise HTTPException(status_code=500, detail=str(e))

