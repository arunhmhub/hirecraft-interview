import React, { useState } from 'react';
import { 
  HelpCircle, 
  Copy, 
  Check, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle,
  MessageCircleQuestion
} from 'lucide-react';

interface ReverseQuestionsViewProps {
  questions: string[];
  roleTitle: string;
}

export const ReverseQuestionsView: React.FC<ReverseQuestionsViewProps> = ({ questions, roleTitle }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const getQuestionStrategy = (q: string, idx: number) => {
    if (q.toLowerCase().includes('deployment') || q.toLowerCase().includes('ship') || q.toLowerCase().includes('cycle')) {
      return {
        category: 'Engineering Velocity & CI/CD Health',
        whyItMatters: 'Reveals whether the team suffers from painful manual release gates or has automated canary pipelines.',
        goodSignal: 'Automated CI/CD with test suites passing in < 15 mins, daily or multiple daily deploys with easy rollbacks.',
        redFlag: 'Bi-weekly manual releases requiring weekend staging freezes or manual QA sign-offs.'
      };
    }
    if (q.toLowerCase().includes('debt') || q.toLowerCase().includes('architecture') || q.toLowerCase().includes('migration')) {
      return {
        category: 'Technical Debt & Architectural Freedom',
        whyItMatters: 'Demonstrates your architectural maturity and ensures you will not be trapped firefighting untracked legacy bugs all day.',
        goodSignal: 'Dedicated 20% engineering budget or quarterly refactor sprints with leadership buy-in.',
        redFlag: 'Product pushes 100% feature velocity with zero refactoring budget until catastrophic outages happen.'
      };
    }
    if (q.toLowerCase().includes('success') || q.toLowerCase().includes('exceptional') || q.toLowerCase().includes('month')) {
      return {
        category: 'Performance Expectations & Impact',
        whyItMatters: 'Clarifies exact criteria for high ratings and bonus/promotion trajectories early on.',
        goodSignal: 'Clear alignment on business metrics, mentorship, and autonomous execution.',
        redFlag: 'Vague answers like "just write clean code and fit the team vibe".'
      };
    }
    return {
      category: 'Team Dynamics & Autonomy',
      whyItMatters: 'Tests how engineering decisions are debated and whether engineers have real agency over RFCs.',
      goodSignal: 'Blameless post-mortems, open architecture discussion documents, psychological safety.',
      redFlag: 'Top-down decrees from non-technical stakeholders without technical consultation.'
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">
            High-Leverage Questions to Ask the Interviewer ({questions.length})
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Interviewing is a bidirectional evaluation. Senior and top-tier candidates ask thoughtful questions that expose team culture, technical debt, deployment friction, and genuine business health.
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const strategy = getQuestionStrategy(q, idx);

          return (
            <div
              key={idx}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 sm:p-5 transition-all shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold">
                      RQ{idx + 1}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {strategy.category}
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                    "{q}"
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(q, idx)}
                  className="p-2 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                  title="Copy question"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Strategic Breakdown */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/50">
                  <span className="font-semibold text-indigo-300 block mb-0.5">Why ask this:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{strategy.whyItMatters}</p>
                </div>
                <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/50">
                  <span className="font-semibold text-emerald-300 block mb-0.5">Healthy answer:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{strategy.goodSignal}</p>
                </div>
                <div className="p-2.5 bg-slate-950/40 rounded-lg border border-slate-800/50">
                  <span className="font-semibold text-amber-300 block mb-0.5">Red flag warning:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{strategy.redFlag}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
