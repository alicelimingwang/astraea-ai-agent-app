import React from 'react';
import { Moon, Compass, Activity, Sparkles, Eye } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Sidebar({ activeNav, setActiveNav, traceCount, lang = 'en' }) {
  const t = translations[lang] || translations.en;

  return (
    <aside className="w-full md:w-60 bg-white border-r border-slate-200/60 p-5 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-macaron-rose text-rose-600 flex items-center justify-center font-bold shadow-sm">
            <Moon className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base text-slate-800 tracking-tight">
              Astraea AI
            </h1>
            <p className="text-[11px] text-slate-500 font-sans flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-400" />
              <span>{t.destinyOracle}</span>
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5 text-xs font-medium">
          <button
            onClick={() => setActiveNav('reading')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              activeNav === 'reading'
                ? 'bg-macaron-rose text-rose-900 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-rose-500" />
            <span>{t.destinyReading}</span>
          </button>

          <button
            onClick={() => setActiveNav('traces')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
              activeNav === 'traces'
                ? 'bg-macaron-lavender text-purple-900 font-semibold shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>{t.logicTraces}</span>
            </div>
            {traceCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-bold">
                {traceCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center gap-1.5 text-rose-600 font-medium">
          <Eye className="w-3.5 h-3.5" />
          <span>{t.metaphysics}</span>
        </div>
      </div>
    </aside>
  );
}
