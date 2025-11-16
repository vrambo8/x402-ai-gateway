from typing import Dict
from decimal import Decimal

# Model pricing (per 1000 tokens) - Last updated: January 2025
# Source: https://openai.com/api/pricing/
MODEL_PRICING = {
    # GPT-4o family
    "gpt-4o": {"input": Decimal("0.006"), "output": Decimal("0.018")},
    "gpt-4o-mini": {"input": Decimal("0.00015"), "output": Decimal("0.0006")},

    # GPT-4 family
    "gpt-4-turbo": {"input": Decimal("0.01"), "output": Decimal("0.03")},
    "gpt-4": {"input": Decimal("0.03"), "output": Decimal("0.06")},

    # GPT-3.5 family
    "gpt-3.5-turbo": {"input": Decimal("0.0005"), "output": Decimal("0.0015")},

    # o1 reasoning models
    "o1": {"input": Decimal("0.15"), "output": Decimal("0.6")},
    "o1-preview": {"input": Decimal("0.015"), "output": Decimal("0.06")},
    "o1-mini": {"input": Decimal("0.003"), "output": Decimal("0.012")},
}

# Dev mode price divisor (makes prices 1 millionth of production)
DEV_MODE_DIVISOR = Decimal("1000000")  # 10^6


class PricingEngine:
    def __init__(self, dev_mode: bool = False):
        """
        Initialize pricing engine.

        Args:
            dev_mode: If True, all prices are divided by 10^6 for testing
        """
        self.dev_mode = dev_mode
        self._price_multiplier = Decimal("1") / DEV_MODE_DIVISOR if dev_mode else Decimal("1")

    def _get_rates(self, model: str) -> Dict[str, Decimal]:
        """Get pricing rates for a model, adjusted for dev mode"""
        if model not in MODEL_PRICING:
            model = "gpt-3.5-turbo"  # Default fallback

        rates = MODEL_PRICING[model]
        if self.dev_mode:
            return {
                "input": rates["input"] * self._price_multiplier,
                "output": rates["output"] * self._price_multiplier
            }
        return rates

    def estimate_cost(self, model: str, input_tokens: int, max_output_tokens: int) -> Decimal:
        """
        Estimate cost assuming worst-case output.
        Used for upfront payment (escrow model).
        """
        rates = self._get_rates(model)
        input_cost = (Decimal(input_tokens) / 1000) * rates["input"]
        output_cost = (Decimal(max_output_tokens) / 1000) * rates["output"]

        return input_cost + output_cost

    def calculate_actual_cost(self, model: str, input_tokens: int,
                             output_tokens: int) -> Decimal:
        """Calculate actual cost after inference."""
        rates = self._get_rates(model)
        input_cost = (Decimal(input_tokens) / 1000) * rates["input"]
        output_cost = (Decimal(output_tokens) / 1000) * rates["output"]

        return input_cost + output_cost

    @staticmethod
    def calculate_refund(estimated: Decimal, actual: Decimal) -> Decimal:
        """Calculate refund if actual cost < estimated"""
        refund = estimated - actual
        return max(refund, Decimal("0"))  # Never negative
