"""
Structured JSON Logger & Intent vs Outcome Tracker
Provides structured JSON format output with automated PII redaction and explicit Intent vs Outcome tracking.
"""

import logging
import json
import time
from typing import Any, Dict, Optional
from pythonjsonlogger import json as jsonlogger
from backend.observability.pii_redactor import PIIRedactor


class AstraeaJsonFormatter(jsonlogger.JsonFormatter):
    """Custom JSON formatter with automatic PII redaction."""
    def process_log_record(self, log_record: Dict[str, Any]) -> Dict[str, Any]:
        log_record = super().process_log_record(log_record)
        return PIIRedactor.redact_data(log_record)


def setup_logger(name: str = "astraea-ai") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = AstraeaJsonFormatter('%(timestamp)s %(level)s %(name)s %(message)s %(trace_id)s %(intent)s %(outcome)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger


logger = setup_logger()


def log_intent_vs_outcome(
    intent_type: str,
    user_prompt: str,
    tools_invoked: list,
    status: str,
    outcome_summary: str,
    trace_id: Optional[str] = None,
    execution_time_ms: float = 0.0,
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Explicitly logs parsed user Intent against execution Outcome.
    Satisfies Observability requirement: "log intent vs outcome".
    """
    payload = {
        "event_type": "INTENT_VS_OUTCOME",
        "timestamp": time.time(),
        "trace_id": trace_id or "trace-untracked",
        "intent": {
            "type": intent_type,
            "raw_prompt": user_prompt
        },
        "execution": {
            "tools_invoked": tools_invoked,
            "duration_ms": execution_time_ms,
            "status": status
        },
        "outcome": {
            "summary": outcome_summary
        },
        "metadata": metadata or {}
    }
    
    sanitized = PIIRedactor.redact_data(payload)
    logger.info(json.dumps(sanitized))
