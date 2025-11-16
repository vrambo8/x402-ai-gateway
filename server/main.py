from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import proxy, health
from app.middlewares import logging_middleware, auth_middleware
from app.logging import setup_logging
from app.payment.x402 import PaymentRequiredException

# Setup logging first
setup_logging()

app = FastAPI(
    title="x402 AI Gateway",
    description="Minimal OpenAI proxy with x402 cryptocurrency payments",
    version="0.1.0"
)

@app.exception_handler(PaymentRequiredException)
async def payment_required_handler(request: Request, exc: PaymentRequiredException):
    """Handle payment required exceptions with proper 402 responses"""
    return JSONResponse(
        status_code=402,
        content=exc.error_data,
        headers={"Content-Type": "application/json"},
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Middleware (order matters!)
app.middleware("http")(logging_middleware.structured_logging)
app.middleware("http")(auth_middleware.verify_x402_payment)

# Routes
app.include_router(health.router, tags=["health"])
app.include_router(proxy.router, tags=["proxy"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.api_host,
        port=settings.api_port,
        log_config=None
    )
