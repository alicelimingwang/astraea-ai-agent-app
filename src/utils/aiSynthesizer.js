// AI Synthesis Engine & Contextual Follow-up Generator

/**
 * Generates the structured General Fate Report combining Bazi, Zi Wei, and Tarot insights.
 */
export function synthesizeGeneralFateReport(baziData, ziweiData, tarotData, focusMode) {
  const startTime = performance.now();

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

  // Domain 1: Career & Destiny
  const careerReport = {
    title: "Career & Destiny Path",
    icon: "Briefcase",
    summary: `Your Day Master is ${dayMaster.name} (${dayMaster.element} Element). Combined with Zi Wei's ${careerStar} in your Career Palace, you possess natural leadership, strategic foresight, and strong resilience under pressure.`,
    details: [
      `Favorable Industries: Industries aligned with ${domElem} & Metal (e.g. Technology, Strategic Management, High Finance, Architecture).`,
      `Leadership Style: You thrive best when given autonomy. The presence of ${careerStar} grants you diplomatic charisma and high problem-solving instincts.`,
      `Key Advice: ${mode.includes('3-Pillars') ? 'Note: Without Hour Pillar, focus on long-term skill acquisition rather than hasty career switches.' : 'Your peak career momentum arrives during mid-life transit cycles (Ages 32-45).'}`
    ]
  };

  // Domain 2: Love & Relationships
  const loveReport = {
    title: "Love & Romance Affinity",
    icon: "Heart",
    summary: `Your Spouse Palace is governed by ${loveStar}, while your present Tarot card is ${presentCard}. In relationships, you value intellectual resonance, loyalty, and emotional stability over fleeting passions.`,
    details: [
      `Partner Traits: Your ideal partner is supportive, grounded, and shares your core life values.`,
      `Element Harmony: Since your chart is strong in ${domElem} and seeks ${lackElem}, partners with prominent ${lackElem} element energy will bring deep harmony and warmth to your household.`,
      `Tarot Insight: The ${presentCard} card highlights an important period for open communication and setting healthy romantic boundaries.`
    ]
  };

  // Domain 3: Health & Vitality
  const healthReport = {
    title: "Health & Elemental Vitality",
    icon: "Activity",
    summary: `In Traditional Chinese Medicine metaphysics, your elemental balance shows ${domElem} (${baziData.wuxingDistribution[domElem]}%) as dominant and ${lackElem} (${baziData.wuxingDistribution[lackElem]}%) as lacking.`,
    details: [
      `Organ System Focus: Pay attention to organ systems associated with ${lackElem} (e.g., Water = Kidneys/Immunity, Fire = Heart/Circulation, Wood = Liver/Nerves, Earth = Digestive, Metal = Lungs/Respiratory).`,
      `Wellness Recommendation: Incorporate subtle lifestyle adjustments (meditation, balanced diet, hydration, outdoor nature walking) to replenish your ${lackElem} energy.`,
      `Energy Guidance: Avoid overworking during season changes when elemental transitions are strongest.`
    ]
  };

  // Domain 4: Family, Wealth & Fortune
  const familyWealthReport = {
    title: "Family, Wealth & Prosperity",
    icon: "Coins",
    summary: `Your Wealth Palace features ${wealthStar}, indicating a solid wealth creation capacity that grows steadily over time through structured investments and familial support.`,
    details: [
      `Financial Pattern: You are built for accumulative, long-term wealth rather than speculative gambling. Asset holding (real estate, index funds) serves you best.`,
      `Family Bonds: You play a protective pillar role within your family circle, often sought out for practical advice during major family decisions.`,
      `Tarot Future Outlook: The ${futureCard} card promises eventual fulfillment and financial security as long as you maintain consistent discipline.`
    ]
  };

  const endTime = performance.now();
  const executionMs = Math.round(endTime - startTime);

  // Suggested Follow-up Questions after initial report
  const initialSuggestedQuestions = [
    `Do you want to know more about your career & financial luck in the coming year?`,
    `Would you like specific advice on balancing your ${lackElem} element for health & love?`,
    `Shall we draw a Tarot card to explore your love & relationship outlook for the next 6 months?`,
    `How does my Day Master (${dayMaster.name}) influence my decision-making style?`
  ];

  const traceSpan = {
    step: "Synthesize General Fate Report",
    status: "SUCCESS",
    latencyMs: executionMs,
    tokensUsed: 420,
    parameters: {
      dayMaster: dayMaster.name,
      dominantElement: domElem,
      lackingElement: lackElem,
      mode: mode,
      stars: [careerStar, wealthStar, loveStar],
      tarotCards: [pastCard, presentCard, futureCard]
    }
  };

  return {
    overview: {
      title: `General Destiny Analysis — ${dayMaster.name} Day Master`,
      subtitle: `Calculated via Bazi ${mode}, Zi Wei Dou Shu Palaces & Tarot Divination`,
      timeNotice: baziData.unknownTimeNotice,
    },
    domains: {
      career: careerReport,
      love: loveReport,
      health: healthReport,
      familyWealth: familyWealthReport,
    },
    suggestedQuestions: initialSuggestedQuestions,
    traceSpan,
  };
}

/**
 * Handles conversational follow-up questions from the user and returns
 * answer + new contextual suggested questions.
 */
export function answerFollowUpQuestion(userQuestion, baziData, ziweiData, tarotData) {
  const startTime = performance.now();
  const qLower = userQuestion.toLowerCase();

  let answerText = "";
  let newSuggestions = [];

  const dayMaster = baziData.dayMaster.name;
  const lackElem = baziData.lackingElement;

  if (qLower.includes("career") || qLower.includes("work") || qLower.includes("job") || qLower.includes("financial") || qLower.includes("coming year")) {
    answerText = `Regarding your career and financial path: As a **${dayMaster}** Day Master, the coming cycle brings favorable opportunities for structured expansion. Your Zi Wei Career Palace star (${ziweiData.keyHighlights.careerPalace.primaryStar.name}) indicates that taking on leadership responsibilities or upgrading your technical skillsets will yield high financial returns. Avoid high-risk speculative ventures; focus on high-leverage professional projects.`;
    newSuggestions = [
      `What specific months in 2026 are most favorable for career growth?`,
      `Would you like a 3-card Tarot reading specifically for a job or business decision?`,
      `How can I improve my workplace relationships using my Five Elements balance?`
    ];
  } else if (qLower.includes("love") || qLower.includes("relationship") || qLower.includes("marriage") || qLower.includes("partner")) {
    answerText = `In love and romantic harmony: Your Spouse Palace contains **${ziweiData.keyHighlights.spousePalace.primaryStar.name}**, suggesting that mutual respect, shared core values, and open communication are your romantic anchors. If you are single, emotional resonance will spark through social networks or professional collaborations. If attached, spending quality unhurried time together will deepen your bond.`;
    newSuggestions = [
      `What personality traits should I look for in an ideal long-term partner?`,
      `Shall we draw a Tarot guidance card for your relationship outlook?`,
      `How does my lacking ${lackElem} element affect my romantic communication?`
    ];
  } else if (qLower.includes("health") || qLower.includes("vitality") || qLower.includes("energy")) {
    answerText = `On health and elemental vitality: Your chart's lowest element is **${lackElem}**. In traditional wellness metaphysics, nourishing your ${lackElem} energy through proper sleep hygiene, hydration, stress management, and light outdoor exercise will stabilize your physical stamina and mental focus.`;
    newSuggestions = [
      `What daily habits or colors can help replenish my ${lackElem} element?`,
      `Do you want to check your health palace stars in Zi Wei Dou Shu?`,
      `Would you like advice on maintaining work-life balance for the coming months?`
    ];
  } else if (qLower.includes("tarot") || qLower.includes("card") || qLower.includes("draw")) {
    const freshSpread = [
      "The Star (Upright) — Hope, inspiration, and renewed faith in your journey.",
      "Two of Cups (Upright) — Deep emotional harmony and fruitful partnership.",
      "Ten of Pentacles (Upright) — Long-term stability, family prosperity, and lasting legacy."
    ];
    answerText = `I have drawn a fresh 3-card Tarot spread for your inquiry:\n\n1. **${freshSpread[0]}**\n2. **${freshSpread[1]}**\n3. **${freshSpread[2]}**\n\nThe cards suggest that taking patient, aligned action today will lead to high emotional and practical fulfillment.`;
    newSuggestions = [
      `Do you want to know how this Tarot card reading connects to your Bazi Day Master?`,
      `Would you like to ask a specific Yes/No question for the cards?`,
      `Shall we look into your general luck forecast for the next 3 years?`
    ];
  } else {
    answerText = `Based on your **${dayMaster}** Day Master and Zi Wei star alignments, every challenge you face contains the seed of an breakthrough. By balancing your **${baziData.dominantElement}** and **${baziData.lackingElement}** elements, you align your personal rhythm with natural cosmic timing. Stay grounded, act with clarity, and trust your intuition.`;
    newSuggestions = [
      `Do you want to know more about your career & financial growth in the coming year?`,
      `Would you like advice on how to improve your love & relationship harmony?`,
      `Shall we draw a Tarot card to explore your next major life step?`
    ];
  }

  const endTime = performance.now();
  const executionMs = Math.round(endTime - startTime);

  const traceSpan = {
    step: "Process Conversational Query",
    status: "SUCCESS",
    latencyMs: executionMs,
    tokensUsed: 280,
    parameters: {
      query: userQuestion,
      intentCategory: qLower.includes("career") ? "CAREER" : qLower.includes("love") ? "LOVE" : "GENERAL",
    }
  };

  return {
    answerText,
    suggestedQuestions: newSuggestions,
    traceSpan,
  };
}
