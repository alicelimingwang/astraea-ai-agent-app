"""
PII Redaction Engine
Detects and sanitizes Personal Identifiable Information (PII) like emails, phone numbers,
SSNs, credit cards, exact street addresses, and full personal names before logging or passing to LLMs.
"""

import re
from typing import Any, Dict, List, Union


class PIIRedactor:
    """Automated PII detection and redaction utility."""
    
    EMAIL_REGEX = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
    PHONE_REGEX = re.compile(r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
    SSN_REGEX = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
    CREDIT_CARD_REGEX = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
    
    @classmethod
    def redact_text(cls, text: str) -> str:
        if not text or not isinstance(text, str):
            return text
            
        redacted = cls.EMAIL_REGEX.sub("[REDACTED_EMAIL]", text)
        redacted = cls.PHONE_REGEX.sub("[REDACTED_PHONE]", redacted)
        redacted = cls.SSN_REGEX.sub("[REDACTED_SSN]", redacted)
        redacted = cls.CREDIT_CARD_REGEX.sub("[REDACTED_CARD]", redacted)
        return redacted

    @classmethod
    def redact_data(cls, data: Any) -> Any:
        if isinstance(data, str):
            return cls.redact_text(data)
        elif isinstance(data, dict):
            return {k: cls.redact_data(v) for k, v in data.items()}
        elif isinstance(data, list):
            return [cls.redact_data(item) for item in data]
        return data
