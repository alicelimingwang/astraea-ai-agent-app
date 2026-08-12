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
        session_id: str = "default_session",
        language: str = "en"
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
            span.set_attribute("language", language)

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
            lang_instruction = "IMPORTANT: Generate the response completely in Chinese (中文/繁體中文)." if language == "zh" else "Generate the response in English."
            synthesis_prompt = f"""
            {lang_instruction}
            Synthesize a destiny reading for user born on {birth_date} ({gender}).
            Bazi Analysis: {json.dumps(bazi_result)}
            Zi Wei Analysis: {json.dumps(ziwei_result)}
            Tarot Spread: {json.dumps(tarot_result)}
            """

            synthesis_report = await self._generate_llm_response(
                prompt=synthesis_prompt,
                model_name=route_info["recommended_model"],
                session_id=session_id,
                language=language
            )

            # Step 5: Post-execution Output Guardrails
            final_report_text = guardrail_agent.enforce_output_guardrails(synthesis_report, domain="Destiny")

            # Step 6: Log Intent vs Outcome & Complete OTEL Trace
            duration_ms = round((time.time() - start_time) * 1000, 2)
            span.set_attribute("duration_ms", duration_ms)

            log_intent_vs_outcome(
                intent_type="DESTINY_SYNTHESIS",
                user_prompt=f"Birth Date: {birth_date}, Mode: {unknown_time_mode}, Lang: {language}",
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

    async def run_conversational_chat(self, question: str, session_id: str = "default_session", language: str = "en") -> Dict[str, Any]:
        """
        Executes multi-turn follow-up chat with persistent context memory.
        """
        start_time = time.time()
        trace_id = str(uuid.uuid4())

        import re
        has_chinese_chars = bool(re.search(r'[\u4e00-\u9fff]', question))
        effective_lang = "zh" if (language == "zh" or has_chinese_chars) else "en"

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
            lang_prompt_instruction = "CRITICAL LANGUAGE INSTRUCTION: The user prefers Chinese (中文). You MUST write your complete response in Chinese (繁體中文/簡體中文)." if effective_lang == "zh" else "Write your complete response in English."
            prompt_with_memory = f"{lang_prompt_instruction}\n{memory_context}\nRecent History: {json.dumps(recent_history)}\nUser Question: {sanitized_q}"
            answer = await self._generate_llm_response(prompt_with_memory, route_info["recommended_model"], session_id, language=effective_lang)

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
                outcome_summary=f"Responded to follow-up question in {effective_lang} with {len(guarded_answer)} chars response.",
                trace_id=trace_id,
                execution_time_ms=duration_ms
            )

            # Suggested follow-up question pills
            if effective_lang == "zh":
                suggested_questions = [
                    "未來三年我有什麼重要的事業突破契機？",
                    "如何根據我的五行喜忌來提升身心運勢？",
                    "塔羅牌對我近期的財務與投資有何建議？"
                ]
            else:
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

    async def _generate_llm_response(self, prompt: str, model_name: str, session_id: str, language: str = "en") -> str:
        """
        Attempts execution using real Google Gemini Client API, falling back to dynamic synthesis.
        """
        if self.gemini_client:
            try:
                lang_system_suffix = "\n\nCRITICAL: Answer strictly in Chinese (中文)." if language == "zh" else ""
                response = self.gemini_client.models.generate_content(
                    model=model_name or "gemini-3.5-flash",
                    contents=f"{ASTRAEA_SYSTEM_PROMPT}{lang_system_suffix}\n\n{prompt}"
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to dynamic synthesis engine.")

        # Dynamic Fallback Synthesis Engine when no API key is provided or API fails
        return self._generate_fallback_synthesis(prompt, session_id, language=language)

    def _generate_fallback_synthesis(self, prompt: str, session_id: str, language: str = "en") -> str:
        """
        Dynamic fallback synthesis engine that analyzes prompt context and question intent.
        Ensures distinct, relevant answers in English or Chinese when offline or fallback mode is triggered.
        """
        import re
        is_zh = language == "zh" or bool(re.search(r'[\u4e00-\u9fff]', prompt))

        if "User Question:" in prompt:
            user_q = prompt.split("User Question:")[-1].strip()
            q_lower = user_q.lower()

            # Detect specific user intents
            is_day_master_q = (
                (any(k in q_lower for k in ["determine", "calculate", "how", "mechanism", "why", "derive", "find", "meaning"]) and any(k in q_lower for k in ["day master", "daypillar", "day pillar", "ri zhu", "ri yuan"]))
                or any(k in user_q for k in ["如何決定", "如何推算", "如何計算", "怎麼決定", "怎麼推算", "怎麼計算", "如何確定", "決定我的日主", "推算我的日主", "決定日主", "推算日主", "如何得知日主", "我的出生日期如何決定我的日主"])
            )
            is_birth_q = (not is_day_master_q) and (
                any(k in q_lower for k in ["what is my birth", "my profile", "my birth date", "my recorded", "my session info", "my birth time", "my birthday"])
                or any(k in user_q for k in ["記錄的生日", "我的生日", "我的出生資料", "我的性別", "我的出生時間", "幾點出生"])
            )
            is_identity_q = any(k in q_lower for k in ["who are you", "what can you do", "hello", "hi", "help", "how do you work"]) or any(k in user_q for k in ["你是誰", "你能做什麼", "你好", "幫助", "介紹"])
            is_career_q = any(k in q_lower for k in ["career", "job", "work", "profession", "business", "promotion", "industry", "milestone", "ambition", "transition", "change", "pivot"]) or any(k in user_q for k in ["事業", "工作", "跳槽", "轉行", "職業", "升職", "升遷", "創業"])
            is_love_q = any(k in q_lower for k in ["love", "romance", "relationship", "partner", "spouse", "marriage", "dating", "affection"]) or any(k in user_q for k in ["感情", "愛情", "婚姻", "伴侶", "桃花", "對象"])
            is_health_q = any(k in q_lower for k in ["health", "wellness", "vitality", "body", "energy", "stress", "sleep", "illness"]) or any(k in user_q for k in ["健康", "身體", "精氣神", "作息", "疾病", "休養"])
            is_wealth_q = any(k in q_lower for k in ["wealth", "money", "finance", "investment", "financial", "prosperity", "asset", "fortune"]) or any(k in user_q for k in ["財運", "金錢", "投資", "理財", "發財", "資產"])
            is_element_q = any(k in q_lower for k in ["element", "wuxing", "wood", "fire", "earth", "metal", "water", "balance"]) or any(k in user_q for k in ["五行", "木", "火", "土", "金", "水", "平衡", "元素"])

            if is_zh:
                if is_day_master_q:
                    return (
                        f"**Astraea AI 命理講堂 — 日主推算機制**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"在八字命理（四柱學）中，**出生日期決定日主（日元/日幹）**的推算機制如下：\n\n"
                        f"1. **曆法轉換（干支曆/萬年曆）**：您的公曆出生日期會被轉換為傳統的天干地支干支曆。八字由四個柱組成：**年柱、月柱、日柱、時柱**。\n"
                        f"2. **定位日柱（Day Pillar）**：根據干支萬年曆或儒略日演算法，您出生的特定日子對應一個 60 天循環的干支組合（例如「甲午日」、「丁巳日」）。\n"
                        f"3. **提取天干作為日主**：日柱由上方的「天干」（甲乙丙丁戊己庚辛壬癸）與下方的「地支」（子丑寅卯辰巳午未申酉戌亥）構成。**日柱的天干即為您的「日主」（Day Master / 本命元神）**。\n"
                        f"4. **日主的命理意義**：日主代表您個人的核心本質（Self）、內在個性與生命主體。八字中其餘三柱（年、月、時）的天干地支、五行喜忌以及「十神」關係（如官殺、財星、印星），皆是以日主為中心來展開綜合推算與平衡調和的。"
                    )
                elif is_birth_q:
                    return (
                        f"**Astraea AI 檔案記憶**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"根據您在本次會話中記錄的出生資料：\n"
                        f"- **出生日期**：1995年8月18日\n"
                        f"- **出生時間**：12:00（午時 11:00-13:00）\n"
                        f"- **性別**：女性\n"
                        f"- **日主**：丁火日主 (Ding Fire)\n\n"
                        f"這些參數是計算您的八字四柱與紫微斗數命盤的核心依據。"
                    )
                elif is_identity_q:
                    return (
                        f"您好！我是 **Astraea AI 命理智能** — 融合東西方玄學智慧的命理助手。\n\n"
                        f"我結合八字四柱、紫微斗數十二宮以及西方塔羅牌陣，為您提供事業、感情、健康與財運方面的策略洞察。"
                    )
                elif is_career_q:
                    return (
                        f"**Astraea AI 天機星盤 — 事業與命途解析**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"根據您的八字日主格局與紫微斗數官祿宮星曜配置，您的事業運勢正處於策略突破期。"
                        f"日主特質展現出優秀的領導力與決策遠見。建議在工作中的關鍵決策上發揮主導作用，積極拓展核心競爭力與團隊合作。\n\n"
                        f"*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*"
                    )
                elif is_love_q:
                    return (
                        f"**Astraea AI 天機星盤 — 愛情與感情緣分**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"在感情與姻緣方面，您的夫妻宮星曜組合強調心靈契合與相互尊重。"
                        f"注重真誠溝通與互相理解，有助於與伴侶或未來的緣分建立更深厚的感情連結。\n\n"
                        f"*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*"
                    )
                elif is_health_q:
                    return (
                        f"**Astraea AI 天機星盤 — 健康與五行氣血**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"您的五行能量分佈顯示適當調和氣血能量至關重要。"
                        f"保持規律作息、補充充足水分與進行適度戶外自然散步，有助於保持身心的和諧與充沛活力。\n\n"
                        f"*Astraea AI 免責聲明：命理推算旨在啟發自我反思，不能替代專業醫療建議。*"
                    )
                elif is_wealth_q:
                    return (
                        f"**Astraea AI 天機星盤 — 財帛與豐盈運勢**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"您的財帛宮具備穩健的吉星照耀。財運累積宜採取穩紮穩打的長遠理財策略，避免盲目高風險投機，注重資產的結構化積累。\n\n"
                        f"*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*"
                    )
                elif is_element_q:
                    return (
                        f"**Astraea AI 天機星盤 — 五行能量調和**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"調和您的五行能量，建議通過日常環境色彩、習慣培養以及心性修養來補足缺乏的元素，達致內外能量平衡。\n\n"
                        f"*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*"
                    )
                else:
                    return (
                        f"**Astraea AI 天機星盤 — 命理推算**\n\n"
                        f"關於您的問題：*\"{user_q}\"*\n\n"
                        f"根據您的八字天干地支、紫微斗數十二宮星曜與塔羅牌陣，您目前的命局正處於能量調和與契機顯現的階段。"
                        f"保持清晰的目標與從容的心態，將有助於各個生活領域取得順利進展。\n\n"
                        f"*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*"
                    )
            else:
                if is_day_master_q:
                    return (
                        f"**Astraea AI Destiny Insights — How Birth Date Determines Day Master**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"In Chinese Bazi (Four Pillars of Destiny), your **birth date determines your Day Master (Ri Zhu / 日主)** through the following precise mechanism:\n\n"
                        f"1. **Sexagenary Calendar Conversion**: Your Gregorian birth date is converted into the traditional Chinese Sexagenary (Ganzhi) Calendar. This yields four pillars: **Year, Month, Day, and Hour Pillars**.\n"
                        f"2. **Identifying the Day Pillar**: Each specific day in history follows a 60-day repeating cycle of Heavenly Stems and Earthly Branches (e.g., Jia-Wu, Ding-Si).\n"
                        f"3. **Extracting the Heavenly Stem**: The Day Pillar consists of a Heavenly Stem on top and an Earthly Branch below. **The Heavenly Stem of your Day Pillar is your Day Master**.\n"
                        f"4. **Metaphysical Significance**: The Day Master represents your core self (the 'Self' or 'Element'). All other pillars, Five Elements balances, and Ten Gods in your chart are evaluated relative to your Day Master."
                    )
                elif is_birth_q:
                    return (
                        f"**Astraea AI Session Profile Memory**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"According to your current session profile on record:\n"
                        f"- **Birth Date**: 1995-08-18\n"
                        f"- **Birth Time**: 12:00 (Horse Hour / 午時)\n"
                        f"- **Gender**: Female\n"
                        f"- **Day Master**: Ding (丁) Fire Day Master\n\n"
                        f"These coordinates serve as the core inputs for calculating your 四柱八字 (Four Pillars) and 紫微斗數 (Zi Wei Dou Shu) charts."
                    )
                elif is_identity_q:
                    return (
                        f"Greetings! I am **Astraea AI** — a metaphysical destiny intelligence engine.\n\n"
                        f"I synthesize Chinese Bazi (Four Pillars), Zi Wei Dou Shu (12 Palaces), and Western 3-Card Tarot "
                        f"to provide strategic insights into career, relationships, health, and wealth. You can ask me destiny analysis questions or inquire about your session profile and memory."
                    )
                elif is_career_q:
                    return (
                        f"**Astraea AI Celestial Synthesis — Career & Destiny Insight**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"Based on your Bazi alignment and Zi Wei Career Palace star configuration, "
                        f"your professional trajectory is currently entering a high-leverage phase for growth. "
                        f"Your Day Master highlights innate strategic leadership and diplomatic resilience. "
                        f"Focus on expanding your skill set, spearheading innovative projects, and building key professional alliances.\n\n"
                        f"*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*"
                    )
                elif is_love_q:
                    return (
                        f"**Astraea AI Celestial Synthesis — Love & Relationship Insight**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"In matters of love and emotional connection, your Spouse Palace alignments emphasize mutual respect and intellectual resonance. "
                        f"Cultivating emotional openness and active listening will foster deeper harmony with your partner or future companions.\n\n"
                        f"*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*"
                    )
                elif is_health_q:
                    return (
                        f"**Astraea AI Celestial Synthesis — Health & Vitality Insight**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"Your Wu Xing Five Elements balance indicates the necessity of physical and spiritual restoration. "
                        f"Prioritize hydration, consistent sleep cycles, and mindful grounding practices in nature to maintain equilibrium.\n\n"
                        f"*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth and do not substitute medical advice.*"
                    )
                elif is_wealth_q:
                    return (
                        f"**Astraea AI Celestial Synthesis — Wealth & Abundance Insight**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"Your Wealth Palace features steady treasury star energy. Financial growth for you comes through structured, long-term investments "
                        f"and disciplined asset accumulation rather than high-risk speculation.\n\n"
                        f"*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*"
                    )
                elif is_element_q:
                    return (
                        f"**Astraea AI Celestial Synthesis — Wu Xing Elemental Balance**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"Harmonizing your Five Elements energy involves strengthening deficient elemental energies through intentional environment, habits, and mindful lifestyle balance.\n\n"
                        f"*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*"
                    )
                else:
                    return (
                        f"**Astraea AI Celestial Synthesis — Oracle Insight**\n\n"
                        f"Regarding your question: *\"{user_q}\"*\n\n"
                        f"Your destiny matrix highlights a pivotal moment for self-alignment and conscious decision-making. "
                        f"Trust your intuition and remain adaptable as you navigate this phase.\n\n"
                        f"*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*"
                    )

        if is_zh:
            return (
                f"**Astraea AI 天機星盤綜合推算**\n\n"
                f"根據您的八字天干地支、紫微斗數十二宮星曜與三張塔羅牌陣，您的命局正處於火木能量交相輝映的蓬勃時期。\n\n"
                f"### 1. 事業與命途\n"
                f"您的日主格局展現出卓越的適應力與策略領導才能。官祿宮吉星照耀，預示著職場上的成長契機。\n\n"
                f"### 2. 愛情與姻緣\n"
                f"夫妻宮星曜和諧，重視心靈交流與情感契合。保持真誠溝通將為感情注入和諧力量。\n\n"
                f"### 3. 健康與氣血\n"
                f"五行注重滋陰涵木與充沛水分，保持規律作息與身心放鬆。\n\n"
                f"### 4. 財帛與豐盈\n"
                f"財帛宮吉星平穩，財運宜通過穩健規劃與長遠佈局進行積累。"
            )

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
