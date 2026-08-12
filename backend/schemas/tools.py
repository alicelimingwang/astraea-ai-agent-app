"""
Pydantic JSON Schemas for LLM Tool Calling & Guided Error Recovery.
Addresses Tool & Interface Design criteria with explicit parameters, typing, descriptions,
and structured error recovery payloads for LLM function execution.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union


# ==========================================
# Tool Input Schemas (For LLM Tool Calling)
# ==========================================

class BaziCalculationInput(BaseModel):
    birth_date: str = Field(
        ...,
        description="Gregorian birth date in 'YYYY-MM-DD' format (e.g. '1995-08-18').",
        examples=["1995-08-18"]
    )
    birth_time: str = Field(
        default="12:00",
        description="Birth time in 'HH:MM' 24-hour format, or 'unknown' if not known.",
        examples=["14:30", "unknown"]
    )
    unknown_time_mode: str = Field(
        default="default_horse",
        description="Strategy when birth time is unknown: 'default_horse' (uses peak solar Wu hour 11am-1pm) or 'three_pillars' (omits Hour pillar).",
        examples=["default_horse", "three_pillars"]
    )
    gender: str = Field(
        default="Female",
        description="Biological gender for direction of Day Master major luck cycles ('Male' or 'Female').",
        examples=["Female", "Male"]
    )


class ZiWeiCalculationInput(BaseModel):
    birth_date: str = Field(
        ...,
        description="Gregorian birth date in 'YYYY-MM-DD' format.",
        examples=["1990-05-12"]
    )
    birth_time: str = Field(
        default="12:00",
        description="Birth time in 'HH:MM' format or 'unknown'.",
        examples=["08:15"]
    )
    focus_palace: Optional[str] = Field(
        default="Life",
        description="Target palace for deep-dive analysis: 'Life', 'Career', 'Wealth', 'Spouse', 'Health', 'Travel', 'Friends', 'Property', 'Children', 'Parents', 'Karma', 'Siblings'.",
        examples=["Career", "Wealth", "Spouse"]
    )


class TarotDrawInput(BaseModel):
    spread_type: str = Field(
        default="three_card",
        description="Type of tarot spread to draw: 'three_card' (Past/Present/Future), 'single_card' (Daily Guidance), or 'celtic_cross' (Comprehensive).",
        examples=["three_card", "single_card"]
    )
    query_domain: Optional[str] = Field(
        default="General Destiny",
        description="Domain focus for the draw: 'General Destiny', 'Career', 'Love & Relationships', 'Health & Energy', 'Wealth & Finance'.",
        examples=["Love & Relationships", "Career"]
    )


# ==========================================
# Tool Response & Guided Error Recovery Schemas
# ==========================================

class ToolErrorRecovery(BaseModel):
    """Guided error recovery instructions provided to the LLM upon execution failure."""
    is_error: bool = Field(default=True, description="Flag indicating execution encountered an error")
    error_type: str = Field(..., description="Categorized error identifier (e.g. 'InvalidDateFormat', 'MissingArgument')")
    message: str = Field(..., description="Human-readable error description")
    invalid_parameter: Optional[str] = Field(None, description="The specific parameter that failed validation")
    provided_value: Optional[Any] = Field(None, description="The value supplied that caused the failure")
    guided_recovery_instruction: str = Field(
        ...,
        description="Explicit step-by-step guidance instructing the LLM how to format and correct the input for re-invocation."
    )
    suggested_fallback_arguments: Optional[Dict[str, Any]] = Field(
        None,
        description="Suggested default valid arguments the LLM can use immediately to retry."
    )


class ToolResponse(BaseModel):
    """Standardized tool response wrapper returned to LLM orchestrator."""
    tool_name: str = Field(..., description="Name of tool executed")
    status: str = Field(..., description="'success' or 'error'")
    result: Optional[Dict[str, Any]] = Field(None, description="Result payload if status is success")
    error: Optional[ToolErrorRecovery] = Field(None, description="Guided error recovery payload if status is error")
