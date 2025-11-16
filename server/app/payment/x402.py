import json
import uuid
from typing import Optional
from aiohttp import ClientSession
from fastapi import Request
import structlog
from app.config import settings

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
import os

logger = structlog.get_logger(__name__)


facilitator_config: FacilitatorConfig = {"url": settings.x402_facilitator_url}
facilitator = FacilitatorClient(facilitator_config)


def create_exact_payment_requirements(
    price: Price,
    network: SupportedNetworks,
    resource: str,
    description: str = "",
    mime_type: str = "application/json",
    max_timeout_seconds: int = 60,
) -> PaymentRequirements:
    """
    Creates payment requirements for a given price and network.

    This handles both USD string prices (e.g., "$0.001") and TokenAmount objects.

    Args:
        price: The price to be paid for the resource (USD string or TokenAmount)
        network: The blockchain network to use for payment
        resource: The resource being accessed
        description: Optional description of the payment
        mime_type: MIME type of the resource
        max_timeout_seconds: Maximum timeout for the payment

    Returns:
        PaymentRequirements object

    Raises:
        ValueError: If price format is invalid
    """
    try:
        max_amount_required, asset_address, eip712_domain = (
            process_price_to_atomic_amount(price, network)
        )
    except Exception as e:
        raise ValueError(f"Invalid price: {price}. Error: {e}")

    return PaymentRequirements(
        scheme="exact",
        network=network,
        max_amount_required=max_amount_required,
        resource=resource,
        description=description,
        mime_type=mime_type,
        pay_to=str(settings.x402_wallet_address),
        max_timeout_seconds=max_timeout_seconds,
        asset=asset_address,
        output_schema=None,
        extra=eip712_domain,
    )

class PaymentRequiredException(Exception):
    """Custom exception for payment required responses"""

    def __init__(self, error_data: dict):
        self.error_data = error_data
        super().__init__(error_data.get("error", "Payment required"))


async def verify_payment(
    request: Request,
    payment_requirements: list[PaymentRequirements],
) -> PaymentPayload:
    """
    Verifies a payment and raises PaymentRequiredException if invalid.

    Args:
        request: The FastAPI request object
        payment_requirements: List of payment requirements to verify against

    Returns:
        True if payment is valid

    Raises:
        PaymentRequiredException: If payment is required or invalid
    """
    x_payment = request.headers.get("X-PAYMENT")
    if not x_payment:
        error_data = x402PaymentRequiredResponse(
            x402_version=x402_VERSION,
            error="X-PAYMENT header is required",
            accepts=payment_requirements,
        ).model_dump(by_alias=True)
        raise PaymentRequiredException(error_data)

    try:
        decoded_payment_dict = decode_payment(x_payment)
        decoded_payment_dict["x402Version"] = x402_VERSION
        decoded_payment = PaymentPayload(**decoded_payment_dict)
    except Exception as e:
        error_data = x402PaymentRequiredResponse(
            x402_version=x402_VERSION,
            error=str(e) or "Invalid or malformed payment header",
            accepts=payment_requirements,
        ).model_dump(by_alias=True)
        raise PaymentRequiredException(error_data)

    try:
        selected_payment_requirement = find_matching_payment_requirements(
            payment_requirements, decoded_payment
        ) or payment_requirements[0]
        verify_response = await facilitator.verify(
            decoded_payment, selected_payment_requirement
        )
        if not verify_response.is_valid:
            error_data = x402PaymentRequiredResponse(
                x402_version=x402_VERSION,
                error=verify_response.invalid_reason or "Payment verification failed",
                accepts=payment_requirements,
            ).model_dump(by_alias=True)
            raise PaymentRequiredException(error_data)
        
    except Exception as e:
        error_data = x402PaymentRequiredResponse(
            x402_version=x402_VERSION,
            error=str(e),
            accepts=payment_requirements,
        ).model_dump(by_alias=True)
        raise PaymentRequiredException(error_data)
    
    return decoded_payment
    

async def settle_payment(payment: PaymentPayload, payment_requirements: PaymentRequirements) -> SettleResponse:
    return await facilitator.settle(payment, payment_requirements)