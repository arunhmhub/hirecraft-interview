import React, { useState } from 'react';
import { Sparkles, Terminal, FileCode2, ShieldCheck, Compass, FolderDown, Loader2 } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  hasResult?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasResult }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadZip = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      const res = await fetch('/api/download-project');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hirecraft-interview-intelligence.zip';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      console.warn('Fallback direct download redirect', err);
      window.location.href = '/api/download-project';
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-sky-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">HireCraft</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-mono font-medium">
                JD Intelligence v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Hiring Manager & Technical Interview Architecture Generator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-4 text-xs text-slate-400 border-r border-slate-800 pr-4">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calibrated Seniority</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemini 3.8 Intelligence</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="text-xs px-3 py-1.5 rounded-lg border border-sky-600/50 hover:border-sky-400 bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 transition-colors flex items-center gap-1.5 shadow-sm shadow-sky-950/50 font-medium cursor-pointer"
            title="Download full project source code as a ZIP archive for VS Code"
          >
            {isDownloading ? (
              <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
            ) : (
              <FolderDown className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span className="hidden sm:inline">
              {isDownloading ? 'Packaging ZIP...' : 'Download Code (.zip)'}
            </span>
            <span className="sm:hidden">{isDownloading ? '...' : '.ZIP'}</span>
          </button>

          {hasResult && onReset && (
            <button
              onClick={onReset}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-900 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>New Analysis</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
