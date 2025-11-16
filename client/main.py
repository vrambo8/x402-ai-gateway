import asyncio
from cdp import CdpClient
from dotenv import load_dotenv
from x402.clients.httpx import x402HttpxClient
from x402.clients.base import decode_x_payment_response, x402Client
from eth_account import Account
import os

load_dotenv()

base_url="http://0.0.0.0:8000"
endpoint="/v1/responses"

def custom_payment_selector(
    accepts, network_filter=None, scheme_filter=None, max_value=None
):
    """Custom payment selector that filters by network."""
    # Ignore the network_filter parameter for this example - we hardcode base-sepolia
    _ = network_filter

    # NOTE: In a real application, you'd want to dynamically choose the most
    # appropriate payment requirement based on user preferences, available funds,
    # network conditions, or other business logic rather than hardcoding a network.

    # Filter by base-sepolia network (testnet)
    return x402Client.default_payment_requirements_selector(
        accepts,
        network_filter="base-sepolia",
        scheme_filter=scheme_filter,
        max_value=max_value,
    )

async def main():
    account = Account.from_key(os.getenv("ETH_PRIVATE_KEY"))
    
    async with x402HttpxClient(
        account=account,
        base_url=base_url,
        payment_requirements_selector=custom_payment_selector,
    ) as client:
        # Make request - payment handling is automatic
        try:
            assert endpoint is not None  # we already guard against None above
            print(f"Making request to {endpoint}")
            response = await client.post(endpoint, json={
                "model": "gpt-3.5-turbo",
                "input": "How are you",
                "max_output_tokens": 16
            })

            # Read the response content
            content = await response.aread()
            print(f"Response: {content.decode()}")

            # Check for payment response header
            if "X-Payment-Response" in response.headers:
                payment_response = decode_x_payment_response(
                    response.headers["X-Payment-Response"]
                )
                print(payment_response)
                print(
                    f"Payment response transaction hash: {payment_response['transaction']}"
                )
            else:
                print("Warning: No payment response header found")

        except Exception as e:
            raise e


if __name__ == "__main__":
    asyncio.run(main())