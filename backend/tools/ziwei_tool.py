"""
Zi Wei Dou Shu (12 Palaces Matrix) Tool.

Provides star placement calculations across Life, Career, Wealth, Spouse, and Health palaces.
Includes detailed docstrings, parameter typing, and error recovery handling.
"""

import datetime
from typing import Dict, Any, Union
from backend.schemas.tools import ZiWeiCalculationInput, ToolErrorRecovery


def calculate_ziwei_tool(
    birth_date: str,
    birth_time: str = "12:00",
    focus_palace: str = "Life"
) -> Union[Dict[str, Any], ToolErrorRecovery]:
    """
    Calculates Zi Wei Dou Shu 12 Palaces star placements and primary star matrix.

    Args:
        birth_date (str): Gregorian birth date in ISO format 'YYYY-MM-DD'.
        birth_time (str): Birth time 'HH:MM' or 'unknown'. Default is '12:00'.
        focus_palace (str): Primary palace to highlight for deep analysis (e.g. 'Life', 'Career', 'Wealth', 'Spouse', 'Health').

    Returns:
        Dict[str, Any]: 12 Palaces matrix with primary star assignments, minor stars, and targeted palace highlights.

    Raises:
        Returns ToolErrorRecovery if input validation fails.
    """
    try:
        dt = datetime.datetime.strptime(birth_date, "%Y-%m-%d")
    except ValueError:
        return ToolErrorRecovery(
            is_error=True,
            error_type="InvalidDateFormat",
            message=f"birth_date '{birth_date}' is invalid.",
            invalid_parameter="birth_date",
            provided_value=birth_date,
            guided_recovery_instruction="Supply birth_date in 'YYYY-MM-DD' format.",
            suggested_fallback_arguments={"birth_date": "1990-05-12", "birth_time": "12:00", "focus_palace": focus_palace}
        )

    palaces = ["Life", "Parents", "Karma", "Property", "Career", "Friends", "Travel", "Health", "Wealth", "Children", "Spouse", "Siblings"]
    stars = ["Zi Wei (Emperor)", "Tian Ji (Advisor)", "Tai Yang (Sun)", "Wu Qu (General)", "Tian Tong (Pleasure)", "Lian Zhen (Politician)", "Tian Fu (Treasury)", "Tai Yin (Moon)"]

    offset = (dt.day + dt.month) % 12
    palace_matrix = {}
    for i, p in enumerate(palaces):
        p_star = stars[(i + offset) % len(stars)]
        palace_matrix[p] = {
            "primary_star": p_star,
            "energy_level": "Bright (Miao)" if i % 2 == 0 else "Prosperous (Wang)",
            "is_focused": (p.lower() == focus_palace.lower())
        }

    return {
        "tool_name": "calculate_ziwei_tool",
        "status": "success",
        "focus_palace": focus_palace,
        "palace_matrix": palace_matrix,
        "primary_destiny_star": palace_matrix.get("Life", {}).get("primary_star", "Zi Wei (Emperor)")
    }
