import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  BookOpen,
  Sparkles
} from 'lucide-react';

interface BehavioralViewProps {
  questions: string[];
  experienceLevel: string;
}

export const BehavioralView: React.FC<BehavioralViewProps> = ({ questions, experienceLevel }) => {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(0);
  const [starNotes, setStarNotes] = useState<Record<number, { s: string; t: string; a: string; r: string }>>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const updateStarField = (idx: number, field: 's' | 't' | 'a' | 'r', value: string) => {
    setStarNotes((prev) => ({
      ...prev,
      [idx]: {
        ...(prev[idx] || { s: '', t: '', a: '', r: '' }),
        [field]: value,
      },
    }));
  };

  const copyStarStory = (idx: number) => {
    const story = starNotes[idx];
    const text = `Behavioral Question: ${questions[idx]}
Seniority Level: ${experienceLevel}

[Situation]
${story?.s || 'Not written yet'}

[Task]
${story?.t || 'Not written yet'}

[Action]
${story?.a || 'Not written yet'}

[Result & Learnings]
${story?.r || 'Not written yet'}`;

    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Framework Intro */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Behavioral Questions & STAR Framework</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibrated for <strong className="text-indigo-300">{experienceLevel}</strong> leadership, cross-functional collaboration, and technical conflicts.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-300 border border-purple-800/50 font-mono">
            STAR Method Guided
          </span>
        </div>

        {/* STAR Pillars Guide */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="font-bold text-indigo-400 block mb-0.5">S - Situation (15%)</span>
            <p className="text-slate-400 text-[11px]">Set the context: company stage, team size, technical urgency, or constraint.</p>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="font-bold text-sky-400 block mb-0.5">T - Task (15%)</span>
            <p className="text-slate-400 text-[11px]">What was your specific responsibility or ownership stake in resolving the challenge?</p>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="font-bold text-emerald-400 block mb-0.5">A - Action (50%)</span>
            <p className="text-slate-400 text-[11px]">Concrete technical & interpersonal steps you took ("I decided...", "I benchmarked...").</p>
          </div>
          <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/60">
            <span className="font-bold text-amber-400 block mb-0.5">R - Result (20%)</span>
            <p className="text-slate-400 text-[11px]">Quantifiable outcome: latency drop %, uptime, team velocity, and lessons learned.</p>
          </div>
        </div>
      </div>

      {/* Behavioral Questions Accordion with Interactive STAR Builder */}
      <div className="space-y-3.5">
        {questions.map((question, idx) => {
          const isOpen = activeQuestionIdx === idx;
          const currentStory = starNotes[idx] || { s: '', t: '', a: '', r: '' };
          const hasDrafted = currentStory.s || currentStory.t || currentStory.a || currentStory.r;

          return (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl overflow-hidden transition-all shadow-sm"
            >
              <div
                onClick={() => setActiveQuestionIdx(isOpen ? null : idx)}
                className="p-4 sm:p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold shrink-0 mt-0.5">
                    B{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                      {question}
                    </h4>
                    {hasDrafted && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-1">
                        <CheckCircle className="w-3 h-3" />
                        STAR draft in progress
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-indigo-400 hidden sm:inline">
                    {isOpen ? 'Close Blueprint' : 'Draft STAR Answer'}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isOpen && (
                <div className="p-4 sm:p-6 bg-slate-950/60 border-t border-slate-800 space-y-5 text-xs">
                  {/* Hiring Manager Signals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-emerald-300 font-semibold block mb-0.5">Green Flags for {experienceLevel}:</strong>
                        <p className="text-slate-400">
                          Takes ownership without blaming others, uses data and benchmarks to justify decisions, shows empathy for teammates and business priorities.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 font-semibold block mb-0.5">Red Flags to Avoid:</strong>
                        <p className="text-slate-400">
                          Vague generalizations ("We just fixed it"), avoiding personal accountability, complaining about former managers or teammates.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive STAR Story Builder */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Interactive STAR Story Notes:</span>
                      </span>
                      {hasDrafted && (
                        <button
                          type="button"
                          onClick={() => copyStarStory(idx)}
                          className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedIdx === idx ? 'Copied Story!' : 'Copy Formatted Story'}</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-indigo-300 mb-1">
                          Situation:
                        </label>
                        <textarea
                          rows={3}
                          value={currentStory.s}
                          onChange={(e) => updateStarField(idx, 's', e.target.value)}
                          placeholder="e.g. During our Q3 flash sale, our payment gateway began failing under 15k requests/sec due to thread contention..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-sky-300 mb-1">
                          Task:
                        </label>
                        <textarea
                          rows={3}
                          value={currentStory.t}
                          onChange={(e) => updateStarField(idx, 't', e.target.value)}
                          placeholder="e.g. As the tech lead on payments, I needed to triage the root cause within 30 minutes and deploy a hotfix without dropping in-flight transactions..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-300 mb-1">
                          Action:
                        </label>
                        <textarea
                          rows={3}
                          value={currentStory.a}
                          onChange={(e) => updateStarField(idx, 'a', e.target.value)}
                          placeholder="e.g. I analyzed the thread dump, identified database connection pool starvation, implemented a Redis token bucket rate limiter, and scaled connection pool sizing..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-amber-300 mb-1">
                          Result & Learnings:
                        </label>
                        <textarea
                          rows={3}
                          value={currentStory.r}
                          onChange={(e) => updateStarField(idx, 'r', e.target.value)}
                          placeholder="e.g. We recovered transaction throughput in 18 minutes, zero payment records were lost, and we added synthetic load tests that prevented two future incidents..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
