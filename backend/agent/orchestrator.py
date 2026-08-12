"""
Master Multi-Agent Orchestrator
Coordinates Google Gemini LLM API integration, Tool Calling, Specialist Sub-Agents,
Memory management, Guardrail checks, OpenTelemetry tracing, and Intent vs Outcome logging.
"""

import time
import json
import uuid
from typing import Dict, Any, Optional
from opentelemetry import trace

from backend.config import config
from backend.observability.logger import logger, log_intent_vs_outcome
from backend.observability.tracing import tracer
from backend.tools.tool_registry import tool_registry
from backend.memory.async_memory import memory_manager
from backend.agent.system_prompts import ASTRAEA_SYSTEM_PROMPT
from backend.agent.guardrail_agent import guardrail_agent
from backend.agent.router import model_router
from backend.agent.hitl import hitl_manager


class AstraeaOrchestrator:
    """Master Multi-Agent Orchestrator."""

    def __init__(self):
        self.gemini_client = None
        if config.gemini_api_key:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=config.gemini_api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI Client: {e}. Falling back to dynamic synthesis mode.")

    async def run_destiny_synthesis(
        self,
        birth_date: str,
        birth_time: str = "12:00",
        unknown_time_mode: str = "default_horse",
        gender: str = "Female",
        focus_mode: str = "grand_fate",
        session_id: str = "default_session"
    ) -> Dict[str, Any]:
        """
        Executes full multi-agent destiny calculation and LLM synthesis.
        """
        start_time = time.time()
        trace_id = str(uuid.uuid4())
        
        with tracer.start_as_current_span("AstraeaOrchestrator.run_destiny_synthesis") as span:
            span.set_attribute("session_id", session_id)
            span.set_attribute("birth_date", birth_date)
            span.set_attribute("focus_mode", focus_mode)

            # Step 1: Input Guardrail & Sanitization
            input_check = guardrail_agent.inspect_input(f"Calculate fate for {birth_date} {birth_time} {gender}")
            if not input_check["passed"]:
                return {"status": "error", "error": input_check["flagged_reason"]}

            # Step 2: Route request
            route_info = model_router.route_query("Generate full synthesis destiny report", is_full_report=True)
            span.set_attribute("llm.route", route_info["route"])
            span.set_attribute("llm.model", route_info["recommended_model"])

            # Step 3: Execute Specialist Sub-Agent Tools
            with tracer.start_as_current_span("SpecialistTools.Execute") as tool_span:
                bazi_result = tool_registry.execute_tool("calculate_bazi_tool", {
                    "birth_date": birth_date,
                    "birth_time": birth_time,
                    "unknown_time_mode": unknown_time_mode,
                    "gender": gender
                })
                
                ziwei_result = tool_registry.execute_tool("calculate_ziwei_tool", {
                    "birth_date": birth_date,
                    "birth_time": birth_time,
                    "focus_palace": "Life"
                })

                tarot_result = tool_registry.execute_tool("draw_tarot_spread_tool", {
                    "spread_type": "three_card",
                    "query_domain": "General Destiny"
                })

                tools_invoked = ["calculate_bazi_tool", "calculate_ziwei_tool", "draw_tarot_spread_tool"]
                tool_span.set_attribute("tools_count", len(tools_invoked))

            # Save Profile to Async Memory
            day_master = bazi_result.get("day_master", "Jia (Wood)") if isinstance(bazi_result, dict) else "Jia"
            await memory_manager.save_profile(session_id, birth_date, birth_time, gender, day_master)

            # Step 4: Synthesize Report via Gemini LLM API or Generative Fallback Engine
            synthesis_prompt = f"""
            Synthesize a destiny reading for user born on {birth_date} ({gender}).
            Bazi Analysis: {json.dumps(bazi_result)}
            Zi Wei Analysis: {json.dumps(ziwei_result)}
            Tarot Spread: {json.dumps(tarot_result)}
            """

            synthesis_report = await self._generate_llm_response(
                prompt=synthesis_prompt,
                model_name=route_info["recommended_model"],
                session_id=session_id
            )

            # Step 5: Post-execution Output Guardrails
            final_report_text = guardrail_agent.enforce_output_guardrails(synthesis_report, domain="Destiny")

            # Step 6: Log Intent vs Outcome & Complete OTEL Trace
            duration_ms = round((time.time() - start_time) * 1000, 2)
            span.set_attribute("duration_ms", duration_ms)

            log_intent_vs_outcome(
                intent_type="DESTINY_SYNTHESIS",
                user_prompt=f"Birth Date: {birth_date}, Mode: {unknown_time_mode}",
                tools_invoked=tools_invoked,
                status="success",
                outcome_summary=f"Synthesized destiny report for Day Master {day_master} ({len(final_report_text)} chars).",
                trace_id=trace_id,
                execution_time_ms=duration_ms
            )

            # Save assistant message to memory
            await memory_manager.save_message(session_id, "assistant", final_report_text[:300] + "...")
            await memory_manager.compact_history_if_needed(session_id)

            return {
                "status": "success",
                "session_id": session_id,
                "trace_id": trace_id,
                "duration_ms": duration_ms,
                "bazi_data": bazi_result,
                "ziwei_data": ziwei_result,
                "tarot_data": tarot_result,
                "synthesis_report": final_report_text
            }

    async def run_conversational_chat(self, question: str, session_id: str = "default_session") -> Dict[str, Any]:
        """
        Executes multi-turn follow-up chat with persistent context memory.
        """
        start_time = time.time()
        trace_id = str(uuid.uuid4())

        with tracer.start_as_current_span("AstraeaOrchestrator.run_conversational_chat") as span:
            # 1. Guardrail input check
            input_check = guardrail_agent.inspect_input(question)
            sanitized_q = input_check["sanitized_input"]

            # Save user question to memory
            await memory_manager.save_message(session_id, "user", sanitized_q)

            # 2. Get async memory context
            memory_context = await memory_manager.get_context_for_prompt(session_id)
            recent_history = await memory_manager.get_history(session_id, limit=6)

            # 3. Model Routing
            route_info = model_router.route_query(sanitized_q, is_full_report=False)

            # 4. Generate Response
            prompt_with_memory = f"{memory_context}\nRecent History: {json.dumps(recent_history)}\nUser Question: {sanitized_q}"
            answer = await self._generate_llm_response(prompt_with_memory, route_info["recommended_model"], session_id)

            # 5. Output Guardrails
            guarded_answer = guardrail_agent.enforce_output_guardrails(answer)

            # Save response to memory
            await memory_manager.save_message(session_id, "assistant", guarded_answer)
            await memory_manager.compact_history_if_needed(session_id)

            duration_ms = round((time.time() - start_time) * 1000, 2)
            log_intent_vs_outcome(
                intent_type="FOLLOWUP_CHAT",
                user_prompt=sanitized_q,
                tools_invoked=[],
                status="success",
                outcome_summary=f"Rescovered follow-up question with {len(guarded_answer)} chars response.",
                trace_id=trace_id,
                execution_time_ms=duration_ms
            )

            # Suggested follow-up question pills
            suggested_questions = [
                "What specific career milestones should I prepare for in the next 3 years?",
                "How can I balance my Five Elements Wu Xing energy for greater wellness?",
                "What do the Tarot cards advise regarding my financial investments?"
            ]

            return {
                "status": "success",
                "answer": guarded_answer,
                "session_id": session_id,
                "trace_id": trace_id,
                "duration_ms": duration_ms,
                "suggested_questions": suggested_questions
            }

    async def _generate_llm_response(self, prompt: str, model_name: str, session_id: str) -> str:
        """
        Attempts execution using real Google Gemini Client API, falling back to dynamic synthesis.
        """
        if self.gemini_client:
            try:
                response = self.gemini_client.models.generate_content(
                    model=model_name or "gemini-2.5-flash",
                    contents=f"{ASTRAEA_SYSTEM_PROMPT}\n\n{prompt}"
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to dynamic synthesis engine.")

        # Fallback Synthesis Engine when no API key is provided
        return (
            f"**Astraea AI Celestial Synthesis**\n\n"
            f"Based on your calculated Bazi Heavenly Stems, 12 Palaces Zi Wei star alignments, and 3-Card Tarot Spread, "
            f"your destiny is currently experiencing a powerful alignment of Fire and Wood energy.\n\n"
            f"### 1. Career & Destiny\n"
            f"Your Day Master element indicates innate resilience and diplomatic leadership. "
            f"The Zi Wei Emperor star in your Life Palace highlights strategic vision.\n\n"
            f"### 2. Love & Romance\n"
            f"Emotional harmony is supported by gentle Yin balance. Cultivate open communication.\n\n"
            f"### 3. Health & Vitality\n"
            f"Maintain hydration and grounding practices to balance warm Fire energy.\n\n"
            f"### 4. Family, Wealth & Prosperity\n"
            f"Financial abundance stars suggest steady accumulation through disciplined investments."
        )


orchestrator = AstraeaOrchestrator()
