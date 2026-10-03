import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, ExperienceLevel, TechnicalQuestion } from '../types';
import { 
  Edit3, 
  Bold, 
  Italic, 
  Code, 
  List, 
  ListOrdered, 
  Heading2, 
  Heading3, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  FileText, 
  Sparkles, 
  Save, 
  Eye, 
  EyeOff, 
  Terminal, 
  CheckCircle2,
  BookOpen,
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';

interface ScratchpadContext {
  id: string;
  label: string;
  category: string;
  fullText?: string;
  focusArea?: string;
}

interface MockFeedbackResult {
  score: number;
  rating: string;
  strengths: string[];
  areas_for_improvement: string[];
  hiring_manager_verdict: string;
  model_ideal_answer_outline: string;
  recommended_follow_up?: string;
}

interface InterviewNotesScratchpadProps {
  data: AnalysisResult;
  roleTitle: string;
  experienceLevel?: ExperienceLevel;
  initialSelectedQuestion?: string;
  isCompactModal?: boolean;
  onClose?: () => void;
}

export const InterviewNotesScratchpad: React.FC<InterviewNotesScratchpadProps> = ({
  data,
  roleTitle,
  experienceLevel = 'Senior',
  initialSelectedQuestion,
  isCompactModal = false,
  onClose,
}) => {
  const roleSlug = roleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  // Available question contexts
  const contexts: ScratchpadContext[] = [
    { id: 'general', label: '📝 General Mock Session Notes', category: 'General' },
    ...data.technical_questions.map((q, i) => ({
      id: `tech_${i}`,
      label: `💻 Q${i + 1}: ${q.focus_area} - ${q.question.slice(0, 48)}...`,
      category: 'Technical Question',
      fullText: q.question,
      focusArea: q.focus_area,
    })),
    ...data.behavioral_questions.map((b, i) => ({
      id: `behav_${i}`,
      label: `🤝 B${i + 1}: ${b.slice(0, 52)}...`,
      category: 'Behavioral Scenario',
      fullText: b,
    })),
    ...data.system_design_or_architecture_topics.map((s, i) => ({
      id: `sys_${i}`,
      label: `🏛️ SysDesign ${i + 1}: ${s.slice(0, 48)}...`,
      category: 'Architecture Topic',
      fullText: s,
    })),
  ];

  const [activeContextId, setActiveContextId] = useState<string>(initialSelectedQuestion || 'general');
  const [content, setContent] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  // AI Feedback State
  const [showAiFeedback, setShowAiFeedback] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<MockFeedbackResult | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load content & cached feedback for active context
  useEffect(() => {
    try {
      const storageKey = `hirecraft_notes_${roleSlug}_${activeContextId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        setContent(saved);
      } else {
        // Pre-fill smart template if empty
        const activeCtx = contexts.find(c => c.id === activeContextId);
        if (activeCtx?.category === 'Technical Question') {
          setContent(
`## Technical Answer: ${activeCtx.focusArea || ''}
> **Question:** ${activeCtx.fullText || ''}

### 1. Core Principles & Primitives
- 

### 2. Implementation Approach & Trade-offs
- 

\`\`\`typescript
// Solution or architecture snippet
\`\`\`

### 3. Edge Cases & Concurrency Mitigation
- `
          );
        } else if (activeCtx?.category === 'Behavioral Scenario') {
          setContent(
`## STAR Framework Response
> **Question:** ${activeCtx.fullText || ''}

### Situation (Context & Urgency)
- 

### Task (My Ownership Stake)
- 

### Action (Concrete Steps & Technical Decisions)
- 

### Result & Quantifiable Impact
- `
          );
        } else if (activeCtx?.category === 'Architecture Topic') {
          setContent(
`## System Design Blueprint: ${activeCtx.fullText || ''}

### 1. Functional & Non-Functional Requirements
- **Read/Write QPS:** 
- **Latency SLA:** < 50ms P99
- **Availability:** 99.99%

### 2. High-Level Architecture Components
- API Gateway & Rate Limiter
- Stateless Application Service Pods
- Primary/Replica DB with connection pooling
- Caching Layer (Redis Cache-Aside)

### 3. Key Trade-offs & Failure Modes
- `
          );
        } else {
          setContent(
`# Mock Session Scratchpad
**Role:** ${roleTitle}

## Key Topics to Address Today:
- 

## Immediate Feedback / Notes to Remember:
- `
          );
        }
      }
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Load cached feedback if any
      const cachedFbKey = `hirecraft_feedback_${roleSlug}_${activeContextId}`;
      const cachedFb = localStorage.getItem(cachedFbKey);
      if (cachedFb) {
        setFeedback(JSON.parse(cachedFb));
      } else {
        setFeedback(null);
      }
      setFeedbackError(null);
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, [activeContextId, roleSlug]);

  // Auto-save on content change
  useEffect(() => {
    if (!content) return;
    const timeout = setTimeout(() => {
      try {
        const storageKey = `hirecraft_notes_${roleSlug}_${activeContextId}`;
        localStorage.setItem(storageKey, content);
        setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [content, activeContextId, roleSlug]);

  // Trigger instant LLM evaluation
  const handleEvaluate = async () => {
    if (!content.trim() || content.trim().length < 15) {
      setFeedbackError('Please draft an answer or jot down your notes first before requesting AI evaluation.');
      return;
    }

    setIsEvaluating(true);
    setFeedbackError(null);

    const activeCtx = contexts.find(c => c.id === activeContextId);
    const questionPrompt = activeCtx?.fullText || `Candidate drafted preparation notes for ${roleTitle}`;
    const focusArea = activeCtx?.focusArea || activeCtx?.category || 'Technical Competence';

    try {
      const response = await fetch('/api/mock-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionPrompt,
          focusArea,
          candidateAnswer: content,
          experienceLevel,
          roleTitle,
          jobCriteria: data.top_skills,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to evaluate answer');
      }

      const fbResult: MockFeedbackResult = await response.json();
      setFeedback(fbResult);

      // Cache feedback in localStorage
      try {
        const cachedFbKey = `hirecraft_feedback_${roleSlug}_${activeContextId}`;
        localStorage.setItem(cachedFbKey, JSON.stringify(fbResult));
      } catch (e) {
        console.warn('Could not cache feedback', e);
      }
    } catch (err: any) {
      console.error('Error fetching feedback:', err);
      setFeedbackError(err.message || 'An error occurred while evaluating your answer with the AI.');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Append model outline or suggestions to notes
  const handleAppendImprovement = () => {
    if (!feedback) return;
    const addition = `\n\n### 💡 AI Hiring Manager Recommendations:\n${feedback.areas_for_improvement.map(a => `- ${a}`).join('\n')}\n\n### 🎯 Ideal Answer Outline:\n${feedback.model_ideal_answer_outline}\n`;
    setContent(prev => prev + addition);
  };

  // Insert markdown helper around selection or at cursor
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newContent = before + replacement + after;
    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
  };

  const insertTemplate = (templateType: 'star' | 'sysdesign' | 'code') => {
    let template = '';
    if (templateType === 'star') {
      template = `\n\n### STAR Response Blueprint\n- **Situation:** \n- **Task:** \n- **Action:** \n- **Result:** \n`;
    } else if (templateType === 'sysdesign') {
      template = `\n\n### Capacity & Architecture Math\n- **QPS:** \n- **Storage (5yr):** \n- **Cache Size (80/20):** \n- **SPOF Mitigation:** \n`;
    } else {
      template = `\n\n\`\`\`typescript\n// Time Complexity: O(N)\n// Space Complexity: O(1)\nfunction solution() {\n  // Code here\n}\n\`\`\`\n`;
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + template);
      return;
    }

    const start = textarea.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);
    setContent(before + template + after);
    setTimeout(() => textarea.focus(), 0);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const activeCtx = contexts.find(c => c.id === activeContextId);
    const filename = `${roleSlug}_${activeContextId}_notes.md`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Clear all notes for this current question/topic?')) {
      setContent('');
      setFeedback(null);
    }
  };

  const activeContext = contexts.find(c => c.id === activeContextId);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;

  // Helper for score badge styling
  const getRatingBadge = (rating: string) => {
    const lower = rating.toLowerCase();
    if (lower.includes('strong hire')) {
      return 'bg-emerald-950/80 text-emerald-300 border-emerald-700';
    }
    if (lower.includes('lean hire')) {
      return 'bg-sky-950/80 text-sky-300 border-sky-700';
    }
    if (lower.includes('lean no hire')) {
      return 'bg-amber-950/80 text-amber-300 border-amber-700';
    }
    return 'bg-rose-950/80 text-rose-300 border-rose-700';
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col ${
      isCompactModal ? 'max-h-[85vh]' : 'space-y-0'
    }`}>
      {/* Top Header & Context Picker */}
      <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Mock Practice Scratchpad & Answer Notes</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                Auto-Saved
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Draft technical answers, system design trade-offs, and STAR stories with instant LLM evaluation.
            </p>
          </div>
        </div>

        {/* Question / Topic Scope Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-[11px] text-slate-400 font-medium shrink-0">Topic:</label>
          <select
            value={activeContextId}
            onChange={(e) => setActiveContextId(e.target.value)}
            className="w-full sm:w-[260px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 truncate"
          >
            {contexts.map((ctx) => (
              <option key={ctx.id} value={ctx.id}>
                {ctx.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Full Question Context Banner if attached to a specific question */}
      {activeContext?.fullText && (
        <div className="px-4 py-2.5 bg-indigo-950/30 border-b border-indigo-900/40 text-xs flex items-start gap-2 text-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="text-white">Active Prompt: </strong>
            <span>{activeContext.fullText}</span>
          </div>
        </div>
      )}

      {/* Rich Text Toolbar */}
      <div className="p-2 sm:px-4 sm:py-2 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1">
          {/* Format buttons */}
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Bold (**text**)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Italic (*text*)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('`', '`')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Inline code (`code`)"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n```typescript\n', '\n```\n')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Code Block (```)"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n## ')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n- ')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n1. ')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white"
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-slate-800 mx-1" />

          {/* Quick Scaffold Inserters */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertTemplate('star')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-purple-300 border border-slate-700 flex items-center gap-1 font-medium transition-colors"
              title="Insert STAR Framework scaffold"
            >
              <span>+ STAR</span>
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('sysdesign')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-sky-300 border border-slate-700 flex items-center gap-1 font-medium transition-colors"
              title="Insert System Design scaffold"
            >
              <span>+ Arch Math</span>
            </button>
            <button
              type="button"
              onClick={() => insertTemplate('code')}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] text-emerald-300 border border-slate-700 flex items-center gap-1 font-medium transition-colors"
              title="Insert Code Snippet scaffold"
            >
              <span>+ Code Block</span>
            </button>
          </div>
        </div>

        {/* View Mode & AI Feedback Toggle */}
        <div className="flex items-center gap-2">
          {/* AI Feedback Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextState = !showAiFeedback;
              setShowAiFeedback(nextState);
              if (nextState && !feedback && content.trim().length > 20) {
                handleEvaluate();
              }
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              showAiFeedback
                ? 'bg-purple-950 border-purple-500 text-purple-200 shadow-sm shadow-purple-500/20'
                : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700 hover:border-purple-600/50'
            }`}
            title="Toggle instant AI evaluation from LLM based on job description criteria"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Feedback</span>
            {feedback && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-2 py-1 rounded text-[11px] flex items-center gap-1 border transition-colors ${
              showPreview
                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {showPreview ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showPreview ? 'Edit' : 'Preview'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Copy notes to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Download notes as markdown"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
            title="Clear notes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Work Area: Editor + Optional AI Feedback Side-by-Side */}
      <div className={`grid ${showAiFeedback ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'} flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 min-h-[380px]`}>
        {/* Editor & Preview Area */}
        <div className={`relative flex flex-col ${showAiFeedback ? 'lg:col-span-7' : 'w-full'}`}>
          {!showPreview ? (
            <textarea
              ref={textareaRef}
              rows={isCompactModal ? 12 : 16}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your notes, solution architecture, code, or interview thoughts here..."
              className="w-full h-full min-h-[340px] bg-slate-950/80 p-4 sm:p-5 text-xs sm:text-sm text-slate-100 placeholder-slate-600 focus:outline-none font-mono resize-y leading-relaxed selection:bg-indigo-500/30"
            />
          ) : (
            <div className="w-full h-full min-h-[340px] bg-slate-950/80 p-4 sm:p-5 text-xs sm:text-sm text-slate-200 overflow-y-auto leading-relaxed space-y-3 font-sans">
              {content.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return <h1 key={idx} className="text-lg font-black text-white border-b border-slate-800 pb-1">{line.slice(2)}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-base font-bold text-indigo-300 mt-2">{line.slice(3)}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-sm font-semibold text-sky-300 mt-1">{line.slice(4)}</h3>;
                }
                if (line.startsWith('> ')) {
                  return (
                    <blockquote key={idx} className="border-l-2 border-indigo-500 pl-3 py-1 bg-indigo-950/20 text-indigo-200 italic my-2">
                      {line.slice(2)}
                    </blockquote>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={idx} className="list-disc list-inside text-slate-300 pl-2">
                      {line.slice(2)}
                    </li>
                  );
                }
                if (line.trim().startsWith('```')) {
                  return (
                    <div key={idx} className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      {line}
                    </div>
                  );
                }
                if (!line.trim()) {
                  return <div key={idx} className="h-1" />;
                }
                return <p key={idx} className="text-slate-300">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* AI Feedback Panel */}
        {showAiFeedback && (
          <div className="lg:col-span-5 bg-slate-950/95 flex flex-col overflow-y-auto max-h-[600px] border-t lg:border-t-0 border-slate-800">
            {/* AI Panel Header */}
            <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Hiring Manager Evaluation</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {experienceLevel} Criteria
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Evaluated against target JD skills and role expectations.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-sm shadow-purple-600/30"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>{feedback ? 'Re-evaluate' : 'Evaluate'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Target JD Criteria Pills */}
            <div className="p-3 bg-slate-950 border-b border-slate-850">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block mb-1.5">
                Benchmark Criteria from JD:
              </span>
              <div className="flex flex-wrap gap-1">
                {data.top_skills.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                  >
                    {skill.split('&')[0].trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Feedback Content Area */}
            <div className="p-4 space-y-4 flex-1 text-xs">
              {feedbackError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>{feedbackError}</p>
                </div>
              )}

              {isEvaluating ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-200">Evaluating Drafted Answer...</p>
                    <p className="text-[11px] text-slate-500">
                      Comparing trade-offs, architecture, and communication against {experienceLevel} JD benchmarks.
                    </p>
                  </div>
                </div>
              ) : feedback ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Score & Rating Banner */}
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Interview Score</span>
                      <div className="text-xl font-black text-white flex items-baseline gap-1">
                        <span>{feedback.score}</span>
                        <span className="text-xs text-slate-500">/ 10</span>
                      </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono ${getRatingBadge(feedback.rating)}`}>
                      {feedback.rating}
                    </div>
                  </div>

                  {/* Hiring Manager Verdict */}
                  <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl text-slate-300 space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 block">
                      Hiring Manager Verdict:
                    </span>
                    <p className="text-xs text-purple-200 italic leading-relaxed">
                      "{feedback.hiring_manager_verdict}"
                    </p>
                  </div>

                  {/* Strengths Aligned with JD */}
                  {feedback.strengths && feedback.strengths.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="font-semibold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>JD Strengths & Criteria Met</span>
                      </h5>
                      <ul className="space-y-1 pl-1">
                        {feedback.strengths.map((str, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-1.5 text-[11px] leading-relaxed">
                            <span className="text-emerald-500 shrink-0">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement according to JD */}
                  {feedback.areas_for_improvement && feedback.areas_for_improvement.length > 0 && (
                    <div className="space-y-1.5">
                      <h5 className="font-semibold text-amber-400 flex items-center gap-1.5 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>Missing Nuances & JD Gaps</span>
                      </h5>
                      <ul className="space-y-1 pl-1">
                        {feedback.areas_for_improvement.map((area, i) => (
                          <li key={i} className="text-slate-300 flex items-start gap-1.5 text-[11px] leading-relaxed">
                            <span className="text-amber-500 shrink-0">•</span>
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Model Answer Outline */}
                  {feedback.model_ideal_answer_outline && (
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                          Model Answer Structure
                        </span>
                        <button
                          type="button"
                          onClick={handleAppendImprovement}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                          title="Append recommendations into your scratchpad notes"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert to Notes</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {feedback.model_ideal_answer_outline}
                      </p>
                    </div>
                  )}

                  {/* Recommended Follow-Up Probe */}
                  {feedback.recommended_follow_up && (
                    <div className="p-2.5 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-[11px] text-indigo-200">
                      <strong className="text-white block mb-0.5">Probable Interviewer Follow-Up:</strong>
                      <span>"{feedback.recommended_follow_up}"</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 max-w-xs mx-auto">
                    <p className="font-semibold text-slate-300 text-xs">Ready for Evaluation</p>
                    <p className="text-[11px] text-slate-500">
                      Draft your answer or architecture blueprint on the left, then click <strong>Evaluate</strong> to receive score and feedback calibrated to the {experienceLevel} JD criteria.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition-all"
                  >
                    Evaluate Draft Now
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span>{words} words</span>
          <span>·</span>
          <span>{chars} characters</span>
          {lastSaved && (
            <>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Saved at {lastSaved}</span>
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Tip: Toggle "AI Feedback" to test your answers against hiring manager criteria</span>
        </div>
      </div>
    </div>
  );
};
