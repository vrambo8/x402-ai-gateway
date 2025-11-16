from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy"
        }
    )


@router.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "x402 AI Gateway",
        "version": "0.1.0",
        "status": "running"
    }
