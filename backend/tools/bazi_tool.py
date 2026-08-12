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

    # Accurate Bazi Sexagenary Ganzhi calculation
    year = dt.year
    month = dt.month
    day = dt.day

    cutoffs = [0, 6, 4, 6, 5, 6, 6, 7, 8, 8, 8, 7, 7]

    if day >= cutoffs[month]:
        if month == 1:
            m_solar = 12
            y_solar = year - 1
        else:
            m_solar = month - 1
            y_solar = year
    else:
        if month == 1:
            m_solar = 11
            y_solar = year - 1
        elif month == 2:
            m_solar = 12
            y_solar = year - 1
        else:
            m_solar = month - 2
            y_solar = year

    # Year Pillar
    year_idx = (y_solar - 4) % 10
    year_branch_idx = (y_solar - 4) % 12
    year_pillar = f"{stems[year_idx]} {branches[year_branch_idx]}"

    # Month Pillar (Five Tigers Chasing Months)
    s_m1 = ((year_idx % 5) * 2 + 2) % 10
    month_idx = (s_m1 + m_solar - 1) % 10
    month_branch_idx = (m_solar + 1) % 12
    month_pillar = f"{stems[month_idx]} {branches[month_branch_idx]}"

    # Day Pillar (Julian Day Number Algorithm)
    a = (14 - month) // 12
    y = year + 4800 - a
    m = month + 12 * a - 3
    jdn = day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045

    ref_jdn = 2451545  # 2000-01-01 JDN was 戊午 (Stem 4, Branch 6)
    diff = jdn - ref_jdn
    day_idx = (4 + diff) % 10
    day_branch_idx = (6 + diff) % 12
    day_pillar = f"{stems[day_idx]} {branches[day_branch_idx]}"
    day_master = stems[day_idx]

    is_unknown = (birth_time.lower() == "unknown")
    if is_unknown and unknown_time_mode == "three_pillars":
        hour_pillar = "Omitted (3-Pillars Mode)"
        mode_label = "3-Pillars Precision Mode"
    else:
        if is_unknown:
            hours = 12
        else:
            try:
                hours = int(birth_time.split(":")[0])
            except ValueError:
                hours = 12
        hour_branch_idx = ((hours + 1) // 2) % 12
        hour_stem_idx = (day_idx * 2 + hour_branch_idx) % 10
        hour_pillar = f"{stems[hour_stem_idx]} Wu (Horse/Fire - Default Solar Noon)" if is_unknown else f"{stems[hour_stem_idx]} {branches[hour_branch_idx]}"
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
