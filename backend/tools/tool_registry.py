"""
Central Tool Registry & LLM JSON Schema Generator.
Manages tool declarations, exposes explicit JSON Schemas for LLM tool calling,
and provides guided error recovery execution wrappers.
"""

from typing import Dict, Any, List, Callable
from backend.schemas.tools import (
    BaziCalculationInput,
    ZiWeiCalculationInput,
    TarotDrawInput,
    ToolErrorRecovery
)
from backend.tools.bazi_tool import calculate_bazi_tool
from backend.tools.ziwei_tool import calculate_ziwei_tool
from backend.tools.tarot_tool import draw_tarot_spread_tool


class ToolRegistry:
    """Central registry providing LLM Function Call declarations and execution wrappers."""

    def __init__(self):
        self._tools: Dict[str, Callable] = {
            "calculate_bazi_tool": calculate_bazi_tool,
            "calculate_ziwei_tool": calculate_ziwei_tool,
            "draw_tarot_spread_tool": draw_tarot_spread_tool
        }
        self._schemas: Dict[str, Any] = {
            "calculate_bazi_tool": BaziCalculationInput.model_json_schema(),
            "calculate_ziwei_tool": ZiWeiCalculationInput.model_json_schema(),
            "draw_tarot_spread_tool": TarotDrawInput.model_json_schema()
        }

    def get_llm_tool_declarations(self) -> List[Dict[str, Any]]:
        """
        Generates explicit JSON Schemas formatted for Google Gemini / OpenAPI LLM Function Calling.
        Satisfies Tool & Interface Design criteria.
        """
        return [
            {
                "name": "calculate_bazi_tool",
                "description": "Calculates Chinese Four/Three Pillars Sexagenary Ganzhi calendar and Wu Xing Five Elements distribution.",
                "parameters": self._schemas["calculate_bazi_tool"]
            },
            {
                "name": "calculate_ziwei_tool",
                "description": "Calculates Zi Wei Dou Shu 12 Palaces star placements and primary destiny star matrix.",
                "parameters": self._schemas["calculate_ziwei_tool"]
            },
            {
                "name": "draw_tarot_spread_tool",
                "description": "Draws 78-card Tarot deck spread for Past/Present/Future metaphysical guidance.",
                "parameters": self._schemas["draw_tarot_spread_tool"]
            }
        ]

    def execute_tool(self, tool_name: str, kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes named tool with guided error recovery on invalid inputs or execution exceptions.
        """
        if tool_name not in self._tools:
            return ToolErrorRecovery(
                is_error=True,
                error_type="UnknownTool",
                message=f"Tool '{tool_name}' is not registered in Astraea AI ToolRegistry.",
                invalid_parameter="tool_name",
                provided_value=tool_name,
                guided_recovery_instruction=f"Select a registered tool from: {list(self._tools.keys())}."
            ).model_dump()

        func = self._tools[tool_name]
        try:
            result = func(**kwargs)
            if isinstance(result, ToolErrorRecovery):
                return result.model_dump()
            return result
        except Exception as e:
            return ToolErrorRecovery(
                is_error=True,
                error_type="ExecutionException",
                message=str(e),
                invalid_parameter=None,
                provided_value=kwargs,
                guided_recovery_instruction="Review argument data types and retry function call with corrected parameters."
            ).model_dump()


tool_registry = ToolRegistry()
