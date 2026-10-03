import React, { useState, useEffect } from 'react';
import { TechnicalQuestion, MockFeedbackResult } from '../types';
import { 
  X, 
  Sparkles, 
  Send, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  MessageSquare,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface MockInterviewModalProps {
  question: TechnicalQuestion | null;
  experienceLevel: string;
  onClose: () => void;
}

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({
  question,
  experienceLevel,
  onClose,
}) => {
  const [candidateAnswer, setCandidateAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<MockFeedbackResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer for practicing timed responses
  const [seconds, setSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  if (!question) return null;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateAnswer.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setIsTimerRunning(false);

    try {
      const res = await fetch('/api/mock-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          focusArea: question.focus_area,
          experienceLevel,
          candidateAnswer: candidateAnswer.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Evaluation service responded with status: ' + res.status);
      }

      const data = await res.json();
      setFeedback(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to evaluate answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
    setCandidateAnswer('');
    setSeconds(0);
    setIsTimerRunning(true);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-5 sm:p-6 my-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                Mock Simulation
              </span>
              <span className="text-xs text-slate-400">
                Calibrated for {experienceLevel} expectations
              </span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-1.5 leading-snug">
              {question.question}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stopwatch & Focus Area */}
        <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <div className="text-slate-400">
            Target Focus: <strong className="text-sky-300">{question.focus_area}</strong>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-indigo-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(seconds)}</span>
          </div>
        </div>

        {/* Practice Form / Input */}
        {!feedback ? (
          <form onSubmit={handleEvaluate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Type Your Technical Answer / Architecture Explanation:
              </label>
              <textarea
                rows={7}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="State core principles, explain technical mechanics, mention real-world trade-offs, edge-case mitigation, and quantifiable metrics..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Word count: {candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!candidateAnswer.trim() || isSubmitting}
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 transition-all ${
                    !candidateAnswer.trim() || isSubmitting
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Hiring Manager Reviewing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Submit Answer for AI Grading</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Feedback View */
          <div className="space-y-4 text-xs">
            {/* Score & Verdict Banner */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">
                  Hiring Manager Assessment:
                </span>
                <div className="text-base font-bold text-white">
                  {feedback.rating}
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  {feedback.hiring_manager_verdict}
                </p>
              </div>

              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-indigo-400 font-mono">
                  {feedback.score}<span className="text-slate-500 text-sm">/10</span>
                </div>
                <span className="text-[10px] text-slate-500">Technical Score</span>
              </div>
            </div>

            {/* Strengths */}
            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/30 space-y-1.5">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>What You Did Well:</span>
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1 text-[11px]">
                {feedback.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/30 space-y-1.5">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Gaps for {experienceLevel} Seniority:</span>
              </span>
              <ul className="list-disc list-inside text-slate-300 space-y-1 pl-1 text-[11px]">
                {feedback.areas_for_improvement.map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Follow-up */}
            {feedback.recommended_follow_up && (
              <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-900/40 space-y-1 text-slate-300">
                <span className="font-semibold text-indigo-300 block text-[11px]">
                  Interviewer Follow-Up Drill:
                </span>
                <p className="text-[11px] italic">"{feedback.recommended_follow_up}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 text-xs flex items-center gap-1.5 hover:bg-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
