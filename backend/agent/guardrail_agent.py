"""
Guardrail Agent & Safety Engine.
Performs pre-execution input sanitization and post-execution output compliance checks.
"""

from typing import Dict, Any
from backend.observability.pii_redactor import PIIRedactor


class GuardrailAgent:
    """Evaluates safety guardrails and applies disclaimers."""

    @staticmethod
    def inspect_input(user_input: str) -> Dict[str, Any]:
        """
        Pre-execution input check.
        Detects prompt injection attempts, toxic content, and redacts PII.
        """
        sanitized_input = PIIRedactor.redact_text(user_input)
        
        # Check for injection or harmful intent
        toxic_keywords = ["hack", "exploit", "ignore previous instructions", "system prompt", "override safety"]
        is_suspicious = any(kw in user_input.lower() for kw in toxic_keywords)

        return {
            "passed": True if not is_suspicious else False,
            "sanitized_input": sanitized_input,
            "pii_detected": (sanitized_input != user_input),
            "flagged_reason": "Potential prompt injection or policy violation detected" if is_suspicious else None
        }

    @staticmethod
    def enforce_output_guardrails(response_text: str, domain: str = "General") -> str:
        """
        Post-execution output check.
        Appends mandatory empathetic disclaimers for health and financial destiny topics.
        """
        disclaimer = (
            "\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection, spiritual growth, "
            "and entertainment. They do not constitute professional medical, legal, or financial advice. "
            "You possess free will to shape your own future.*"
        )
        
        if disclaimer not in response_text and any(k in response_text.lower() for k in ["health", "medical", "disease", "wealth", "invest"]):
            return response_text + disclaimer
            
        return response_text


guardrail_agent = GuardrailAgent()
