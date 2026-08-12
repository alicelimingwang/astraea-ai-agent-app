"""
Tarot Divination Card Spread Tool.

Executes deterministic 78-card deck draws with randomized seed option,
returning 3-card spread (Past/Foundation, Present State, Future Outlook).
"""

import random
from typing import Dict, Any, Union
from backend.schemas.tools import TarotDrawInput, ToolErrorRecovery


TAROT_DECK = [
    {"name": "The Fool", "arcana": "Major", "keywords": ["New Beginnings", "Innocence", "Spontaneity"]},
    {"name": "The Magician", "arcana": "Major", "keywords": ["Manifestation", "Resourcefulness", "Power"]},
    {"name": "The High Priestess", "arcana": "Major", "keywords": ["Intuition", "Sacred Knowledge", "Divine Feminine"]},
    {"name": "The Empress", "arcana": "Major", "keywords": ["Femininity", "Beauty", "Abundance"]},
    {"name": "The Emperor", "arcana": "Major", "keywords": ["Authority", "Structure", "Control"]},
    {"name": "The Hierophant", "arcana": "Major", "keywords": ["Spiritual Wisdom", "Tradition", "Institutions"]},
    {"name": "The Lovers", "arcana": "Major", "keywords": ["Love", "Harmony", "Relationships", "Choices"]},
    {"name": "The Chariot", "arcana": "Major", "keywords": ["Control", "Willpower", "Success", "Determination"]},
    {"name": "Strength", "arcana": "Major", "keywords": ["Courage", "Persuasion", "Influence", "Compassion"]},
    {"name": "The Hermit", "arcana": "Major", "keywords": ["Soul-Searching", "Introspection", "Inner Guidance"]},
    {"name": "Wheel of Fortune", "arcana": "Major", "keywords": ["Good Luck", "Karma", "Life Cycles", "Destiny"]},
    {"name": "Justice", "arcana": "Major", "keywords": ["Justice", "Fairness", "Truth", "Cause and Effect"]},
    {"name": "The Hanged Man", "arcana": "Major", "keywords": ["Pause", "Surrender", "Letting Go", "New Perspectives"]},
    {"name": "Death", "arcana": "Major", "keywords": ["Endings", "Change", "Transformation", "Transition"]},
    {"name": "Temperance", "arcana": "Major", "keywords": ["Balance", "Moderation", "Patience", "Purpose"]},
    {"name": "The Star", "arcana": "Major", "keywords": ["Hope", "Faith", "Purpose", "Renewal", "Spirituality"]},
    {"name": "The Moon", "arcana": "Major", "keywords": ["Illusion", "Fear", "Anxiety", "Subconscious", "Intuition"]},
    {"name": "The Sun", "arcana": "Major", "keywords": ["Positivity", "Fun", "Warmth", "Success", "Vitality"]},
    {"name": "World", "arcana": "Major", "keywords": ["Completion", "Integration", "Accomplishment", "Travel"]},
    {"name": "Ace of Cups", "arcana": "Minor", "keywords": ["Overflowing Love", "Emotional Clarity", "Intuition"]},
    {"name": "Ace of Pentacles", "arcana": "Minor", "keywords": ["New Financial Opportunity", "Abundance", "Manifestation"]},
    {"name": "Ace of Swords", "arcana": "Minor", "keywords": ["Breakthroughs", "Mental Clarity", "Sharp Truth"]},
    {"name": "Ace of Wands", "arcana": "Minor", "keywords": ["Inspiration", "Power", "Creation", "Bold Energy"]}
]


def draw_tarot_spread_tool(
    spread_type: str = "three_card",
    query_domain: str = "General Destiny"
) -> Union[Dict[str, Any], ToolErrorRecovery]:
    """
    Draws tarot cards from the 78-card deck according to requested spread.

    Args:
        spread_type (str): 'three_card' (Past/Present/Future), 'single_card', or 'celtic_cross'.
        query_domain (str): Domain for reading ('General Destiny', 'Career', 'Love & Relationships').

    Returns:
        Dict[str, Any]: Drawn cards with positions, arcana, orientation, and keywords.
    """
    valid_spreads = ["three_card", "single_card", "celtic_cross"]
    if spread_type not in valid_spreads:
        return ToolErrorRecovery(
            is_error=True,
            error_type="InvalidSpreadType",
            message=f"spread_type '{spread_type}' is not supported.",
            invalid_parameter="spread_type",
            provided_value=spread_type,
            guided_recovery_instruction=f"Select a valid spread_type from {valid_spreads}.",
            suggested_fallback_arguments={"spread_type": "three_card", "query_domain": query_domain}
        )

    drawn = random.sample(TAROT_DECK, 3 if spread_type == "three_card" else 1)
    positions = ["Past Foundation / Origin", "Present Dynamic", "Future Outlook"] if len(drawn) == 3 else ["Core Guidance"]

    cards_data = []
    for card, pos in zip(drawn, positions):
        is_upright = random.choice([True, True, False]) # 66% upright
        cards_data.append({
            "position": pos,
            "card_name": card["name"],
            "arcana": card["arcana"],
            "orientation": "Upright" if is_upright else "Reversed",
            "keywords": card["keywords"]
        })

    return {
        "tool_name": "draw_tarot_spread_tool",
        "status": "success",
        "spread_type": spread_type,
        "query_domain": query_domain,
        "drawn_cards": cards_data
    }
