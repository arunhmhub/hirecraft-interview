import React, { useState } from 'react';
import { 
  Network, 
  Layers, 
  Database, 
  Cpu, 
  ShieldAlert, 
  Activity, 
  Check, 
  Copy,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface SystemDesignViewProps {
  topics: string[];
  experienceLevel: string;
}

export const SystemDesignView: React.FC<SystemDesignViewProps> = ({ topics, experienceLevel }) => {
  const [selectedTopicIdx, setSelectedTopicIdx] = useState<number>(0);
  const [copiedTopic, setCopiedTopic] = useState<number | null>(null);

  const activeTopic = topics[selectedTopicIdx] || topics[0] || 'System Architecture';

  const copyTopic = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTopic(idx);
    setTimeout(() => setCopiedTopic(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <span>System Design & Architecture Topics ({topics.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Tailored to the data scale, domain requirements, and infrastructure challenges in this job description.
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono">
          {experienceLevel} Calibration
        </span>
      </div>

      {/* Main Grid: Left Topics List, Right Architecture Blueprint */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Topic Selector */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block px-1">
            Focus Architecture Scenarios:
          </span>
          {topics.map((topic, idx) => {
            const isSelected = selectedTopicIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedTopicIdx(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-500/10 text-white'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                      Scenario {idx + 1}
                    </span>
                  </div>
                  <div className="text-xs font-semibold line-clamp-2 leading-snug">
                    {topic}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Blueprint Guide for Selected Topic */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 font-semibold block mb-1">
                Architecture Blueprint
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                {activeTopic}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => copyTopic(activeTopic, selectedTopicIdx)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              {copiedTopic === selectedTopicIdx ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Topic</span>
                </>
              )}
            </button>
          </div>

          {/* 45-Minute System Design Interview Execution Plan */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Recommended 45-Minute Whiteboard Breakdown:
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Scope & Requirements (0 - 5 mins)</span>
                </div>
                <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Clarify Functional Requirements (what users must do) and Non-Functional Requirements (Latency SLAs, Availability 99.99%, Consistency model, Durability guarantees).
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 font-semibold text-sky-300 mb-1">
                  <span className="w-5 h-5 rounded-full bg-sky-950 text-sky-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Back-of-Envelope Capacity Math (5 - 10 mins)</span>
                </div>
                <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Calculate Write QPS, Read QPS (e.g. 10:1 read-to-write ratio), Bandwidth incoming/outgoing, and 5-year storage capacity. Estimate cache memory (80/20 Pareto rule).
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 font-semibold text-emerald-300 mb-1">
                  <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>High-Level Architecture (10 - 25 mins)</span>
                </div>
                <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Draw API Gateway, Load Balancer (round-robin / least connections), Stateless Service Pods, Primary/Replica DB with connection pooling (PgBouncer), and Redis Cache layer.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
                  <span className="w-5 h-5 rounded-full bg-amber-950 text-amber-400 flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>Deep-Dive & Resiliency (25 - 40 mins)</span>
                </div>
                <p className="text-slate-400 pl-7 text-[11px] leading-relaxed">
                  Address single points of failure (SPOFs), cache stampede mitigation (mutex / early refresh), database sharding key selection, and dead-letter queues.
                </p>
              </div>
            </div>
          </div>

          {/* Key Trade-Offs Pill Box */}
          <div className="p-3.5 bg-indigo-950/30 rounded-xl border border-indigo-900/40 text-xs space-y-1.5">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Seniority Signal for {experienceLevel}:</span>
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Never declare one tool as universally "better". Explain trade-offs: e.g. "We could choose Cassandra for high write throughput with tunable consistency, but PostgreSQL gives us strict ACID guarantees and foreign-key integrity for balance tracking."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
