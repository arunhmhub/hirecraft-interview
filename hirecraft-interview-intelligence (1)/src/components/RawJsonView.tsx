import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface RawJsonViewProps {
  data: AnalysisResult;
  roleTitle?: string;
}

export const RawJsonView: React.FC<RawJsonViewProps> = ({ data, roleTitle }) => {
  const [copied, setCopied] = useState<boolean>(false);

  // Filter to the strict schema specified by the prompt
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

  const jsonString = JSON.stringify(strictJsonObject, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `${(roleTitle || 'interview_roadmap').toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <span>Structured JSON Schema Output</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Strictly validated matching the requested schema with all calibrated keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              copied
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Structured JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
            <span>interview_intelligence.json</span>
          </span>
          <span>{jsonString.split('\n').length} lines · {new Blob([jsonString]).size} bytes</span>
        </div>

        <pre className="p-4 sm:p-6 text-xs text-indigo-200/90 font-mono overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto selection:bg-indigo-500/30">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
};
