"""
Unit Tests for Observability & Tracing.
Tests JSON logging, Intent vs Outcome logging, OpenTelemetry span collection, and PII redaction.
"""

import pytest
from backend.observability.pii_redactor import PIIRedactor
from backend.observability.tracing import tracer, get_stored_spans, clear_spans
from backend.observability.logger import log_intent_vs_outcome


def test_pii_redactor():
    """Verifies that sensitive emails, phone numbers, and SSNs are redacted."""
    raw_text = "Contact Alice at alice@example.com or 555-123-4567. SSN: 123-45-6789."
    redacted = PIIRedactor.redact_text(raw_text)
    
    assert "alice@example.com" not in redacted
    assert "555-123-4567" not in redacted
    assert "123-45-6789" not in redacted
    assert "[REDACTED_EMAIL]" in redacted
    assert "[REDACTED_PHONE]" in redacted
    assert "[REDACTED_SSN]" in redacted


def test_opentelemetry_span_recording():
    """Verifies that OpenTelemetry spans are recorded and stored for API export."""
    clear_spans()
    
    with tracer.start_as_current_span("TestSpan") as span:
        span.set_attribute("test_key", "test_val")

    spans = get_stored_spans()
    assert len(spans) >= 1
    assert spans[0]["name"] == "TestSpan"
    assert spans[0]["attributes"]["test_key"] == "test_val"


def test_log_intent_vs_outcome():
    """Verifies intent vs outcome logging helper executes without error."""
    log_intent_vs_outcome(
        intent_type="TEST_INTENT",
        user_prompt="Test user query with email test@example.com",
        tools_invoked=["test_tool"],
        status="success",
        outcome_summary="Test outcome executed cleanly.",
        trace_id="trace-12345",
        execution_time_ms=12.5
    )
