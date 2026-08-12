"""
OpenTelemetry Distributed Tracing & Span Collector
Implements real OpenTelemetry TracerProvider and records actual execution spans.
Stores spans in memory for API export so the UI can view live OTEL execution spans!
"""

import time
import uuid
from typing import Any, Dict, List, Optional
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, SpanExporter
from opentelemetry.sdk.trace.export import SpanExportResult
from backend.observability.pii_redactor import PIIRedactor

# In-Memory Span Store for UI API inspection
SPAN_STORE: List[Dict[str, Any]] = []
MAX_STORED_SPANS = 200


class InMemorySpanExporter(SpanExporter):
    """Custom exporter that pushes formatted OpenTelemetry spans into memory for UI API inspection."""
    
    def export(self, spans) -> SpanExportResult:
        for span in spans:
            duration_ms = (span.end_time - span.start_time) / 1e6 if span.end_time and span.start_time else 0.0
            
            attributes = dict(span.attributes) if span.attributes else {}
            sanitized_attributes = PIIRedactor.redact_data(attributes)
            
            formatted_span = {
                "span_id": format(span.context.span_id, '016x'),
                "trace_id": format(span.context.trace_id, '032x'),
                "parent_span_id": format(span.parent.span_id, '016x') if span.parent else None,
                "name": span.name,
                "status": span.status.status_code.name if span.status else "OK",
                "start_time": span.start_time / 1e9 if span.start_time else time.time(),
                "end_time": span.end_time / 1e9 if span.end_time else time.time(),
                "duration_ms": round(duration_ms, 2),
                "attributes": sanitized_attributes
            }
            
            SPAN_STORE.append(formatted_span)
            if len(SPAN_STORE) > MAX_STORED_SPANS:
                SPAN_STORE.pop(0)
                
        return SpanExportResult.SUCCESS

    def shutdown(self):
        pass


# Initialize TracerProvider
provider = TracerProvider()
exporter = InMemorySpanExporter()
processor = SimpleSpanProcessor(exporter)
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)

tracer = trace.get_tracer("astraea.ai.agent")


def get_stored_spans(limit: int = 50) -> List[Dict[str, Any]]:
    """Returns stored OpenTelemetry spans for API visualization."""
    return list(reversed(SPAN_STORE[-limit:]))


def clear_spans():
    """Clears stored spans."""
    global SPAN_STORE
    SPAN_STORE.clear()
