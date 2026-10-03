import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { JdInputForm } from './components/JdInputForm';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AnalysisResult, ExperienceLevel } from './types';
import { AlertCircle, Sparkles, Terminal, Code2, Layers, ShieldCheck, Globe, Share2, PlusCircle } from 'lucide-react';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('Analyzing job requirements...');
  const [error, setError] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<ExperienceLevel>('Senior');
  const [currentRoleTitle, setCurrentRoleTitle] = useState<string>('');
  const [currentCandidateContext, setCurrentCandidateContext] = useState<string>('');
  const [isSharedView, setIsSharedView] = useState<boolean>(false);

  // Check for shared roadmap URL on startup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('share');
    if (!shareId) return;

    const loadSharedPlan = async () => {
      setIsLoading(true);
      setLoadingStep('Retrieving shared interview roadmap...');
      setError(null);

      try {
        // First try server API
        const response = await fetch(`/api/share/${encodeURIComponent(shareId)}`);
        if (response.ok) {
          const plan = await response.json();
          setAnalysisResult(plan.data);
          setCurrentLevel(plan.experienceLevel || 'Senior');
          setCurrentRoleTitle(plan.roleTitle || '');
          setIsSharedView(true);
          return;
        }

        // Fallback to local storage
        const localKey = `hirecraft_share_${shareId}`;
        const localData = localStorage.getItem(localKey);
        if (localData) {
          const parsed = JSON.parse(localData);
          setAnalysisResult(parsed.data);
          setCurrentLevel(parsed.experienceLevel || 'Senior');
          setCurrentRoleTitle(parsed.roleTitle || '');
          setIsSharedView(true);
          return;
        }

        throw new Error('Shared preparation roadmap was not found or link has expired.');
      } catch (err: any) {
        console.error('Error loading shared plan:', err);
        setError(err.message || 'Failed to load shared interview roadmap.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedPlan();
  }, []);

  const handleAnalyze = async (payload: {
    jobDescription: string;
    experienceLevel: ExperienceLevel;
    roleTitle?: string;
    candidateContext?: string;
    focusCompany?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setCurrentLevel(payload.experienceLevel);
    setCurrentRoleTitle(payload.roleTitle || '');
    setCurrentCandidateContext(payload.candidateContext || '');

    // Progressive loading indicators for UX
    const steps = [
      `Parsing tech stack & challenges from job description...`,
      `Calibrating questions strictly for ${payload.experienceLevel} seniority...`,
      `Formulating real-world System Design scenarios...`,
      `Structuring 7-day master preparation roadmap...`,
      `Curating high-leverage reverse-interview questions...`,
    ];

    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      }
    }, 1800);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setAnalysisResult(data);
      // Smooth scroll to top of results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Failed to analyze job description:', err);
      setError(err?.message || 'An unexpected error occurred while analyzing the job description.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (isSharedView) {
      window.history.replaceState({}, '', window.location.pathname);
      setIsSharedView(false);
    }
    setAnalysisResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header onReset={handleReset} hasResult={!!analysisResult} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Public Shared Roadmap Notification Banner */}
        {isSharedView && analysisResult && (
          <div className="max-w-6xl mx-auto mb-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <strong className="text-white font-semibold text-sm">
                    Shared Interview Preparation Roadmap
                  </strong>
                  <span className="px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-mono text-[10px] border border-indigo-700/40">
                    Public Mentor View
                  </span>
                </div>
                <p className="text-slate-400 mt-0.5">
                  You are reviewing a shared preparation plan. You can study this curriculum, download PDF/Markdown, or generate your own plan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm shadow-indigo-600/30"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create My Own Roadmap</span>
            </button>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-semibold">Analysis Notice</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="max-w-2xl mx-auto text-center py-20 px-4 space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {loadingStep}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Synthesizing hiring manager expectations, calibrated interview questions, and a 7-day master study plan.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Calibrating for {currentLevel} Seniority</span>
            </div>
          </div>
        ) : analysisResult ? (
          <AnalysisDashboard
            data={analysisResult}
            experienceLevel={currentLevel}
            roleTitle={currentRoleTitle}
            candidateContext={currentCandidateContext}
            onReset={handleReset}
          />
        ) : (
          <JdInputForm onAnalyze={handleAnalyze} isLoading={isLoading} />
        )}
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">HireCraft Intelligence</span>
            <span>·</span>
            <span>Technical Interviewer & Hiring Manager Co-Pilot</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Powered by Gemini 3.8 Flash</span>
            <span>·</span>
            <span>Strict Schema Validation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
