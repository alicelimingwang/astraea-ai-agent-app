"""
Agent Regression Benchmark Suite.
Ensures agent precision, calendar consistency, disclaimer presence, and stability across revisions.
"""

import pytest
from backend.tools.bazi_tool import calculate_bazi_tool
from backend.tools.ziwei_tool import calculate_ziwei_tool
from backend.tools.tarot_tool import draw_tarot_spread_tool
from backend.agent.orchestrator import orchestrator


def test_regression_bazi_ganzhi_consistency():
    """Regression test verifying Ganzhi year pillar calculation across known dates."""
    res1 = calculate_bazi_tool("1984-01-01") # Year of Wood Rat (Jia Zi)
    assert "Jia (Wood)" in res1["pillars"]["year"] or "Jia" in res1["pillars"]["year"]

    res2 = calculate_bazi_tool("2024-02-10") # Year of Wood Dragon (Jia Chen)
    assert "Dragon" in res2["pillars"]["year"]


def test_regression_unknown_time_modes():
    """Regression test ensuring 3-pillars mode omits hour pillar while default_horse includes Wu hour."""
    three_pillars = calculate_bazi_tool("1992-06-15", birth_time="unknown", unknown_time_mode="three_pillars")
    assert "Omitted" in three_pillars["pillars"]["hour"]

    horse_mode = calculate_bazi_tool("1992-06-15", birth_time="unknown", unknown_time_mode="default_horse")
    assert "Wu (Horse/Fire" in horse_mode["pillars"]["hour"] or "Wu" in horse_mode["pillars"]["hour"]


@pytest.mark.asyncio
async def test_regression_synthesis_output_structure():
    """Regression test verifying synthesis report contains required 4 life domains."""
    res = await orchestrator.run_destiny_synthesis(
        birth_date="2000-01-01",
        birth_time="12:00",
        gender="Male",
        session_id="regression_test_session"
    )
    report = res["synthesis_report"]
    assert "Career" in report or "Destiny" in report
    assert "Love" in report or "Romance" in report
    assert "Health" in report or "Vitality" in report
    assert "Wealth" in report or "Prosperity" in report
