import React, { useState, useEffect } from 'react';
import { ExperienceLevel, JobPreset } from '../types';
import { SAMPLE_JOB_DESCRIPTIONS } from '../data/sampleJobDescriptions';
import { 
  Sparkles, 
  Layers, 
  Briefcase, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Wand2,
  Cpu,
  FolderDown
} from 'lucide-react';

interface JdInputFormProps {
  onAnalyze: (payload: {
    jobDescription: string;
    experienceLevel: ExperienceLevel;
    roleTitle?: string;
    candidateContext?: string;
    focusCompany?: string;
  }) => void;
  isLoading: boolean;
}

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; desc: string }[] = [
  { id: 'Junior', label: 'Junior (0-2y)', desc: 'Core language syntax, fundamentals, basic algorithms & debugging' },
  { id: 'Mid', label: 'Mid-Level (2-5y)', desc: 'State architecture, API design, testing patterns & edge-cases' },
  { id: 'Senior', label: 'Senior (5-8y)', desc: 'Distributed scale, database indexing, failure modes & mentorship' },
  { id: 'Staff / Lead', label: 'Staff / Lead (8+y)', desc: 'Multi-quarter architecture, technical strategy & org impact' },
  { id: 'Principal / Architect', label: 'Principal (10+y)', desc: 'Enterprise-wide reliability, governance & high-concurrency systems' },
];

export const JdInputForm: React.FC<JdInputFormProps> = ({ onAnalyze, isLoading }) => {
  const [jobDescription, setJobDescription] = useState<string>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Senior');
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [focusCompany, setFocusCompany] = useState<string>('');
  const [candidateContext, setCandidateContext] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Default to the first preset for immediate delight if empty
  const handleSelectPreset = (preset: JobPreset) => {
    setActivePresetId(preset.id);
    setJobDescription(preset.description);
    setExperienceLevel(preset.experience_level);
    setRoleTitle(preset.title);
    setFocusCompany(preset.company_type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim() || isLoading) return;

    onAnalyze({
      jobDescription,
      experienceLevel,
      roleTitle: roleTitle.trim() || undefined,
      focusCompany: focusCompany.trim() || undefined,
      candidateContext: candidateContext.trim() || undefined,
    });
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (jobDescription.trim() && !isLoading) {
          onAnalyze({
            jobDescription,
            experienceLevel,
            roleTitle: roleTitle.trim() || undefined,
            focusCompany: focusCompany.trim() || undefined,
            candidateContext: candidateContext.trim() || undefined,
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jobDescription, experienceLevel, roleTitle, focusCompany, candidateContext, isLoading, onAnalyze]);

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Intro Hero */}
      <div className="text-center space-y-3 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Expert Hiring Manager & Technical Interview Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Analyze Any Job Description. <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
            Generate Strict Seniority-Calibrated Interview Roadmaps.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Tailors top required skills, technical questions, behavioral STAR scenarios, system design topics,
          a realistic 7-day study curriculum, and high-leverage reverse-interview questions.
        </p>
      </div>

      {/* Preset Selector Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Quick Test With Real-World Job Descriptions
            </span>
          </div>
          <span className="text-xs text-slate-500">
            Click any role preset to auto-populate and test
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_JOB_DESCRIPTIONS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold truncate text-indigo-300">{preset.experience_level}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {preset.company_type.split(' ')[0]}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                  {preset.title.replace(/\(.*?\)/, '')}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {preset.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {tag}
                    </span>
                  ))}
                  {preset.tags.length > 3 && (
                    <span className="text-[9px] text-slate-500">+{preset.tags.length - 3}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm space-y-6">
        {/* Step 1: Experience Level Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>1. Target Candidate Experience Level</span>
            <span className="text-xs font-normal text-slate-500 lowercase">(strictly tunes question depth)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {EXPERIENCE_LEVELS.map((lvl) => {
              const isSelected = experienceLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setExperienceLevel(lvl.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-400/50'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-semibold text-xs mb-1 flex items-center justify-between">
                    <span>{lvl.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className={`text-[10px] leading-tight ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {lvl.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Job Description Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="jd-textarea" className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>2. Paste Job Description</span>
            </label>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>{wordCount} words</span>
              {wordCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setJobDescription('');
                    setActivePresetId(null);
                  }}
                  className="hover:text-rose-400 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="relative rounded-xl border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 bg-slate-950/80 transition-all">
            <textarea
              id="jd-textarea"
              rows={9}
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                if (activePresetId) setActivePresetId(null);
              }}
              placeholder="Paste the full job posting here (responsibilities, required tech stack, cloud tools, database technologies, company stage, challenges)..."
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-y min-h-[180px] font-sans"
            />
          </div>
        </div>

        {/* Step 3: Optional Role Details Accordion */}
        <div className="border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors py-1"
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Optional Details: Role Title, Company Culture & Candidate Resume for Gap Analysis</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Role Title</span>
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer (Ledger Services)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Stage / Culture Focus</span>
                </label>
                <input
                  type="text"
                  value={focusCompany}
                  onChange={(e) => setFocusCompany(e.target.value)}
                  placeholder="e.g. High-throughput Fintech, Series B SaaS, Big Tech FAANG"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-slate-400" />
                  <span>Candidate Background / Resume Summary (Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={candidateContext}
                  onChange={(e) => setCandidateContext(e.target.value)}
                  placeholder="Paste brief highlights from your resume or background to identify direct skill overlaps and critical gaps to prepare for..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="hidden sm:inline">Tip: Press</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-300">
              ⌘ + Enter
            </kbd>
            <span>to analyze immediately</span>
          </div>

          <button
            type="submit"
            disabled={!jobDescription.trim() || isLoading}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg ${
              !jobDescription.trim() || isLoading
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Interview Roadmap...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Job Description & Generate Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* VS Code Local Download Card */}
      <div className="mt-4 p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-950 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
            <FolderDown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white font-medium block">Want to edit or run this project locally in VS Code?</span>
            <span className="text-[11px] text-slate-400">Full stack Node.js, Express, React 19, and preconfigured .vscode debugging tasks.</span>
          </div>
        </div>
        <a
          href="/api/download-project"
          download="hirecraft-interview-intelligence.zip"
          className="px-3.5 py-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-200 border border-sky-700 font-semibold transition-all flex items-center gap-1.5 shrink-0 shadow-sm shadow-sky-950/50"
        >
          <FolderDown className="w-3.5 h-3.5 text-sky-400" />
          <span>Download Code (.zip)</span>
        </a>
      </div>
    </div>
  );
};
