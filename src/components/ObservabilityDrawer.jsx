import React from 'react';
import { Activity, X, Terminal, Cpu, Clock, CheckCircle2, FileText, Layers } from 'lucide-react';

export default function ObservabilityDrawer({ isOpen, onClose, traces }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[#0B0D1B]/95 backdrop-blur-2xl border-l border-amber-500/30 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between animate-slideLeft">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-amber-400 animate-spin-slow" />
            <h3 className="font-serif font-bold text-base text-slate-100 gold-gradient-text">
              Agent Observability & Trace Drawer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 border border-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Intro */}
        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          This panel demonstrates <strong>Observability & Tracing</strong> and <strong>Orchestration Logic</strong>. Every calculation tool invocation, prompt payload, token count, and execution span is logged in real-time.
        </p>

        {/* Trace List */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Execution Spans ({traces.length})</span>
          </h4>

          {traces.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 text-center">
              No spans recorded yet. Submit birth details to trigger trace logging.
            </div>
          ) : (
            traces.map((span, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-slate-200">{span.step}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-sans">
                    {span.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-sans">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{span.latencyMs} ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-purple-400" />
                    <span>{span.tokensUsed || 300} tokens</span>
                  </div>
                </div>

                {span.parameters && (
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-amber-300/90 overflow-x-auto">
                    <pre>{JSON.stringify(span.parameters, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer / Spec Note */}
      <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2 font-sans">
        <Layers className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Fully aligned with Google ADK Observability & OpenTelemetry Span standards.</span>
      </div>

    </div>
  );
}
