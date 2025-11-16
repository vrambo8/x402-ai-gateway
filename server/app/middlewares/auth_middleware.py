from decimal import Decimal
import json
import os
import base64
from fastapi import Request
from fastapi.responses import JSONResponse
import structlog
from app.payment.x402 import PaymentRequiredException, create_exact_payment_requirements, settle_payment, verify_payment
from app.config import settings

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from x402.common import process_price_to_atomic_amount, x402_VERSION
from x402.exact import decode_payment
from x402.facilitator import FacilitatorClient, FacilitatorConfig
from x402.encoding import safe_base64_encode
from x402.common import find_matching_payment_requirements
from x402.types import (
    PaymentPayload,
    PaymentRequirements,
    Price,
    SupportedNetworks,
    TokenAmount,
    TokenAsset,
    EIP712Domain,
    x402PaymentRequiredResponse,
    SettleResponse,
)

from app.cost.pricing_engine import PricingEngine
from app.cost.token_counter import count_message_tokens, count_tokens


logger = structlog.get_logger(__name__)
pricing_engine = PricingEngine()

def settle_response_header(response: SettleResponse) -> str:
    """
    Creates a settlement response header.

    This is the Python equivalent of the TypeScript settleResponseHeader function.
    It base64 encodes the settlement response for use in the X-PAYMENT-RESPONSE header.

    Args:
        response: The settlement response from the facilitator

    Returns:
        A base64 encoded string containing the settlement response
    """
    return safe_base64_encode(response.model_dump_json(by_alias=True))


def parse_request_body(body: dict) -> tuple[str, list, int]:
    """
    Extract model, input data, and max tokens from request body.

    Args:
        body: The parsed request body

    Returns:
        Tuple of (model, input_data, max_tokens)
    """
    model = body.get("model", "gpt-3.5-turbo")
    input_data = body.get("input", [])
    max_tokens = body.get("max_output_tokens", 1000)
    return model, input_data, max_tokens


async def parse_response_body(response) -> dict:
    """
    Extract usage data from StreamingResponse.

    Args:
        response: The StreamingResponse object from middleware

    Returns:
        Tuple of (usage dict, response body bytes)
    """
    # Collect response body chunks
    body_bytes = b""
    async for chunk in response.body_iterator:
        body_bytes += chunk

    # Parse JSON to get usage data
    response_body = json.loads(body_bytes.decode())
    usage = response_body.get("usage", {})

    return usage, body_bytes


def estimate_cost(body: dict) -> tuple[Decimal, str, int]:
    """
    Estimate the cost for a request.

    Args:
        body: The parsed request body

    Returns:
        Tuple of (estimated_cost, model, input_tokens)
    """
    model, input_data, max_tokens = parse_request_body(body)

    # Count input tokens
    input_tokens = count_tokens(input_data, model)

    # Estimate cost (this is the escrow amount)
    estimated_cost = pricing_engine.estimate_cost(model, input_tokens, max_tokens)

    return estimated_cost, model, input_tokens


async def calculate_refund(response, estimated_cost: Decimal, model: str, input_tokens: int) -> tuple[Decimal, bytes]:
    """
    Calculate refund based on actual vs estimated costs.

    Args:
        response: The StreamingResponse object from the upstream service
        estimated_cost: The estimated cost that was charged
        model: The model used for the request
        input_tokens: The actual input tokens counted

    Returns:
        Tuple of (refund_amount, response_body_bytes)
    """
    try:
        # Parse response body to get output tokens
        usage, body_bytes = await parse_response_body(response)
        output_tokens = usage.get("completion_tokens", 0)

        # Calculate actual cost and refund
        actual_cost = pricing_engine.calculate_actual_cost(
            model, input_tokens, output_tokens
        )
        refund_amount = pricing_engine.calculate_refund(estimated_cost, actual_cost)
        diff_percentage =  ((estimated_cost - actual_cost) / actual_cost) * 100

        if refund_amount > Decimal("0.01"):
            message = "Refund Needed"
        else:
            message = "No Refund Needed"
            
        logger.info(
            message,
            refund_amount=refund_amount,
            estimated_cost=estimated_cost,
            actual_cost=actual_cost,
            diff_percentage=diff_percentage
        )

        return refund_amount, body_bytes

    except Exception as e:
        logger.error("Error calculating refund", error=str(e))
        return Decimal("0"), b""


async def verify_x402_payment(request: Request, call_next):
    """Middleware to verify x402 payments"""

    # Only protect POST requests to `/v1/*` endpoints
    if request.method != "POST" or not request.url.path.startswith("/v1/"):
        return await call_next(request)

    # Parse request body once
    body = await request.json()

    # Estimate cost and get request metadata
    estimated_cost, model, input_tokens = estimate_cost(body)

    payment_requirements = [
        create_exact_payment_requirements(
            price=f"${estimated_cost}",
            network="base-sepolia",
            resource=str(request.url),
            description="Access to weather data",
        )
    ]

    try:
        decoded_payment = await verify_payment(request, payment_requirements)

        settle_response = await settle_payment(decoded_payment, payment_requirements[0])
        logger.info(settle_response)

        response_header = settle_response_header(settle_response)

    except PaymentRequiredException as e:
        return JSONResponse(
            status_code=402,
            content=e.error_data,
            headers={"Content-Type": "application/json"},
        )

    # Call next middleware/route
    try:
        response = await call_next(request)
    except Exception as e:
       raise e

    # Calculate and log refund (this consumes the response body)
    _, body_bytes = await calculate_refund(response, estimated_cost, model, input_tokens)

    # Recreate response with the consumed body and add payment header
    return Response(
        content=body_bytes,
        status_code=response.status_code,
        headers={
            **dict(response.headers),
            "X-PAYMENT-RESPONSE": response_header
        },
        media_type=response.media_type
    )
    
    
    

        

    