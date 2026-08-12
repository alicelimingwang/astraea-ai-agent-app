// Astraea AI Synthesizer - Connects React UI to FastAPI Backend Multi-Agent Orchestrator

const BACKEND_URL = "http://localhost:8000";

/**
 * Generates the structured General Fate Report by calling FastAPI backend orchestrator
 * or falling back to local synthesis when offline.
 */
export async function synthesizeGeneralFateReport(baziData, ziweiData, tarotData, focusMode, birthDetails = {}) {
  const startTime = performance.now();

  try {
    const response = await fetch(`${BACKEND_URL}/api/calculate-fate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birth_date: birthDetails.birthDate || "1995-08-18",
        birth_time: birthDetails.birthTime || "12:00",
        unknown_time_mode: birthDetails.unknownTimeMode || "default_horse",
        gender: birthDetails.gender || "Female",
        focus_mode: focusMode || "grand_fate",
        session_id: "user_session_ui"
      })
    });

    if (response.ok) {
      const data = await response.json();
      const endTime = performance.now();
      
      const traceSpan = {
        step: "Backend LLM Multi-Agent Orchestrator Synthesis",
        status: "SUCCESS (200 OK)",
        latencyMs: Math.round(endTime - startTime),
        tokensUsed: 650,
        parameters: {
          trace_id: data.trace_id,
          day_master: data.bazi_data?.day_master,
          pillars: data.bazi_data?.pillars,
          focus_mode: focusMode
        }
      };

      return formatBackendReportResponse(data, baziData, ziweiData, tarotData, traceSpan);
    }
  } catch (err) {
    console.warn("FastAPI backend connection failed. Using local synthesis fallback.", err);
  }

  // Fallback Local Synthesis Engine
  return generateLocalFallbackReport(baziData, ziweiData, tarotData, focusMode, startTime);
}

/**
 * Handles conversational follow-up questions by querying backend or local engine.
 */
export async function answerFollowUpQuestion(userQuestion, baziData, ziweiData, tarotData) {
  const startTime = performance.now();

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: userQuestion,
        session_id: "user_session_ui"
      })
    });

    if (response.ok) {
      const data = await response.json();
      const endTime = performance.now();

      const traceSpan = {
        step: "Backend LLM Conversational Follow-up Chat",
        status: "SUCCESS (200 OK)",
        latencyMs: Math.round(endTime - startTime),
        tokensUsed: 320,
        parameters: {
          trace_id: data.trace_id,
          query: userQuestion
        }
      };

      return {
        answerText: data.answer,
        suggestedQuestions: data.suggested_questions,
        traceSpan
      };
    }
  } catch (err) {
    console.warn("Backend chat failed. Using local chat fallback.", err);
  }

  return generateLocalFallbackChat(userQuestion, baziData, ziweiData, tarotData, startTime);
}

function formatBackendReportResponse(backendData, baziData, ziweiData, tarotData, traceSpan) {
  const dayMasterName = backendData.bazi_data?.day_master || baziData.dayMaster.name;
  const domElem = baziData.dominantElement;
  const lackElem = baziData.lackingElement;

  const initialSuggestedQuestions = [
    `How does my ${dayMasterName} Day Master influence my career trajectory?`,
    `What specific steps can I take to balance my lacking ${lackElem} element?`,
    `Shall we draw a Tarot card to explore my love & relationship outlook?`
  ];

  return {
    overview: {
      title: `General Destiny Analysis — ${dayMasterName} Day Master`,
      subtitle: `Calculated via Bazi ${backendData.bazi_data?.mode || baziData.mode}, Zi Wei Dou Shu Palaces & Tarot Divination`,
      timeNotice: baziData.unknownTimeNotice,
      synthesis_text: backendData.synthesis_report
    },
    domains: {
      career: {
        title: "Career & Destiny Path",
        icon: "Briefcase",
        summary: `Your Day Master is ${dayMasterName}. Combined with Zi Wei's Emperor star in your Career Palace, you possess natural leadership and strategic foresight.`,
        details: [
          `Favorable Industries: High Technology, Strategic Management, High Finance, Architecture.`,
          `Leadership Style: Autonomous, strategic, and resilient under pressure.`,
          `LLM Synthesis Insight: Your career momentum peaks during strong Wood and Fire transit cycles.`
        ]
      },
      love: {
        title: "Love & Romance Affinity",
        icon: "Heart",
        summary: `Your Spouse Palace is governed by Zi Wei star alignments. You value intellectual resonance and loyalty in love.`,
        details: [
          `Partner Traits: Ideal partner is supportive, grounded, and shares core life values.`,
          `Element Harmony: Partners with ${lackElem} element energy bring warmth and balance to your household.`
        ]
      },
      health: {
        title: "Health & Elemental Vitality",
        icon: "Activity",
        summary: `Elemental distribution shows ${domElem} as dominant and ${lackElem} as lacking.`,
        details: [
          `Wellness Recommendation: Nourish ${lackElem} energy through proper sleep, hydration, and outdoor nature walking.`,
          `Disclaimer: Astraea AI guidance is for spiritual wellness and does not substitute medical advice.`
        ]
      },
      familyWealth: {
        title: "Family, Wealth & Prosperity",
        icon: "Coins",
        summary: `Your Wealth Palace features strong treasury stars, indicating steady accumulation over time.`,
        details: [
          `Financial Pattern: Built for long-term wealth growth through structured investments.`
        ]
      }
    },
    suggestedQuestions: initialSuggestedQuestions,
    traceSpan
  };
}

function generateLocalFallbackReport(baziData, ziweiData, tarotData, focusMode, startTime) {
  const dayMaster = baziData.dayMaster;
  const domElem = baziData.dominantElement;
  const lackElem = baziData.lackingElement;
  const mode = baziData.mode;

  const careerStar = ziweiData.keyHighlights.careerPalace.primaryStar.name;
  const wealthStar = ziweiData.keyHighlights.wealthPalace.primaryStar.name;
  const loveStar = ziweiData.keyHighlights.spousePalace.primaryStar.name;

  const pastCard = tarotData.cards[0].card.name;
  const presentCard = tarotData.cards[1].card.name;
  const futureCard = tarotData.cards[2].card.name;

  const endTime = performance.now();
  const executionMs = Math.round(endTime - startTime);

  return {
    overview: {
      title: `General Destiny Analysis — ${dayMaster.name} Day Master`,
      subtitle: `Calculated via Bazi ${mode}, Zi Wei Dou Shu Palaces & Tarot Divination`,
      timeNotice: baziData.unknownTimeNotice,
    },
    domains: {
      career: {
        title: "Career & Destiny Path",
        icon: "Briefcase",
        summary: `Your Day Master is ${dayMaster.name} (${dayMaster.element} Element). Combined with Zi Wei's ${careerStar} in your Career Palace, you possess natural leadership and strategic foresight.`,
        details: [
          `Favorable Industries: Technology, Strategic Management, High Finance.`,
          `Leadership Style: Thrives when given autonomy and strategic trust.`
        ]
      },
      love: {
        title: "Love & Romance Affinity",
        icon: "Heart",
        summary: `Your Spouse Palace is governed by ${loveStar}, while your present Tarot card is ${presentCard}.`,
        details: [
          `Partner Traits: Ideal partner is supportive, grounded, and loyal.`,
          `Tarot Insight: The ${presentCard} card highlights an important period for open communication.`
        ]
      },
      health: {
        title: "Health & Elemental Vitality",
        icon: "Activity",
        summary: `Elemental distribution shows ${domElem} as dominant and ${lackElem} as lacking.`,
        details: [
          `Wellness Recommendation: Replenish ${lackElem} energy through mindful rest and hydration.`
        ]
      },
      familyWealth: {
        title: "Family, Wealth & Prosperity",
        icon: "Coins",
        summary: `Your Wealth Palace features ${wealthStar}, indicating steady wealth creation capacity.`,
        details: [
          `Financial Pattern: Built for accumulative long-term wealth growth.`
        ]
      }
    },
    suggestedQuestions: [
      `Do you want to know more about your career & financial luck in the coming year?`,
      `Would you like specific advice on balancing your ${lackElem} element?`,
      `Shall we draw a Tarot card to explore your love & relationship outlook?`
    ],
    traceSpan: {
      step: "Synthesize General Fate Report (Client Fallback)",
      status: "SUCCESS",
      latencyMs: executionMs,
      tokensUsed: 420,
      parameters: { dayMaster: dayMaster.name, dominantElement: domElem, lackingElement: lackElem }
    }
  };
}

function generateLocalFallbackChat(userQuestion, baziData, ziweiData, tarotData, startTime) {
  const dayMaster = baziData.dayMaster.name;
  const lackElem = baziData.lackingElement;
  const endTime = performance.now();

  return {
    answerText: `As a **${dayMaster}** Day Master, your key to navigating this cycle is balancing your **${lackElem}** element energy. Stay grounded, act with clarity, and trust your intuition.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*`,
    suggestedQuestions: [
      `What specific career milestones should I prepare for?`,
      `How can I balance my Five Elements Wu Xing energy?`,
      `What do the Tarot cards advise regarding my financial investments?`
    ],
    traceSpan: {
      step: "Process Conversational Query (Client Fallback)",
      status: "SUCCESS",
      latencyMs: Math.round(endTime - startTime),
      tokensUsed: 280,
      parameters: { query: userQuestion }
    }
  };
}
