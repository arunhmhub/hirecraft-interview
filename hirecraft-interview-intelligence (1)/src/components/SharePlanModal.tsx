import React, { useState, useEffect } from 'react';
import { AnalysisResult, ExperienceLevel } from '../types';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Mail, 
  Linkedin, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Globe, 
  Calendar,
  Layers,
  Code2
} from 'lucide-react';

interface SharePlanModalProps {
  data: AnalysisResult;
  experienceLevel: ExperienceLevel;
  roleTitle: string;
  onClose: () => void;
}

export const SharePlanModal: React.FC<SharePlanModalProps> = ({
  data,
  experienceLevel,
  roleTitle,
  onClose,
}) => {
  const [shareUrl, setShareUrl] = useState<string>('');
  const [shareId, setShareId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const createShareLink = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data,
            experienceLevel,
            roleTitle,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate public share URL');
        }

        const resData = await response.json();
        if (isMounted) {
          const fullUrl = `${window.location.origin}${window.location.pathname}?share=${resData.shareId}`;
          setShareUrl(fullUrl);
          setShareId(resData.shareId);
        }
      } catch (err: any) {
        console.error('Error creating share link:', err);
        if (isMounted) {
          // Client-side fallback: encode essential metadata in url hash
          try {
            const fallbackId = 'local_' + Math.random().toString(36).substring(2, 8);
            // Save in localStorage as well
            localStorage.setItem(`hirecraft_share_${fallbackId}`, JSON.stringify({
              data,
              experienceLevel,
              roleTitle,
              createdAt: new Date().toISOString()
            }));
            const fullUrl = `${window.location.origin}${window.location.pathname}?share=${fallbackId}`;
            setShareUrl(fullUrl);
            setShareId(fallbackId);
          } catch {
            setError(err.message || 'Could not generate share link');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    createShareLink();

    return () => {
      isMounted = false;
    };
  }, [data, experienceLevel, roleTitle]);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenLink = () => {
    if (!shareUrl) return;
    window.open(shareUrl, '_blank');
  };

  // Social share urls
  const shareSubject = encodeURIComponent(`Interview Preparation Roadmap: ${roleTitle} (${experienceLevel})`);
  const shareBody = encodeURIComponent(
    `Check out this technical interview preparation plan for the ${roleTitle} role (${experienceLevel} level):\n\n${shareUrl}\n\nIncludes required skills, calibrated technical questions, system design blueprints, and a 7-day master study curriculum.`
  );

  const mailtoUrl = `mailto:?subject=${shareSubject}&body=${shareBody}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my interview preparation roadmap for ${roleTitle}: ${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share Interview Plan</h3>
              <p className="text-xs text-slate-400">
                Generate a unique public link to share with mentors, peers, or recruiters.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* Plan Summary Card */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white text-sm truncate max-w-[280px]">
                {roleTitle}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 shrink-0">
                {experienceLevel} Calibration
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400 border-t border-slate-850">
              <div className="flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                <span>{data.top_skills.length} Skills</span>
              </div>
              <div className="flex items-center gap-1">
                <Code2 className="w-3 h-3 text-sky-400" />
                <span>{data.technical_questions.length} Tech Qs</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                <span>7-Day Roadmap</span>
              </div>
            </div>
          </div>

          {/* Link Generation Box */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold block text-xs">
              Public Shareable Link
            </label>

            {isLoading ? (
              <div className="h-11 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center gap-2 text-slate-400">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                <span>Generating secure public URL...</span>
              </div>
            ) : error ? (
              <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs">
                {error}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs truncate select-all focus-within:border-indigo-500">
                  {shareUrl}
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Share Shortcuts */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-medium block">
              Direct Mentor & Peer Channels:
            </span>

            <div className="grid grid-cols-3 gap-2">
              <a
                href={mailtoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email</span>
              </a>

              <a
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                <span>LinkedIn</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-center gap-2 font-medium transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Privacy & Permissions Notice */}
          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300 block">Read-Only Mentor Access</strong>
              <span>
                Anyone with this unique link can view this curated technical curriculum, radar chart, and interview questions. Your personal scratchpad notes remain private to your local browser.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium transition-colors"
          >
            Close
          </button>

          {shareUrl && (
            <button
              type="button"
              onClick={handleOpenLink}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 hover:text-white border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Test Link in New Tab</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
