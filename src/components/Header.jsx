import React from 'react';
import { Sparkles, Moon } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-5 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Signature */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-macaron-rose text-rose-600 flex items-center justify-center font-bold shadow-sm">
              <Moon className="w-4 h-4 text-rose-500" />
            </div>
            <h1 className="font-serif font-bold text-xl text-slate-800 tracking-tight flex items-center gap-2">
              <span>Astraea AI</span>
              <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-macaron-rose text-rose-800 border border-rose-200/60 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Bazi • Zi Wei • Tarot</span>
              </span>
            </h1>
          </div>

          {/* 2-Sentence Signature Tagline */}
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed mt-1 font-sans">
            Where ancient cosmic wisdom meets modern artificial intelligence. Discover the hidden threads of your destiny across career, love, health, and fortune.
          </p>
        </div>

      </div>
    </header>
  );
}
