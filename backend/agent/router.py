"""
Model Router & Intent Classifier.
Routes user queries dynamically based on complexity and intent:
- 'fast_route': Lightweight models (e.g. gemini-2.5-flash) for intent classification and quick Q&A.
- 'deep_synthesis_route': High-capacity models (e.g. gemini-2.5-pro) for comprehensive destiny synthesis.
"""

from typing import Dict, Any


class ModelRouter:
    """Classifies user intent and selects target LLM model tier."""

    @staticmethod
    def route_query(prompt: str, is_full_report: bool = False) -> Dict[str, Any]:
        """
        Determines target routing model and required specialist sub-agents.
        """
        if is_full_report or len(prompt) > 200 or any(k in prompt.lower() for k in ["report", "synthesis", "comprehensive", "5000", "bazi"]):
            return {
                "route": "deep_synthesis_route",
                "recommended_model": "gemini-2.5-pro",
                "required_agents": ["BaziSpecialistAgent", "ZiWeiSpecialistAgent", "TarotDivinationAgent", "MasterSynthesisAgent"],
                "reason": "Request requires multi-domain destiny calculation and long-form narrative synthesis."
            }
        else:
            return {
                "route": "fast_route",
                "recommended_model": "gemini-2.5-flash",
                "required_agents": ["ConversationalOracleAgent"],
                "reason": "Request is a direct follow-up question suitable for fast conversational response."
            }


model_router = ModelRouter()
