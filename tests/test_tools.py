"""
Unit Tests for Tool & Interface Design.
Tests explicit JSON Schema generation, tool parameter validation, and guided error recovery payloads.
"""

import pytest
from backend.tools.tool_registry import tool_registry
from backend.tools.bazi_tool import calculate_bazi_tool
from backend.schemas.tools import ToolErrorRecovery


def test_tool_declarations_schema():
    """Verifies tool declarations conform to explicit JSON Schema specs for LLM tool calling."""
    declarations = tool_registry.get_llm_tool_declarations()
    assert len(declarations) == 3
    tool_names = [d["name"] for d in declarations]
    assert "calculate_bazi_tool" in tool_names
    assert "calculate_ziwei_tool" in tool_names
    assert "draw_tarot_spread_tool" in tool_names

    bazi_decl = next(d for d in declarations if d["name"] == "calculate_bazi_tool")
    assert "properties" in bazi_decl["parameters"]
    assert "birth_date" in bazi_decl["parameters"]["properties"]


def test_bazi_tool_valid_input():
    """Tests calculate_bazi_tool with valid parameters."""
    result = calculate_bazi_tool(
        birth_date="1995-08-18",
        birth_time="14:30",
        unknown_time_mode="default_horse",
        gender="Female"
    )
    assert result["status"] == "success"
    assert "pillars" in result
    assert result["pillars"]["year"] != ""
    assert result["day_master"] != ""


def test_guided_error_recovery_on_invalid_date():
    """Verifies that invalid parameters return a structured ToolErrorRecovery object for LLM guidance."""
    result = calculate_bazi_tool(birth_date="18-08-1995") # Invalid format
    assert isinstance(result, ToolErrorRecovery)
    assert result.is_error is True
    assert result.error_type == "InvalidDateFormat"
    assert result.invalid_parameter == "birth_date"
    assert "YYYY-MM-DD" in result.guided_recovery_instruction
    assert result.suggested_fallback_arguments["birth_date"] == "1995-08-18"


def test_tarot_tool_guided_error_recovery():
    """Tests tarot tool invalid spread type recovery payload."""
    result = tool_registry.execute_tool("draw_tarot_spread_tool", {"spread_type": "invalid_spread"})
    assert result["is_error"] is True
    assert result["error_type"] == "InvalidSpreadType"
    assert "select a valid spread_type" in result["guided_recovery_instruction"].lower()
