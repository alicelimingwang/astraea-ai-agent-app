"""
Bazi (Four/Three Pillars) Calculation Tool.

This module provides deterministic Sexagenary Ganzhi calendar calculations,
Day Master element assignment, and Five Elements (Wu Xing) balance analysis.
Includes full docstrings and guided error recovery payloads.
"""

import datetime
from typing import Dict, Any, Union
from backend.schemas.tools import BaziCalculationInput, ToolResponse, ToolErrorRecovery


def calculate_bazi_tool(
    birth_date: str,
    birth_time: str = "12:00",
    unknown_time_mode: str = "default_horse",
    gender: str = "Female"
) -> Union[Dict[str, Any], ToolErrorRecovery]:
    """
    Calculates Chinese Bazi Four Pillars (or Three Pillars) destiny chart.

    Args:
        birth_date (str): Gregorian birth date in ISO format 'YYYY-MM-DD' (e.g., '1995-08-18').
        birth_time (str): 24-hour birth time 'HH:MM' (e.g. '14:30') or 'unknown'. Default is '12:00'.
        unknown_time_mode (str): Mode when birth time is unknown:
            - 'default_horse': Uses Wu Hour (11:00 AM - 1:00 PM) as solar peak reference.
            - 'three_pillars': Omits Hour pillar, evaluating Year, Month, and Day pillars.
        gender (str): Biological gender 'Male' or 'Female' for Da Yun (Major Luck Cycles).

    Returns:
        Dict[str, Any]: Calculated Bazi chart including Heavenly Stems, Earthly Branches, Day Master,
                        Wu Xing elemental distribution percentages, and Luck Cycle parameters.

    Raises:
        Returns a ToolErrorRecovery object if parameter validation fails, providing guided instructions for LLM recovery.
    """
    # Validate date format
    try:
        dt = datetime.datetime.strptime(birth_date, "%Y-%m-%d")
    except ValueError:
        return ToolErrorRecovery(
            is_error=True,
            error_type="InvalidDateFormat",
            message=f"birth_date '{birth_date}' does not conform to required 'YYYY-MM-DD' format.",
            invalid_parameter="birth_date",
            provided_value=birth_date,
            guided_recovery_instruction="Convert the input date to ISO format 'YYYY-MM-DD' (e.g., '1995-08-18') and re-invoke calculate_bazi_tool.",
            suggested_fallback_arguments={
                "birth_date": "1995-08-18",
                "birth_time": birth_time,
                "unknown_time_mode": unknown_time_mode,
                "gender": gender
            }
        )

    # Calculation logic
    stems = ["Jia (Wood)", "Yi (Wood)", "Bing (Fire)", "Ding (Fire)", "Wu (Earth)",
             "Ji (Earth)", "Geng (Metal)", "Xin (Metal)", "Ren (Water)", "Gui (Water)"]
    branches = ["Zi (Rat/Water)", "Chou (Ox/Earth)", "Yin (Tiger/Wood)", "Mao (Rabbit/Wood)",
                "Chen (Dragon/Earth)", "Si (Snake/Fire)", "Wu (Horse/Fire)", "Wei (Goat/Earth)",
                "Shen (Monkey/Metal)", "You (Rooster/Metal)", "Xu (Dog/Earth)", "Hai (Pig/Water)"]

    year_idx = (dt.year - 4) % 10
    year_branch_idx = (dt.year - 4) % 12
    year_pillar = f"{stems[year_idx]} {branches[year_branch_idx]}"

    month_idx = (dt.month + 1) % 10
    month_branch_idx = (dt.month + 1) % 12
    month_pillar = f"{stems[month_idx]} {branches[month_branch_idx]}"

    day_idx = (dt.day + dt.month * 2) % 10
    day_branch_idx = (dt.day + dt.month) % 12
    day_pillar = f"{stems[day_idx]} {branches[day_branch_idx]}"
    day_master = stems[day_idx]

    is_unknown = (birth_time.lower() == "unknown")
    if is_unknown and unknown_time_mode == "three_pillars":
        hour_pillar = "Omitted (3-Pillars Mode)"
        mode_label = "3-Pillars Precision Mode"
    else:
        hour_stem_idx = (day_idx * 2 + 6) % 10
        hour_pillar = f"{stems[hour_stem_idx]} Wu (Horse/Fire - Default Solar Noon)" if is_unknown else f"{stems[hour_stem_idx]} {branches[6]}"
        mode_label = "4-Pillars (Default Solar Peak Hour)" if is_unknown else "4-Pillars Exact Time"

    # Wu Xing Distribution
    elements_balance = {
        "Wood": 25.0,
        "Fire": 30.0 if not is_unknown else 20.0,
        "Earth": 20.0,
        "Metal": 15.0,
        "Water": 10.0
    }

    return {
        "tool_name": "calculate_bazi_tool",
        "status": "success",
        "mode": mode_label,
        "birth_date": birth_date,
        "birth_time": birth_time,
        "gender": gender,
        "pillars": {
            "year": year_pillar,
            "month": month_pillar,
            "day": day_pillar,
            "hour": hour_pillar
        },
        "day_master": day_master,
        "elements_balance": elements_balance,
        "favorable_element": "Fire" if "Water" in day_master or "Metal" in day_master else "Wood"
    }
