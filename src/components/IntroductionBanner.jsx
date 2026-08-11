import React from 'react';
import { Sparkles, Moon, Compass, HeartHandshake, Eye } from 'lucide-react';

export default function IntroductionBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel p-6 md:p-8 mb-8 border border-celestial-gold/30 shadow-gold-glow">
      
      {/* Decorative celestial background elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Metaphysical Fortune Counseling</span>
        </div>

        <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight gold-gradient-text mb-3">
          Unlock Your Destiny Matrix with Celestia AI
        </h2>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
          Celestia AI is a high-precision fortune-telling intelligence that combines 
          <strong className="text-amber-300 font-semibold"> Bazi Four Pillars of Destiny</strong>, 
          <strong className="text-purple-300 font-semibold"> Zi Wei Dou Shu 12 Palaces</strong>, and 
          <strong className="text-cyan-300 font-semibold"> Tarot Card Divination</strong>. 
          Provide your birth date to receive an exhaustive general fate report across 
          <span className="text-amber-200"> Career</span>, <span className="text-rose-300"> Love</span>, <span className="text-emerald-300"> Health</span>, and <span className="text-amber-300"> Family & Wealth</span>, then engage in interactive follow-up counseling.
        </p>

        {/* Capability Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-100">Bazi Charting</p>
              <p className="text-[11px] text-slate-400">4 or 3 Pillars + Wu Xing</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300">
            <Moon className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-100">Zi Wei Dou Shu</p>
              <p className="text-[11px] text-slate-400">12 Palaces & Star Matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300">
            <Eye className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-100">Tarot Divination</p>
              <p className="text-[11px] text-slate-400">3-Card Guidance Spread</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-300">
            <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-slate-100">Interactive Chat</p>
              <p className="text-[11px] text-slate-400">Contextual Q&A + Suggestions</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
