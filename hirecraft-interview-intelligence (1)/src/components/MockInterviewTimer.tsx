import React, { useState, useEffect, useRef } from 'react';
import { TechnicalQuestion } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Bell, 
  BellOff, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  X,
  Target,
  Edit3
} from 'lucide-react';

interface MockInterviewTimerProps {
  questions: TechnicalQuestion[];
  experienceLevel: string;
  onSelectQuestionForMock?: (q: TechnicalQuestion) => void;
  onOpenScratchpad?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MockInterviewTimer: React.FC<MockInterviewTimerProps> = ({
  questions,
  experienceLevel,
  onSelectQuestionForMock,
  onOpenScratchpad,
  isOpen = true,
  onClose,
}) => {
  const DEFAULT_SECONDS = 45 * 60; // 45 minutes
  const [totalDuration, setTotalDuration] = useState<number>(DEFAULT_SECONDS);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(DEFAULT_SECONDS);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play synthetic pleasant audio chime using browser Web Audio API
  const playChime = (frequency: number = 587.33, type: OscillatorType = 'sine', duration: number = 0.4) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio chime unsupported or blocked', e);
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            playChime(880, 'triangle', 0.8);
            return 0;
          }
          // Chime at 5 minutes remaining
          if (prev === 300) {
            playChime(659.25, 'sine', 0.5);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining, soundEnabled]);

  const handleStart = () => {
    setIsRunning(true);
    playChime(523.25, 'sine', 0.3); // High C
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = (newSeconds: number = totalDuration) => {
    setIsRunning(false);
    setSecondsRemaining(newSeconds);
  };

  const handleSetPreset = (minutes: number) => {
    const sec = minutes * 60;
    setTotalDuration(sec);
    setSecondsRemaining(sec);
    setIsRunning(false);
  };

  const handleAddFiveMinutes = () => {
    setSecondsRemaining((prev) => prev + 300);
    setTotalDuration((prev) => Math.max(prev, secondsRemaining + 300));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const percentLeft = Math.max(0, Math.min(100, (secondsRemaining / totalDuration) * 100));
  const elapsedSeconds = totalDuration - secondsRemaining;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  // 45-Minute Interview Milestones
  const getPhaseInfo = () => {
    if (totalDuration !== 45 * 60) {
      return {
        name: 'Mock Interview Session',
        guidance: 'Structure your thinking: clarify requirements first, discuss architecture, write code/design, then test edge cases.',
        timeframe: `${elapsedMinutes}m elapsed`
      };
    }

    if (elapsedMinutes < 5) {
      return {
        name: 'Phase 1: Scope & Clarifying Questions (00:00 - 05:00)',
        guidance: 'Ask clarifying questions on constraints, scale, input/output data types, and non-functional SLAs.',
        timeframe: '0 - 5 mins'
      };
    } else if (elapsedMinutes < 15) {
      return {
        name: 'Phase 2: High-Level Architecture & API Contracts (05:00 - 15:00)',
        guidance: 'Define core data structures, endpoints, back-of-the-envelope capacity estimations, and component boundaries.',
        timeframe: '5 - 15 mins'
      };
    } else if (elapsedMinutes < 35) {
      return {
        name: 'Phase 3: Core Implementation & Deep-Dive (15:00 - 35:00)',
        guidance: 'Walk through algorithms, database queries, concurrency locks, state management, or write the critical path logic.',
        timeframe: '15 - 35 mins'
      };
    } else if (elapsedMinutes < 40) {
      return {
        name: 'Phase 4: Bottlenecks, Edge Cases & Failure Modes (35:00 - 40:00)',
        guidance: 'Discuss network timeouts, cache stampedes, database deadlocks, retry storms, and test coverage.',
        timeframe: '35 - 40 mins'
      };
    } else {
      return {
        name: 'Phase 5: Candidate Reverse Q&A (40:00 - 45:00)',
        guidance: 'Ask thoughtful reverse-interview questions about deployment cycles, technical debt, and team dynamics.',
        timeframe: '40 - 45 mins'
      };
    }
  };

  const phase = getPhaseInfo();
  const currentQuestion = questions[activeQuestionIdx] || questions[0];

  const isLowTime = secondsRemaining <= 300 && secondsRemaining > 0;
  const isTimeUp = secondsRemaining === 0;

  if (isMinimized) {
    return (
      <div className="bg-slate-900/90 border border-indigo-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md flex items-center justify-between gap-3 text-xs mb-6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            {isRunning && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRunning ? 'bg-indigo-500' : 'bg-slate-500'}`} />
          </span>
          <span className="font-mono text-base font-extrabold text-white">
            {formatTime(secondsRemaining)}
          </span>
          <span className="text-slate-400 hidden sm:inline">
            · {phase.name.split(':')[0]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold flex items-center gap-1"
            >
              <Pause className="w-3 h-3" />
              <span>Pause</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Resume</span>
            </button>
          )}

          <button
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-lg border border-slate-700 text-slate-400 hover:text-white"
            title="Expand timer station"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border transition-all duration-300 mb-6 p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-md ${
      isTimeUp
        ? 'bg-rose-950/40 border-rose-500/60 ring-2 ring-rose-500/30'
        : isLowTime
        ? 'bg-amber-950/30 border-amber-500/60 ring-1 ring-amber-500/20'
        : 'bg-slate-900/90 border-indigo-500/30'
    }`}>
      {/* Background Progress Bar Fill */}
      <div 
        className="absolute top-0 left-0 bottom-0 bg-indigo-600/5 -z-10 transition-all duration-1000 ease-linear pointer-events-none"
        style={{ width: `${percentLeft}%` }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Mock Interview Simulation Timer
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                45m Standard Round
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Paces you through real-world FAANG & Top-Tier technical interview milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Sound alert enabled' : 'Sound alert muted'}
          >
            {soundEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize button */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
            title="Minimize to top bar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white transition-colors"
              title="Close timer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Countdown Centerpiece */}
      <div className="py-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Large Digits & Controls */}
        <div className="lg:col-span-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="text-center sm:text-left">
            <div className={`font-mono text-4xl sm:text-5xl font-black tracking-tight leading-none ${
              isTimeUp
                ? 'text-rose-400 animate-pulse'
                : isLowTime
                ? 'text-amber-300'
                : 'text-white'
            }`}>
              {formatTime(secondsRemaining)}
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1 flex items-center gap-2 justify-center sm:justify-start">
              <span>{Math.round(percentLeft)}% time remaining</span>
              <span>·</span>
              <span className="text-indigo-300">{Math.floor(totalDuration / 60)}m interview</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{secondsRemaining === totalDuration ? 'Start 45m Interview' : 'Resume'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30 transition-all"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleReset()}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
              title="Reset countdown"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleAddFiveMinutes}
              className="px-2.5 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
              title="Add 5 minutes bonus"
            >
              <Plus className="w-3 h-3" />
              <span>5m</span>
            </button>
          </div>
        </div>

        {/* Phase Milestone Callout */}
        <div className="lg:col-span-6 bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              <span>{phase.name}</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {phase.timeframe}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {phase.guidance}
          </p>
        </div>
      </div>

      {/* Quick Duration Presets */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Round Presets:</span>
          <button
            type="button"
            onClick={() => handleSetPreset(45)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
              totalDuration === 45 * 60
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            45m Full Round
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset(30)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
              totalDuration === 30 * 60
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            30m Architecture Drill
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset(15)}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-colors ${
              totalDuration === 15 * 60
                ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            15m Behavioral / Phone Screen
          </button>
        </div>

        {/* Selected Target Question for this Session */}
        {questions.length > 0 && currentQuestion && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Active Target:</span>
            <select
              value={activeQuestionIdx}
              onChange={(e) => setActiveQuestionIdx(Number(e.target.value))}
              aria-label="Select target question for mock session"
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 max-w-[220px] truncate"
            >
              {questions.map((q, idx) => (
                <option key={idx} value={idx}>
                  Q{idx + 1}: {q.focus_area}
                </option>
              ))}
            </select>

            {onSelectQuestionForMock && (
              <button
                type="button"
                onClick={() => onSelectQuestionForMock(currentQuestion)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Evaluate Answer</span>
              </button>
            )}

            {onOpenScratchpad && (
              <button
                type="button"
                onClick={onOpenScratchpad}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                title="Open notes and answer scratchpad"
              >
                <Edit3 className="w-3 h-3 text-indigo-400" />
                <span>Scratchpad</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
