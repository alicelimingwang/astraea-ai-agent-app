"""
Human-in-the-Loop (HITL) Confirmation Manager.
Implements mechanisms requiring explicit user approval or parameter confirmation
before executing high-impact synthesis (e.g. unknown birth time handling, report scope).
"""

from typing import Dict, Any, Optional


class HITLManager:
    """Manages Human-in-the-Loop state and confirmation requests."""

    @staticmethod
    def create_confirmation_request(
        action_type: str,
        parameters: Dict[str, Any],
        explanation: str
    ) -> Dict[str, Any]:
        """Creates a structured HITL confirmation payload for client approval."""
        return {
            "hitl_required": True,
            "action_type": action_type,
            "parameters": parameters,
            "explanation": explanation,
            "confirmation_options": [
                {"id": "approve", "label": "Approve and Proceed", "default": True},
                {"id": "modify_time_mode", "label": "Switch to 3-Pillars Mode"},
                {"id": "cancel", "label": "Cancel Operation"}
            ]
        }

    @staticmethod
    def process_confirmation_response(
        confirmation_id: str,
        user_choice: str,
        parameters: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Processes user confirmation feedback."""
        if user_choice == "modify_time_mode":
            parameters["unknown_time_mode"] = "three_pillars"
            return {"status": "modified", "updated_parameters": parameters, "action": "proceed"}
        elif user_choice == "approve":
            return {"status": "approved", "updated_parameters": parameters, "action": "proceed"}
        else:
            return {"status": "cancelled", "updated_parameters": parameters, "action": "abort"}


hitl_manager = HITLManager()
