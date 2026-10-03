import React, { useState } from 'react';
import { TechnicalQuestion } from '../types';
import { 
  Code2, 
  Search, 
  Copy, 
  Check, 
  HelpCircle, 
  CheckCircle2, 
  Compass,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Clock
} from 'lucide-react';

interface TechQuestionsViewProps {
  questions: TechnicalQuestion[];
  onStartMockPractice: (question: TechnicalQuestion) => void;
  experienceLevel: string;
  onTriggerMockTimer?: () => void;
}

export const TechQuestionsView: React.FC<TechQuestionsViewProps> = ({
  questions,
  onStartMockPractice,
  experienceLevel,
  onTriggerMockTimer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>({});

  const filteredQuestions = questions.filter(
    (q) =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.focus_area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Filter & Counter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-400" />
            <span>Technical Interview Questions ({filteredQuestions.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated for <strong className="text-indigo-300 font-semibold">{experienceLevel}</strong> seniority, focusing on real challenges in the JD.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onTriggerMockTimer && (
            <button
              type="button"
              onClick={onTriggerMockTimer}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all shrink-0"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start 45m Timer</span>
            </button>
          )}

          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter questions..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Question Cards */}
      <div className="space-y-3.5">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = !!expandedIndices[idx];
          return (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl overflow-hidden transition-all shadow-sm"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold">
                        Q{idx + 1}
                      </span>
                      <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-800/40">
                        {q.focus_area}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                      {q.question}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(q.question, idx)}
                      title="Copy Question"
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => onStartMockPractice(q)}
                      className="px-2.5 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span className="hidden sm:inline">Mock Practice</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleExpand(idx)}
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      title={isExpanded ? 'Collapse notes' : 'Expand answer strategy'}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Strategy Blueprint */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 text-xs bg-slate-950/40 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
                    <div className="flex items-start gap-2 text-slate-300">
                      <Compass className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block mb-0.5">What the Interviewer Evaluates:</strong>
                        <p className="text-slate-400 leading-relaxed">
                          Does the candidate understand underlying primitives and operational trade-offs, or do they only recite syntax?
                          For <strong className="text-indigo-300">{experienceLevel}</strong> engineers, hiring managers look for awareness of failure modes,
                          concurrency race conditions, performance profiling, and measurable metrics.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-300 pt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white block mb-0.5">Recommended 3-Step Answer Structure:</strong>
                        <ol className="list-decimal list-inside text-slate-400 space-y-1">
                          <li><strong className="text-slate-200">First Principles Definition:</strong> Directly state how {q.focus_area} works at a low level.</li>
                          <li><strong className="text-slate-200">Concrete Production Example:</strong> Walk through a real-world scenario (e.g. high traffic, cache invalidation, connection drops).</li>
                          <li><strong className="text-slate-200">Trade-offs & Edge Cases:</strong> Explain what breaks under load and how you mitigate it.</li>
                        </ol>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onStartMockPractice(q)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 underline underline-offset-4"
                      >
                        Launch Interactive Mock Interview for this question &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
            <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No questions matched "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-2 text-xs text-indigo-400 hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
