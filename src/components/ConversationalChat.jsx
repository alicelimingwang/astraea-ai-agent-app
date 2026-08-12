import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Moon, HelpCircle } from 'lucide-react';
import { translations } from '../utils/translations';

export default function ConversationalChat({ messages, suggestedQuestions, onSendMessage, isLoading, lang = 'en' }) {
  const t = translations[lang] || translations.en;
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestedQuestions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleSuggestionClick = (qText) => {
    if (isLoading) return;
    onSendMessage(qText);
  };

  return (
    <div className="macaron-card p-6 md:p-8 shadow-soft border-rose-100">
      
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
        <Moon className="w-4 h-4 text-rose-500" />
        <h3 className="font-serif font-bold text-base text-slate-800">
          {t.askFollowUp}
        </h3>
      </div>

      {/* Messages */}
      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-2 mb-4 text-xs font-sans">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'agent' && (
              <div className="w-7 h-7 rounded-xl bg-macaron-rose text-rose-700 flex items-center justify-center shrink-0 font-bold border border-rose-200">
                <Bot className="w-4 h-4 text-rose-600" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-rose-500 text-white rounded-tr-none shadow-sm'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-rose-600 italic">
            <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
            <span>Consulting Astraea AI...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTED QUESTION PILLS */}
      {suggestedQuestions && suggestedQuestions.length > 0 && (
        <div className="mb-4 pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.suggestedFollowUps}</span>
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((qText, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(qText)}
                disabled={isLoading}
                className="text-xs px-3.5 py-1.5 rounded-full bg-macaron-rose text-rose-900 hover:bg-rose-200 border border-rose-200/80 transition-all text-left flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-rose-500 shrink-0" />
                <span>{qText}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.askPlaceholder}
          disabled={isLoading}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-2.5 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="absolute right-2 p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-40 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
}
