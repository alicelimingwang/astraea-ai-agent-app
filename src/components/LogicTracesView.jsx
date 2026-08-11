import React from 'react';
import { Activity, Terminal, Clock, Cpu, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

export default function LogicTracesView({ traces }) {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="macaron-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-macaron-mint text-emerald-800 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800">
              Agent Orchestration, Logic & Observability Spans
            </h3>
            <p className="text-xs text-slate-500">
              Real-time inspection of deterministic tool execution, parameters, latency, and LLM synthesis.
            </p>
          </div>
        </div>
      </div>

      {/* Traces List */}
      <div className="macaron-card p-6 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-600" />
          <span>Execution Spans ({traces.length})</span>
        </h4>

        {traces.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No execution spans logged yet. Submit a birth date in the "Destiny Reading" tab to trigger trace logging.
          </div>
        ) : (
          <div className="space-y-3">
            {traces.map((span, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">{span.step}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-sans font-semibold">
                    {span.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-sans">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{span.latencyMs} ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-purple-600" />
                    <span>{span.tokensUsed || 250} tokens</span>
                  </div>
                </div>

                {span.parameters && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-[10px] text-purple-900 overflow-x-auto">
                    <pre>{JSON.stringify(span.parameters, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
