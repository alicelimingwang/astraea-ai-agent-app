import React from 'react';
import { Sparkles, Moon, Globe } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Header({ lang = 'en', setLang }) {
  const t = translations[lang] || translations.en;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-5 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Signature */}
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-macaron-rose text-rose-600 flex items-center justify-center font-bold shadow-sm">
              <Moon className="w-4 h-4 text-rose-500" />
            </div>
            <h1 className="font-serif font-bold text-xl text-slate-800 tracking-tight flex items-center gap-2 flex-wrap">
              <span>{t.brandTitle}</span>
              <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-macaron-rose text-rose-800 border border-rose-200/60 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>{t.subTitle}</span>
              </span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-1 font-sans hidden sm:block">
            {t.tagline}
          </p>
        </div>

        {/* Top Right Corner Language Switcher Button */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={() => setLang && setLang(lang === 'en' ? 'zh' : 'en')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-macaron-rose hover:text-rose-900 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all shadow-sm active:scale-95"
            title="Toggle Language / 切換語言"
            id="language-toggle-btn"
          >
            <Globe className="w-4 h-4 text-rose-500" />
            <span>{lang === 'en' ? '中文 (Chinese)' : 'English'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
