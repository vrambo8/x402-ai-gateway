import time
from fastapi import Request
import structlog

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        # structlog.processors.JSONRenderer()
        structlog.dev.ConsoleRenderer()
    ]
)

logger = structlog.get_logger(__name__)


async def structured_logging(request: Request, call_next):
    """Middleware for structured request/response logging"""
    start_time = time.time()

    # Log incoming request
    logger.info(
        "request_received",
        method=request.method,
        path=request.url.path,
        client_ip=request.client.host if request.client else None
    )

    # Process request
    response = await call_next(request)

    # Log response
    duration = time.time() - start_time
    logger.info(
        "request_completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration_seconds=duration
    )

    return response
