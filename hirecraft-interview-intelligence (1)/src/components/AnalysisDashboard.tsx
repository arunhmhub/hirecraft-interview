import React, { useState } from 'react';
import { AnalysisResult, ExperienceLevel, TechnicalQuestion } from '../types';
import { OverviewSkillsView } from './OverviewSkillsView';
import { TechQuestionsView } from './TechQuestionsView';
import { BehavioralView } from './BehavioralView';
import { SystemDesignView } from './SystemDesignView';
import { SevenDayPlanView } from './SevenDayPlanView';
import { ReverseQuestionsView } from './ReverseQuestionsView';
import { RawJsonView } from './RawJsonView';
import { MockInterviewModal } from './MockInterviewModal';
import { MockInterviewTimer } from './MockInterviewTimer';
import { InterviewNotesScratchpad } from './InterviewNotesScratchpad';
import { SharePlanModal } from './SharePlanModal';
import { exportAnalysisToPdf } from '../utils/pdfExport';
import { 
  Layers, 
  Code2, 
  Users, 
  Network, 
  Calendar, 
  MessageCircleQuestion, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  RotateCcw, 
  Sparkles, 
  FileText,
  Clock,
  Play,
  FileDown,
  Edit3
} from 'lucide-react';

interface AnalysisDashboardProps {
  data: AnalysisResult;
  experienceLevel: ExperienceLevel;
  roleTitle?: string;
  onReset: () => void;
  candidateContext?: string;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  data,
  experienceLevel,
  roleTitle,
  onReset,
  candidateContext,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [mockPracticeQuestion, setMockPracticeQuestion] = useState<TechnicalQuestion | null>(null);
  const [showMockTimer, setShowMockTimer] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const resolvedTitle = roleTitle || data.role_summary?.identified_title || 'Software Engineering Role';

  const [planProgress, setPlanProgress] = useState<{ completed: number; total: number }>(() => {
    try {
      const storageKey = `hirecraft_plan_${resolvedTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : {};
      let total = 0;
      data.seven_day_plan.forEach((d) => (total += d.tasks.length));
      const completed = Object.values(parsed).filter(Boolean).length;
      return { completed, total };
    } catch {
      return { completed: 0, total: 21 };
    }
  });

  const handleExportPdf = () => {
    try {
      setIsExportingPdf(true);
      exportAnalysisToPdf(data, experienceLevel, resolvedTitle);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const strictJsonObject = {
    top_skills: data.top_skills,
    technical_questions: data.technical_questions.map((q) => ({
      question: q.question,
      focus_area: q.focus_area,
    })),
    behavioral_questions: data.behavioral_questions,
    system_design_or_architecture_topics: data.system_design_or_architecture_topics,
    seven_day_plan: data.seven_day_plan.map((d) => ({
      day: d.day,
      focus: d.focus,
      tasks: d.tasks,
    })),
    questions_for_interviewer: data.questions_for_interviewer,
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(strictJsonObject, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportMarkdown = () => {
    let md = `# Interview Preparation & Architecture Roadmap: ${resolvedTitle}\n`;
    md += `**Target Seniority Level:** ${experienceLevel}\n\n`;

    md += `## 1. Top Skills\n`;
    data.top_skills.forEach((s) => (md += `- ${s}\n`));
    md += `\n`;

    md += `## 2. Technical Questions\n`;
    data.technical_questions.forEach((q, i) => {
      md += `### Q${i + 1} [${q.focus_area}]\n${q.question}\n\n`;
    });

    md += `## 3. Behavioral Questions\n`;
    data.behavioral_questions.forEach((b, i) => {
      md += `${i + 1}. ${b}\n`;
    });
    md += `\n`;

    md += `## 4. System Design & Architecture Topics\n`;
    data.system_design_or_architecture_topics.forEach((t, i) => {
      md += `- **Topic ${i + 1}:** ${t}\n`;
    });
    md += `\n`;

    md += `## 5. 7-Day Master Preparation Plan\n`;
    data.seven_day_plan.forEach((d) => {
      md += `### Day ${d.day}: ${d.focus}\n`;
      d.tasks.forEach((t) => (md += `- [ ] ${t}\n`));
      md += `\n`;
    });

    md += `## 6. Questions for the Interviewer\n`;
    data.questions_for_interviewer.forEach((q, i) => {
      md += `${i + 1}. "${q}"\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resolvedTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_interview_roadmap.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'Top Skills', icon: Layers, count: data.top_skills.length },
    { id: 'tech', label: 'Technical Qs', icon: Code2, count: data.technical_questions.length },
    { id: 'behavioral', label: 'Behavioral & STAR', icon: Users, count: data.behavioral_questions.length },
    { id: 'sysdesign', label: 'System Design', icon: Network, count: data.system_design_or_architecture_topics.length },
    { 
      id: 'plan', 
      label: '7-Day Plan', 
      icon: Calendar, 
      count: planProgress.completed > 0 ? `${planProgress.completed}/${planProgress.total}` : 7 
    },
    { id: 'reverse', label: 'Ask Interviewer', icon: MessageCircleQuestion, count: data.questions_for_interviewer.length },
    { id: 'notes', label: 'Practice Scratchpad', icon: Edit3 },
    { id: 'json', label: 'Structured JSON', icon: FileCode },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold">
              {experienceLevel} Calibration
            </span>
            <span className="text-xs text-slate-400">Analysis Complete</span>
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white mt-1">
            {resolvedTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMockTimer((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showMockTimer
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30'
                : 'bg-indigo-950/80 hover:bg-indigo-900 border-indigo-700/60 text-indigo-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showMockTimer ? 'Hide 45m Timer' : 'Start 45m Mock Session'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copiedJson
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:border-slate-600'
            }`}
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Schema!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'notes'
                ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200 hover:border-slate-600'
            }`}
            title="Open personal notes and mock answers scratchpad"
          >
            <Edit3 className="w-3.5 h-3.5 text-purple-400" />
            <span>Scratchpad</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Export complete roadmap to PDF"
          >
            <FileDown className="w-3.5 h-3.5 text-rose-400" />
            <span>{isExportingPdf ? 'Exporting...' : 'Export to PDF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="px-3 py-1.5 rounded-lg border border-indigo-700/60 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Generate a unique public link to share with mentors or peers"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Share Plan</span>
          </button>

          <button
            type="button"
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Markdown</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* 45-Minute Mock Interview Countdown Timer */}
      {showMockTimer && (
        <MockInterviewTimer
          questions={data.technical_questions}
          experienceLevel={experienceLevel}
          onSelectQuestionForMock={(q) => setMockPracticeQuestion(q)}
          onOpenScratchpad={() => setActiveTab('notes')}
          onClose={() => setShowMockTimer(false)}
        />
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400'
                  : 'bg-slate-900/60 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <OverviewSkillsView
            data={data}
            onNavigateTab={setActiveTab}
            experienceLevel={experienceLevel}
            onTriggerMockTimer={() => setShowMockTimer(true)}
            candidateContext={candidateContext}
          />
        )}

        {activeTab === 'tech' && (
          <TechQuestionsView
            questions={data.technical_questions}
            onStartMockPractice={(q) => setMockPracticeQuestion(q)}
            experienceLevel={experienceLevel}
            onTriggerMockTimer={() => setShowMockTimer(true)}
          />
        )}

        {activeTab === 'behavioral' && (
          <BehavioralView
            questions={data.behavioral_questions}
            experienceLevel={experienceLevel}
          />
        )}

        {activeTab === 'sysdesign' && (
          <SystemDesignView
            topics={data.system_design_or_architecture_topics}
            experienceLevel={experienceLevel}
          />
        )}

        {activeTab === 'plan' && (
          <SevenDayPlanView
            plan={data.seven_day_plan}
            roleTitle={resolvedTitle}
            onExportPdf={handleExportPdf}
            onProgressUpdate={(completed, total) => setPlanProgress({ completed, total })}
          />
        )}

        {activeTab === 'reverse' && (
          <ReverseQuestionsView
            questions={data.questions_for_interviewer}
            roleTitle={resolvedTitle}
          />
        )}

        {activeTab === 'notes' && (
          <InterviewNotesScratchpad
            data={data}
            roleTitle={resolvedTitle}
            experienceLevel={experienceLevel}
          />
        )}

        {activeTab === 'json' && (
          <RawJsonView
            data={data}
            roleTitle={resolvedTitle}
          />
        )}
      </div>

      {/* Interactive Mock Interview Modal */}
      {mockPracticeQuestion && (
        <MockInterviewModal
          question={mockPracticeQuestion}
          experienceLevel={experienceLevel}
          onClose={() => setMockPracticeQuestion(null)}
        />
      )}

      {/* Share Plan Public Link Modal */}
      {showShareModal && (
        <SharePlanModal
          data={data}
          experienceLevel={experienceLevel}
          roleTitle={resolvedTitle}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
