import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InputForm from './components/InputForm';
import GeneralFateReport from './components/GeneralFateReport';
import ConversationalChat from './components/ConversationalChat';
import LogicTracesView from './components/LogicTracesView';

import { calculateBazi } from './utils/baziEngine';
import { calculateZiWei } from './utils/ziweiEngine';
import { drawTarotSpread } from './utils/tarotEngine';
import { synthesizeGeneralFateReport, answerFollowUpQuestion } from './utils/aiSynthesizer';

export default function App() {
  const [activeNav, setActiveNav] = useState('reading'); // 'reading' or 'traces'
  const [lang, setLang] = useState('en'); // 'en' or 'zh'

  const [baziData, setBaziData] = useState(null);
  const [ziweiData, setZiweiData] = useState(null);
  const [tarotData, setTarotData] = useState(null);
  const [reportData, setReportData] = useState(null);

  const [messages, setMessages] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [traces, setTraces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);

    try {
      const bazi = calculateBazi(formData.birthDate, formData.birthTime, formData.unknownTimeMode);
      setBaziData(bazi);

      const ziwei = calculateZiWei(formData.birthDate, bazi);
      setZiweiData(ziwei);

      const tarot = drawTarotSpread('three_card');
      setTarotData(tarot);

      const report = await synthesizeGeneralFateReport(bazi, ziwei, tarot, formData.focusMode, {
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        unknownTimeMode: formData.unknownTimeMode,
        gender: formData.gender,
      }, lang);
      setReportData(report);

      const welcomeMsg = {
        role: 'agent',
        text: lang === 'zh'
          ? `✨ Astraea AI 命理智能已根據您的 ${bazi.mode} 排出命盤。歡迎在下方追問關於事業、感情、健康或財運的任何命理問題！`
          : `✨ Astraea AI has analyzed your destiny matrix based on your ${bazi.mode}. Feel free to ask any follow-up questions about your career, love, health, or fortune below!`,
      };
      setMessages([welcomeMsg]);
      setSuggestedQuestions(report.suggestedQuestions || []);

      const baziTrace = {
        step: 'Tool Call: calculateBazi()',
        status: 'SUCCESS',
        latencyMs: 8,
        tokensUsed: 120,
        parameters: {
          date: formData.birthDate,
          time: formData.birthTime,
          mode: bazi.mode,
          dayMaster: bazi.dayMaster.name,
        },
      };

      const ziweiTrace = {
        step: 'Tool Call: calculateZiWei()',
        status: 'SUCCESS',
        latencyMs: 14,
        tokensUsed: 160,
        parameters: {
          palacesCount: ziwei.palaces.length,
          lifePalaceStar: ziwei.keyHighlights.lifePalace.primaryStar.name,
        },
      };

      setTraces([baziTrace, ziweiTrace, report.traceSpan].filter(Boolean));

    } catch (err) {
      console.error('Error calculating fate report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (questionText) => {
    if (!baziData || !ziweiData || !tarotData) return;

    const userMsg = { role: 'user', text: questionText };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await answerFollowUpQuestion(questionText, baziData, ziweiData, tarotData, lang);

      const agentMsg = { role: 'agent', text: response.answerText };
      setMessages((prev) => [...prev, agentMsg]);
      setSuggestedQuestions(response.suggestedQuestions || []);
      if (response.traceSpan) {
        setTraces((prev) => [response.traceSpan, ...prev]);
      }
    } catch (err) {
      console.error('Error processing follow-up question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-macaron-bg text-slate-800 font-sans flex flex-col md:flex-row">
      
      {/* Left Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        traceCount={traces.length}
        lang={lang}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header with Astraea AI & top-right language switcher button */}
        <Header lang={lang} setLang={setLang} />

        {/* Page Content */}
        <main className="p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {activeNav === 'reading' && (
            <>
              {/* Vertically Centered Input Form */}
              <InputForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
                isReportGenerated={!!reportData}
                lang={lang}
              />

              {/* Fate Report Output */}
              {reportData && (
                <GeneralFateReport
                  reportData={reportData}
                  baziData={baziData}
                  ziweiData={ziweiData}
                  tarotData={tarotData}
                  lang={lang}
                />
              )}

              {/* Conversational Follow-up Chat */}
              {reportData && (
                <ConversationalChat
                  messages={messages}
                  suggestedQuestions={suggestedQuestions}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  lang={lang}
                />
              )}
            </>
          )}

          {activeNav === 'traces' && (
            <LogicTracesView traces={traces} lang={lang} />
          )}

        </main>

      </div>

    </div>
  );
}
