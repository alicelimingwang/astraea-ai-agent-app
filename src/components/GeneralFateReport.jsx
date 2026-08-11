import React, { useState } from 'react';
import { Briefcase, Heart, Activity, Coins, Sparkles, Moon, Download, Check, FileText } from 'lucide-react';
import { generateAndDownloadDetailedReport } from '../utils/reportGenerator';

export default function GeneralFateReport({ reportData, baziData, ziweiData, tarotData }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!reportData) return null;

  const { overview, domains } = reportData;

  const domainIcons = {
    career: Briefcase,
    love: Heart,
    health: Activity,
    familyWealth: Coins,
  };

  const domainCardStyles = {
    career: 'bg-macaron-peach/60 border-rose-200 text-rose-900',
    love: 'bg-macaron-pink/60 border-rose-200 text-rose-900',
    health: 'bg-macaron-mint/60 border-emerald-200 text-emerald-900',
    familyWealth: 'bg-macaron-lavender/60 border-purple-200 text-purple-900',
  };

  const handleDownloadReport = () => {
    generateAndDownloadDetailedReport(baziData, ziweiData, tarotData, reportData);
  };

  return (
    <div className="macaron-card p-6 md:p-8 mb-8 border-rose-100 shadow-soft">
      
      {/* Top Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-macaron-rose text-rose-800 text-xs font-semibold mb-2">
            <Moon className="w-3.5 h-3.5 text-rose-500" />
            <span>Astraea Destiny Analysis</span>
          </span>
          <h3 className="font-serif font-bold text-xl text-slate-800">
            {overview.title}
          </h3>
        </div>

        {/* Tab Buttons & Download Action */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-rose-900 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Life Domains
            </button>
            <button
              onClick={() => setActiveTab('bazi')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'bazi'
                  ? 'bg-white text-rose-900 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bazi Pillars
            </button>
            <button
              onClick={() => setActiveTab('tarot')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'tarot'
                  ? 'bg-white text-rose-900 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tarot Spread
            </button>
          </div>

          {/* Download 5,000-Word Report Button */}
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs shadow-rose-glow flex items-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            title="Download full 5,000-word in-depth destiny analysis document"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Download Detailed Report (5,000 Words)</span>
          </button>

        </div>
      </div>

      {/* 4 LIFE DOMAINS VIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(domains).map(([key, domain]) => {
            const Icon = domainIcons[key] || Briefcase;
            const style = domainCardStyles[key];

            return (
              <div
                key={key}
                className={`p-5 rounded-xl border ${style} space-y-3 macaron-card-hover`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-white/90 shadow-sm">
                    <Icon className="w-4 h-4 text-rose-600" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-slate-800">
                    {domain.title}
                  </h4>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium italic">
                  "{domain.summary}"
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs text-slate-600 font-sans">
                  {domain.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BAZI PILLARS VIEW */}
      {activeTab === 'bazi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Year Pillar</p>
              <p className="text-lg font-serif font-bold text-slate-800 my-1">
                {baziData.yearPillar.stem.char} {baziData.yearPillar.branch.char}
              </p>
              <p className="text-slate-500">{baziData.yearPillar.stem.name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Month Pillar</p>
              <p className="text-lg font-serif font-bold text-slate-800 my-1">
                {baziData.monthPillar.stem.char} {baziData.monthPillar.branch.char}
              </p>
              <p className="text-slate-500">{baziData.monthPillar.stem.name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-macaron-rose border border-rose-200">
              <p className="text-[10px] uppercase font-bold text-rose-800">Day Pillar (Self)</p>
              <p className="text-lg font-serif font-bold text-rose-900 my-1">
                {baziData.dayPillar.stem.char} {baziData.dayPillar.branch.char}
              </p>
              <p className="text-rose-700 font-medium">{baziData.dayPillar.stem.name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Hour Pillar</p>
              {baziData.hourPillar ? (
                <>
                  <p className="text-lg font-serif font-bold text-slate-800 my-1">
                    {baziData.hourPillar.stem.char} {baziData.hourPillar.branch.char}
                  </p>
                  <p className="text-slate-500">{baziData.hourPillar.stem.name}</p>
                </>
              ) : (
                <p className="text-slate-400 py-2 italic">Omitted</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAROT SPREAD VIEW */}
      {activeTab === 'tarot' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs">
          {tarotData.cards.map((c, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-macaron-sky/60 border border-sky-200 space-y-2">
              <p className="text-[10px] uppercase font-semibold text-sky-800 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-600" />
                <span>{c.position}</span>
              </p>
              <div className="text-3xl">{c.card.image}</div>
              <h5 className="font-serif font-bold text-slate-800 text-sm">{c.card.name}</h5>
              <p className="text-slate-600 text-[11px]">"{c.card.keywords}"</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
