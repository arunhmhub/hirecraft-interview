import React, { useState } from 'react';
import { AnalysisResult, ExperienceLevel } from '../types';
import { SkillsRadarChart } from './SkillsRadarChart';
import { 
  CheckCircle2, 
  Layers, 
  Compass, 
  Cpu, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface OverviewSkillsViewProps {
  data: AnalysisResult;
  onNavigateTab: (tabId: string) => void;
  experienceLevel: string;
  onTriggerMockTimer?: () => void;
  candidateContext?: string;
}

export const OverviewSkillsView: React.FC<OverviewSkillsViewProps> = ({
  data,
  onNavigateTab,
  experienceLevel,
  onTriggerMockTimer,
  candidateContext,
}) => {
  const [copiedSkill, setCopiedSkill] = useState<string | null>(null);

  const copySkill = (skill: string) => {
    navigator.clipboard.writeText(skill);
    setCopiedSkill(skill);
    setTimeout(() => setCopiedSkill(null), 2000);
  };

  const roleSummary = data.role_summary;

  return (
    <div className="space-y-6">
      {/* Role Summary Hero Card */}
      {roleSummary && (
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-2xl border border-indigo-900/40 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 font-semibold">
                  Detected Role Focus
                </span>
                <span className="text-xs text-slate-400">
                  Seniority: <strong className="text-white">{roleSummary.experience_level || experienceLevel}</strong>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {roleSummary.identified_title}
              </h2>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              {roleSummary.primary_tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/90 text-indigo-200 border border-slate-700/80 font-mono font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-300 leading-relaxed flex-1">
              <strong className="text-slate-100 font-semibold">Core Mission: </strong>
              {roleSummary.role_mission}
            </p>

            {onTriggerMockTimer && (
              <button
                type="button"
                onClick={onTriggerMockTimer}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch 45m Mock Session</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Visual Competency Radar Chart */}
      <SkillsRadarChart
        data={data}
        experienceLevel={experienceLevel as ExperienceLevel}
        candidateContext={candidateContext}
      />

      {/* Top Required Skills Section */}
      <div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Top Required Skills & Technical Competencies ({data.top_skills.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Extracted directly from the job description tools, libraries, and challenges.
            </p>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Click any skill to copy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {data.top_skills.map((skill, idx) => {
            const isCopied = copiedSkill === skill;
            return (
              <div
                key={idx}
                onClick={() => copySkill(skill)}
                className="group p-3.5 bg-slate-950/70 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-2 select-none shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>Skill #{idx + 1}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-indigo-200 transition-colors">
                    {skill}
                  </div>
                </div>

                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity shrink-0"
                  title="Copy skill"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Launch Cards to other sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('tech')}
          className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Technical Rounds</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-bold text-white">
            {data.technical_questions.length} Tailored Technical Questions
          </h4>
          <p className="text-xs text-slate-400">
            Dive into code architecture, concurrency, and real-world edge cases.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('plan')}
          className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-sky-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Study Curriculum</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-bold text-white">
            Interactive 7-Day Study Plan
          </h4>
          <p className="text-xs text-slate-400">
            Track day-by-day task checklist with local progress persistence.
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('reverse')}
          className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">Reverse Interview</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-sm font-bold text-white">
            {data.questions_for_interviewer.length} Questions for Hiring Managers
          </h4>
          <p className="text-xs text-slate-400">
            Evaluate deploy velocity, tech debt, on-call health, and culture.
          </p>
        </div>
      </div>
    </div>
  );
};
