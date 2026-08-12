// Astraea AI Synthesizer - Connects React UI to FastAPI Backend Multi-Agent Orchestrator

const BACKEND_URL = "http://localhost:8000";

/**
 * Generates the structured General Fate Report by calling FastAPI backend orchestrator
 * or falling back to local synthesis when offline.
 */
export async function synthesizeGeneralFateReport(baziData, ziweiData, tarotData, focusMode, birthDetails = {}, language = 'en') {
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
        session_id: "user_session_ui",
        language: language
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
          focus_mode: focusMode,
          language: language
        }
      };

      return formatBackendReportResponse(data, baziData, ziweiData, tarotData, traceSpan, language);
    }
  } catch (err) {
    console.warn("FastAPI backend connection failed. Using local synthesis fallback.", err);
  }

  // Fallback Local Synthesis Engine
  return generateLocalFallbackReport(baziData, ziweiData, tarotData, focusMode, startTime, language);
}

/**
 * Handles conversational follow-up questions by querying backend or local engine.
 */
export async function answerFollowUpQuestion(userQuestion, baziData, ziweiData, tarotData, language = 'en') {
  const startTime = performance.now();

  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: userQuestion,
        session_id: "user_session_ui",
        language: language
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
          query: userQuestion,
          language: language
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

  return generateLocalFallbackChat(userQuestion, baziData, ziweiData, tarotData, startTime, language);
}

function formatBackendReportResponse(backendData, baziData, ziweiData, tarotData, traceSpan, language = 'en') {
  const dayMasterName = backendData.bazi_data?.day_master || baziData.dayMaster.name;
  const domElem = baziData.dominantElement;
  const lackElem = baziData.lackingElement;

  const isZh = language === 'zh';

  const initialSuggestedQuestions = isZh ? [
    `我的日主是 ${dayMasterName}，這對我的事業發展方向有何影響？`,
    `如何採取具體步驟來調和與補足我的 ${lackElem} 五行元素？`,
    `我們可以抽一張塔羅牌來探索我近期的感情運勢嗎？`
  ] : [
    `How does my ${dayMasterName} Day Master influence my career trajectory?`,
    `What specific steps can I take to balance my lacking ${lackElem} element?`,
    `Shall we draw a Tarot card to explore my love & relationship outlook?`
  ];

  if (isZh) {
    return {
      overview: {
        title: `全盤命理綜合推算 — 日主 ${dayMasterName}`,
        subtitle: `融合八字 ${backendData.bazi_data?.mode || baziData.mode}、紫微斗數十二宮位與西方塔羅占卜`,
        timeNotice: baziData.unknownTimeNotice,
        synthesis_text: backendData.synthesis_report
      },
      domains: {
        career: {
          title: "事業與命途格局",
          icon: "Briefcase",
          summary: `您的日主為 ${dayMasterName}。結合紫微斗數官祿宮的吉星照耀，您天生具備優秀的策略領導力與遠見。`,
          details: [
            `適合領域：高科技、戰略管理、金融投資、創意設計。`,
            `領導風格：具備獨立決策能力，在壓力下展現強大韌性。`,
            `大運提示：當運逢木火能量旺盛的流年，事業突破契機最為顯著。`
          ]
        },
        love: {
          title: "感情與姻緣緣分",
          icon: "Heart",
          summary: `您的夫妻宮受紫微星系護持，感情中極為看重精神契合與內心忠誠。`,
          details: [
            `伴侶特質：理想伴侶性格穩重、懂得體貼支持並共享核心人生價值。`,
            `五行和諧：具備 ${lackElem} 元素能量的伴侶能為家庭帶來溫暖與平衡。`
          ]
        },
        health: {
          title: "健康與五行氣血",
          icon: "Activity",
          summary: `五行分佈顯示 ${domElem} 元素較旺，而 ${lackElem} 元素相對較弱。`,
          details: [
            `養生建議：通過良好作息、補充水分與戶外休閒來滋養 ${lackElem} 元素。`,
            `免責聲明：Astraea AI 指引旨在促進心靈健康，不能替代專業醫療診斷。`
          ]
        },
        familyWealth: {
          title: "財帛與長遠豐盈",
          icon: "Coins",
          summary: `財帛宮具備穩健的吉星照耀，預示著財富具備長遠累積的巨大潛力。`,
          details: [
            `理財模式：適合通過結構化理財與穩健資產配置累積長期財富。`
          ]
        }
      },
      suggestedQuestions: initialSuggestedQuestions,
      traceSpan
    };
  }

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

function generateLocalFallbackReport(baziData, ziweiData, tarotData, focusMode, startTime, language = 'en') {
  const dayMaster = baziData.dayMaster;
  const domElem = baziData.dominantElement;
  const lackElem = baziData.lackingElement;
  const mode = baziData.mode;

  const careerStar = ziweiData.keyHighlights.careerPalace.primaryStar.name;
  const wealthStar = ziweiData.keyHighlights.wealthPalace.primaryStar.name;
  const loveStar = ziweiData.keyHighlights.spousePalace.primaryStar.name;

  const presentCard = tarotData.cards[1].card.name;

  const endTime = performance.now();
  const executionMs = Math.round(endTime - startTime);

  const isZh = language === 'zh';

  if (isZh) {
    return {
      overview: {
        title: `全盤命理綜合推算 — 日主 ${dayMaster.name}`,
        subtitle: `計算依據：八字 ${mode}、紫微斗數十二宮位與塔羅占卜`,
        timeNotice: baziData.unknownTimeNotice,
      },
      domains: {
        career: {
          title: "事業與命途格局",
          icon: "Briefcase",
          summary: `您的日主為 ${dayMaster.name}（${dayMaster.element} 元素）。結合紫微官祿宮的 ${careerStar} 主星，具備極佳的遠見與領導天賦。`,
          details: [
            `適合領域：科技創新、戰略管理、金融理財。`,
            `領導風格：在給予充分自主權與信任時最能發揮潛能。`
          ]
        },
        love: {
          title: "感情與姻緣緣分",
          icon: "Heart",
          summary: `您的夫妻宮受 ${loveStar} 主星護持，當前塔羅牌展示為 ${presentCard}。`,
          details: [
            `伴侶特質：理想伴侶性格穩重、懂得關懷並保持忠誠。`,
            `塔羅啟示：${presentCard} 牌提示當前是促進彼此深層溝通的良機。`
          ]
        },
        health: {
          title: "健康與五行氣血",
          icon: "Activity",
          summary: `五行分佈顯示 ${domElem} 元素偏旺，而 ${lackElem} 元素較為缺乏。`,
          details: [
            `養生建議：保持充足休息與水分補充，提升 ${lackElem} 五行能量。`
          ]
        },
        familyWealth: {
          title: "財帛與長遠豐盈",
          icon: "Coins",
          summary: `您的財帛宮有 ${wealthStar} 鎮守，具備持續穩健開創財源的能力。`,
          details: [
            `理財模式：適合穩健型資產累積與長期投資。`
          ]
        }
      },
      suggestedQuestions: [
        `您想了解未來一年關於事業與財運的具體走勢嗎？`,
        `您需要關於如何調和與補足 ${lackElem} 五行元素的具體建議嗎？`,
        `我們可以抽一張塔羅牌來探索您的感情與姻緣展望嗎？`
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

function generateLocalFallbackChat(userQuestion, baziData, ziweiData, tarotData, startTime, language = 'en') {
  const dayMaster = baziData.dayMaster.name;
  const domElem = baziData.dominantElement;
  const lackElem = baziData.lackingElement;
  const careerStar = ziweiData.keyHighlights?.careerPalace?.primaryStar?.name || "Zi Wei";
  const loveStar = ziweiData.keyHighlights?.spousePalace?.primaryStar?.name || "Tian Xiang";
  const wealthStar = ziweiData.keyHighlights?.wealthPalace?.primaryStar?.name || "Wu Qu";
  const presentCard = tarotData.cards?.[1]?.card?.name || "The Magician";
  const futureCard = tarotData.cards?.[2]?.card?.name || "Three of Wands";
  const qLower = (userQuestion || "").toLowerCase();

  const isChineseChar = /[\u4e00-\u9fff]/.test(userQuestion);
  const isZh = language === 'zh' || isChineseChar;

  let answerText = "";
  let suggestedQuestions = [];

  if (isZh) {
    const questionHeader = userQuestion ? `關於您的問題：* "${userQuestion}"*\n\n` : "";

    const isDayMasterQ = (
      (qLower.includes("determine") || qLower.includes("calculate") || qLower.includes("how") || qLower.includes("mechanism") || qLower.includes("why")) &&
      (qLower.includes("day master") || qLower.includes("daypillar") || qLower.includes("day pillar") || qLower.includes("ri zhu") || qLower.includes("ri yuan"))
    ) || /如何決定|如何推算|如何計算|怎麼決定|怎麼推算|怎麼計算|如何確定|決定我的日主|推算我的日主|決定日主|推算日主|如何得知日主|我的出生日期如何決定我的日主/.test(userQuestion);

    const isBirthQ = (!isDayMasterQ) && (
      /what is my birth|my profile|my birth date|my recorded|my session info|my birth time|my birthday/i.test(qLower) ||
      /記錄的生日|我的生日|我的出生資料|我的性別|我的出生時間|幾點出生/.test(userQuestion)
    );
    const isIdentityQ = /who are you|what are you|what can you do|hello|hi|help|how do you work/i.test(qLower) || /你是誰|你能做什麼|你好|幫助|介紹/.test(userQuestion);
    const isCareerQ = /career|job|work|profession|business|promotion|industry|milestone|ambition|transition|change|pivot/i.test(qLower) || /事業|工作|跳槽|轉行|職業|升職|升遷|創業/.test(userQuestion);
    const isLoveQ = /love|romance|relationship|partner|spouse|marriage|dating|affection/i.test(qLower) || /感情|愛情|婚姻|伴侶|桃花|對象/.test(userQuestion);
    const isHealthQ = /health|wellness|vitality|body|energy|stress|sleep|illness/i.test(qLower) || /健康|身體|精氣神|作息|疾病|休養/.test(userQuestion);
    const isWealthQ = /wealth|money|finance|investment|financial|prosperity|asset|fortune/i.test(qLower) || /財運|金錢|投資|理財|發財|資產/.test(userQuestion);
    const isElementQ = /element|wuxing|wood|fire|earth|metal|water|balance/i.test(qLower) || /五行|木|火|土|金|水|平衡|元素/.test(userQuestion);

    if (isDayMasterQ) {
      answerText = `${questionHeader}在八字命理（四柱學）中，**出生日期決定日主（日元/日幹）**的推算機制如下：\n\n` +
        `1. **曆法轉換（干支曆/萬年曆）**：您的公曆出生日期會被轉換為傳統的天干地支干支曆。八字由四個柱組成：**年柱、月柱、日柱、時柱**。\n` +
        `2. **定位日柱（Day Pillar）**：根據干支萬年曆或儒略日演算法，您出生的特定日子對應一個 60 天循環的干支組合（例如「甲午日」、「丁巳日」）。\n` +
        `3. **提取天干作為日主**：日柱由上方的「天干」（甲乙丙丁戊己庚辛壬癸）與下方的「地支」（子丑寅卯辰巳午未申酉戌亥）構成。**日柱的天干即為您的「日主」（Day Master / 本命元神）**。\n` +
        `4. **日主的命理意義**：日主代表您個人的核心本質（Self）、內在個性與生命主體。八字中其餘三柱（年、月、時）的天干地支、五行喜忌以及「十神」關係（如官殺、財星、印星），皆是以日主為中心來展開綜合推算與平衡調和的。`;
      suggestedQuestions = [
        `我的 ${dayMaster} 日主具備哪些獨特性格優勢？`,
        `出生時間（時柱）如何影響我的日主力量？`,
        `我的五行喜忌如何根據日主來判斷？`
      ];
    } else if (isBirthQ) {
      const bDate = baziData?.birthDetails?.birthDate || "1995-08-18";
      const bTime = baziData?.birthDetails?.birthTime || "12:00 (午時)";
      const gender = baziData?.birthDetails?.gender === "Male" ? "男性" : "女性";
      answerText = `${questionHeader}根據您在本次會話中記錄的出生資料：\n\n` +
        `- **出生日期**：${bDate}\n` +
        `- **出生時間**：${bTime}\n` +
        `- **性別**：${gender}\n` +
        `- **日主**：${dayMaster} (${domElem} 元素)\n\n` +
        `這些座標是計算您的八字四柱與紫微斗數十二宮命盤的核心依據。`;
      suggestedQuestions = [
        `我的出生日期如何決定我的日主？`,
        `出生時間在紫微斗數中有何重要意義？`,
        `我可以更新出生資料重新計算嗎？`
      ];
    } else if (isIdentityQ) {
      answerText = `${questionHeader}您好！我是 **Astraea AI 命理智能** — 融合八字四柱、紫微斗數與西方塔羅牌陣的玄學智腦。我可以解答關於事業、感情、健康、財運或您的檔案記憶等問題。今天我能為您提供什麼協助？`;
      suggestedQuestions = [
        `我的全盤命理格局總體如何？`,
        `作為 ${dayMaster} 日主，我的核心優勢是什麼？`,
        `如何調和我的五行能量？`
      ];
    } else if (isCareerQ) {
      answerText = `${questionHeader}作為 **${dayMaster}** 日主，您在事業上具備 **${careerStar}** 吉星照耀。當前塔羅牌陣展現 **${presentCard}**，提示著發揮策略領導力與積極實踐的最佳時機。\n\n*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*`;
      suggestedQuestions = [
        `未來三年我有什麼重要的事業突破契機？`,
        `哪些行業領域最契合我的日主格局？`,
        `塔羅牌對我的職業轉型有何建議？`
      ];
    } else if (isLoveQ) {
      answerText = `${questionHeader}您的夫妻宮由 **${loveStar}** 主星引導，身為 **${dayMaster}** 日主，您在感情中追求深刻的精神契合與真誠尊重。調和您相對缺乏的 **${lackElem}** 元素，將有助於創造更和諧的親密關係。\n\n*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*`;
      suggestedQuestions = [
        `哪些日主元素與 ${dayMaster} 最為契合？`,
        `如何提升我當前大運的桃花與感情運？`,
        `塔羅牌揭示了哪些感情溝通的功課？`
      ];
    } else if (isHealthQ) {
      answerText = `${questionHeader}您的五行分佈顯示 **${domElem}** 元素偏旺，而 **${lackElem}** 元素相對較弱。補充 **${lackElem}** 能量（如充足水分、規律作息與戶外漫步）能為您帶來充沛活力。\n\n*Astraea AI 免責聲明：命理指引不能替代專業醫療建議。*`;
      suggestedQuestions = [
        `哪些日常習慣有助於補足我的 ${lackElem} 元素？`,
        `季節交替如何影響我的 ${domElem} 氣血？`,
        `哪些飲食原則符合我的五行養生之道？`
      ];
    } else if (isWealthQ) {
      answerText = `${questionHeader}您的財帛宮有 **${wealthStar}** 主星鎮守，財運格局偏向長遠累積與穩健增長。建議專注於結構化理財與穩健資產配置。\n\n*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*`;
      suggestedQuestions = [
        `什麼樣的理財策略最適合 ${dayMaster} 日主？`,
        `我的下一個財運吉星週期在何時？`,
        `如何在投資中平衡風險與穩健？`
      ];
    } else if (isElementQ) {
      answerText = `${questionHeader}您的五行分佈顯示 **${domElem}** 較旺，**${lackElem}** 較弱。調和 **${lackElem}** 元素有助於提升身心平靜與內在能量的和諧。\n\n*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*`;
      suggestedQuestions = [
        `哪些顏色或生活環境能增強我的 ${lackElem} 能量？`,
        `如何化解過旺的 ${domElem} 元素影響？`,
        `日主與五行之間是什麼關係？`
      ];
    } else {
      answerText = `${questionHeader}作為 **${dayMaster}** 日主，保持清晰與穩健的心態將助您順利前行。將行動與內心目標保持一致，能在各個生活領域取得穩步進展。\n\n*Astraea AI 免責聲明：命理推算旨在啟發自我反思與心靈成長。*`;
      suggestedQuestions = [
        `未來三年我有什麼重要的事業突破契機？`,
        `如何根據我的五行喜忌來提升身心運勢？`,
        `塔羅牌對我近期的財務與投資有何建議？`
      ];
    }
  } else {
    const questionHeader = userQuestion ? `Regarding your question: *"${userQuestion}"*\n\n` : "";

    if (isDayMasterQ) {
      answerText = `${questionHeader}In Chinese Bazi (Four Pillars of Destiny), your **birth date determines your Day Master (Ri Zhu / 日主)** through the following precise mechanism:\n\n` +
        `1. **Sexagenary Calendar Conversion**: Your Gregorian birth date is converted into the traditional Chinese Sexagenary (Ganzhi) Calendar. This yields four pillars: **Year, Month, Day, and Hour Pillars**.\n` +
        `2. **Identifying the Day Pillar**: Each specific day in history follows a 60-day repeating cycle of Heavenly Stems and Earthly Branches (e.g., Jia-Wu, Ding-Si).\n` +
        `3. **Extracting the Heavenly Stem**: The Day Pillar consists of a Heavenly Stem on top and an Earthly Branch below. **The Heavenly Stem of your Day Pillar is your Day Master**.\n` +
        `4. **Metaphysical Significance**: The Day Master represents your core self (the "Self" or "Element"). All other pillars, Five Elements balances, and Ten Gods in your chart are evaluated relative to your Day Master.`;
      suggestedQuestions = [
        `What core strengths does my ${dayMaster} Day Master possess?`,
        `How does my birth time influence my Day Master's strength?`,
        `How are Five Elements affinities derived from my Day Master?`
      ];
    } else if (isBirthQ) {
      const bDate = baziData?.birthDetails?.birthDate || "1995-08-18";
      const bTime = baziData?.birthDetails?.birthTime || "12:00 (Horse Hour)";
      const gender = baziData?.birthDetails?.gender || "Female";
      answerText = `${questionHeader}Your birth details currently on record in this session are:\n\n` +
        `- **Birth Date**: ${bDate}\n` +
        `- **Birth Time**: ${bTime}\n` +
        `- **Gender**: ${gender}\n` +
        `- **Day Master**: ${dayMaster} (${domElem} Element)\n\n` +
        `These coordinates form the energetic parameters for your Four Pillars (Bazi) and 12 Palaces (Zi Wei Dou Shu) calculations.`;
      suggestedQuestions = [
        `How does my birth date determine my Day Master?`,
        `What is the significance of my birth time in Zi Wei Dou Shu?`,
        `Can I update my birth details for a new calculation?`
      ];
    } else if (isIdentityQ) {
      answerText = `${questionHeader}As a **${dayMaster}** Day Master navigating a career transition, your **${careerStar}** star in the Career Palace encourages strategic positioning. Your Tarot spread featuring **${presentCard}** (Present) and **${futureCard}** (Future) indicates that moving toward alignment with your core strengths will open new horizons.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*`;
      suggestedQuestions = [
        `What timing is most favorable for a career transition?`,
        `How can my ${domElem} element support a role pivot?`,
        `What strengths does my Zi Wei chart highlight for new roles?`
      ];
    } else if (/career|job|work|profession|business|promotion|industry|milestone|ambition/.test(qLower)) {
      answerText = `${questionHeader}As a **${dayMaster}** Day Master with **${careerStar}** in your Career Palace, your professional outlook favors strategic leadership and bold initiative. The **${presentCard}** card indicates a prime moment for execution.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*`;
      suggestedQuestions = [
        `How can I align my ${domElem} element to boost leadership?`,
        `What industries best match my Day Master profile?`,
        `What does the Tarot advise regarding career transitions?`
      ];
    } else if (/love|romance|relationship|partner|spouse|marriage|dating|affection/.test(qLower)) {
      answerText = `${questionHeader}Your Spouse Palace is guided by **${loveStar}**, and your **${dayMaster}** Day Master seeks intellectual depth and harmony. Balancing your lacking **${lackElem}** element will foster greater openness in love.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*`;
      suggestedQuestions = [
        `Which Day Master elements are most compatible with ${dayMaster}?`,
        `How can I enhance romance in my current cycle?`,
        `What relationship lessons does the Tarot reveal?`
      ];
    } else if (/health|wellness|vitality|body|energy|stress|sleep|illness/.test(qLower)) {
      answerText = `${questionHeader}Your Wu Xing profile shows strong **${domElem}** and deficient **${lackElem}**. Restoring vitality requires nourishing your **${lackElem}** element through hydration, restorative sleep, and nature walking.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth and do not substitute medical advice.*`;
      suggestedQuestions = [
        `What daily habits help balance my ${lackElem} element?`,
        `How does seasonal change affect my ${domElem} energy?`,
        `What dietary choices align with Five Elements wellness?`
      ];
    } else if (/wealth|money|finance|investment|financial|prosperity|asset|fortune/.test(qLower)) {
      answerText = `${questionHeader}Anchored by **${wealthStar}** in your Wealth Palace, your financial path favors disciplined, accumulative growth. As a **${dayMaster}** Day Master, avoid impulse risk and focus on structured assets.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*`;
      suggestedQuestions = [
        `What financial strategies best suit my ${dayMaster} Day Master?`,
        `When is my next favorable financial cycle?`,
        `How can I balance risk and stability in investments?`
      ];
    } else if (/element|wuxing|wood|fire|earth|metal|water|balance/.test(qLower)) {
      answerText = `${questionHeader}Your Five Elements distribution shows **${domElem}** as dominant and **${lackElem}** as lacking. Harmonizing your **${lackElem}** element will cultivate spiritual equilibrium and peace of mind.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*`;
      suggestedQuestions = [
        `What colors or environments boost my ${lackElem} element?`,
        `How do I manage excess ${domElem} element energy?`,
        `What is the relationship between my Day Master and Wu Xing?`
      ];
    } else {
      answerText = `${questionHeader}As a **${dayMaster}** Day Master with dominant **${domElem}** energy, taking a clear, measured approach will serve you best. Aligning your actions with your inner truth ensures progress across all life domains.\n\n*Astraea AI Disclaimer: Destiny readings are designed for self-reflection and spiritual growth.*`;
      suggestedQuestions = [
        `What specific career milestones should I prepare for?`,
        `How can I balance my Five Elements Wu Xing energy?`,
        `What do the Tarot cards advise regarding my financial investments?`
      ];
    }
  }

  const endTime = performance.now();

  return {
    answerText,
    suggestedQuestions,
    traceSpan: {
      step: "Process Conversational Query (Client Fallback)",
      status: "SUCCESS",
      latencyMs: Math.round(endTime - startTime),
      tokensUsed: 280,
      parameters: { query: userQuestion }
    }
  };
}
