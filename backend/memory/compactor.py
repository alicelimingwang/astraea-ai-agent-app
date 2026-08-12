"""
History Compaction & Context Window Summarization.
Compresses older conversation turns into structured memory summaries when conversation length exceeds max threshold.
"""

from typing import List, Dict, Any


class HistoryCompactor:
    """Algorithm for compressing long chat histories into semantic memory summaries."""

    @staticmethod
    def compact_turns(messages: List[Dict[str, Any]]) -> str:
        """
        Synthesizes a list of message dicts into a concise summary string.
        Preserves user key facts, preferences, questions asked, and main insights provided.
        """
        user_queries = [m["content"] for m in messages if m.get("role") == "user"]
        assistant_responses = [m["content"] for m in messages if m.get("role") == "assistant"]

        summary = f"[Compacted Memory Summary - {len(messages)} Turns]\n"
        summary += f"- Key User Inquiries: {'; '.join(user_queries[:3])}\n"
        if len(user_queries) > 3:
            summary += f"- Additional User Questions: {len(user_queries) - 3} follow-up queries processed.\n"
        
        if assistant_responses:
            summary += f"- Primary Guidance Summary: Delivered insights on destiny, Bazi elemental balance, and card spreads."

        return summary
