import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Sparkles, Moon, ArrowRight } from 'lucide-react';
import { translations } from '../utils/translations';

export default function InputForm({ onSubmit, isLoading, isReportGenerated, lang = 'en' }) {
  const t = translations[lang] || translations.en;

  const [birthDate, setBirthDate] = useState('1996-08-18');
  const [birthTime, setBirthTime] = useState('14:30');
  const [isUnknownTime, setIsUnknownTime] = useState(false);
  const [unknownTimeMode, setUnknownTimeMode] = useState('default_horse');
  const [gender, setGender] = useState('Female');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!birthDate) return;

    onSubmit({
      birthDate,
      birthTime: isUnknownTime ? 'unknown' : birthTime,
      unknownTimeMode,
      gender,
      calendarType: 'Gregorian',
      focusMode: 'grand_fate',
    });
  };

  return (
    <div className={`w-full transition-all duration-500 ${
      !isReportGenerated ? 'min-h-[60vh] flex flex-col justify-center items-center py-8' : ''
    }`}>
      
      <div className="macaron-card p-6 md:p-8 w-full max-w-2xl shadow-soft border-rose-100 relative overflow-hidden">
        
        {/* Subtle Mystical Background Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-macaron-rose/60 rounded-full blur-2xl pointer-events-none" />
        
        {/* Card Header */}
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-macaron-rose text-rose-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-slate-800 flex items-center gap-2">
              <span>{t.enterBirthDetails}</span>
              <span className="text-[10px] font-sans text-rose-600 bg-macaron-rose px-2 py-0.5 rounded-full">
                {t.gregorianCalendar}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              {t.formSubtitle}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Birth Date Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <span>{t.dateOfBirth}</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
              />
            </div>

            {/* Birth Time Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <span>{t.timeOfBirth}</span>
                </label>
                
                <label className="flex items-center gap-1.5 text-xs text-rose-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnknownTime}
                    onChange={(e) => setIsUnknownTime(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-200"
                  />
                  <span>{t.timeUnknown}</span>
                </label>
              </div>

              {!isUnknownTime ? (
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all"
                />
              ) : (
                <div className="w-full bg-macaron-peach/80 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{t.unknownModeNotice}</span>
                </div>
              )}
            </div>

          </div>

          {/* Unknown Time Options */}
          {isUnknownTime && (
            <div className="p-4 rounded-xl bg-macaron-peach/60 border border-rose-200 space-y-2 text-xs">
              <p className="font-semibold text-rose-900 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-rose-500" />
                <span>{t.hourPillarOptions}</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  unknownTimeMode === 'default_horse'
                    ? 'bg-white border-rose-300 font-medium text-slate-900 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="unknown_time_mode"
                      value="default_horse"
                      checked={unknownTimeMode === 'default_horse'}
                      onChange={() => setUnknownTimeMode('default_horse')}
                      className="text-rose-600"
                    />
                    <span>Default to Peak Solar Hour (11:00 AM - 1:00 PM)</span>
                  </div>
                </label>

                <label className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  unknownTimeMode === 'three_pillars'
                    ? 'bg-white border-rose-300 font-medium text-slate-900 shadow-sm'
                    : 'bg-slate-50/80 border-slate-200 text-slate-600'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="unknown_time_mode"
                      value="three_pillars"
                      checked={unknownTimeMode === 'three_pillars'}
                      onChange={() => setUnknownTimeMode('three_pillars')}
                      className="text-rose-600"
                    />
                    <span>Use 3-Pillars Mode (Year, Month, Day)</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Gender & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
            
            <div className="w-full sm:w-auto flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700">Gender:</span>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-xs shadow-rose-glow flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Consulting Astraea Metaphysics...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Reveal General Fate Report</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>

          </div>

        </form>
      </div>

    </div>
  );
}
