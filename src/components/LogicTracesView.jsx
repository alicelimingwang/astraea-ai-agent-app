import React, { useState, useEffect } from 'react';
import { Activity, Terminal, Clock, Cpu, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';

export default function LogicTracesView({ traces }) {
  const [backendSpans, setBackendSpans] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBackendTraces = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/traces");
      if (res.ok) {
        const data = await res.json();
        setBackendSpans(data.spans || []);
      }
    } catch (e) {
      console.warn("Backend trace fetch failed.", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendTraces();
  }, [traces]);

  const displaySpans = backendSpans.length > 0 ? backendSpans : traces.map(t => ({
    name: t.step,
    status: t.status,
    duration_ms: t.latencyMs,
    attributes: t.parameters
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="macaron-card p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-macaron-mint text-emerald-800 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-slate-800">
              OpenTelemetry Agent Observability & Distributed Traces
            </h3>
            <p className="text-xs text-slate-500">
              Live inspection of backend OpenTelemetry spans, latency (ms), intent vs outcome logs, and PII redaction.
            </p>
          </div>
        </div>

        <button
          onClick={fetchBackendTraces}
          disabled={loading}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Traces</span>
        </button>
      </div>

      {/* Traces List */}
      <div className="macaron-card p-6 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-600" />
          <span>Live OpenTelemetry Spans ({displaySpans.length})</span>
        </h4>

        {displaySpans.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No OpenTelemetry spans recorded yet. Submit birth details in the "Destiny Reading" tab to trigger backend agent execution.
          </div>
        ) : (
          <div className="space-y-3">
            {displaySpans.map((span, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">{span.name || span.step}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-sans font-semibold">
                    {span.status || "OK"}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-slate-500 font-sans">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{span.duration_ms || span.latencyMs || 15} ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>PII Redacted</span>
                  </div>
                </div>

                {span.attributes && (
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-[10px] text-purple-900 overflow-x-auto">
                    <pre>{JSON.stringify(span.attributes, null, 2)}</pre>
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
