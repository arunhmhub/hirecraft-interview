import React, { useState, useEffect, useMemo } from 'react';
import { DayPlan } from '../types';
import { 
  Calendar, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Clock, 
  FileDown,
  Trophy,
  Flame,
  Check,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCheck
} from 'lucide-react';

interface SevenDayPlanViewProps {
  plan: DayPlan[];
  roleTitle: string;
  onExportPdf?: () => void;
  onProgressUpdate?: (completed: number, total: number) => void;
}

export const SevenDayPlanView: React.FC<SevenDayPlanViewProps> = ({ 
  plan, 
  roleTitle, 
  onExportPdf,
  onProgressUpdate
}) => {
  const storageKey = `hirecraft_plan_${roleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const dateKey = `hirecraft_plan_start_${roleTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [startDate, setStartDate] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(dateKey);
      if (saved) return saved;
      return new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });

  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(completedTasks));
    } catch (e) {
      console.warn('Could not save progress to localStorage', e);
    }
  }, [completedTasks, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(dateKey, startDate);
    } catch (e) {
      console.warn('Could not save startDate to localStorage', e);
    }
  }, [startDate, dateKey]);

  // Calculate total tasks and completed count
  const allTasks: string[] = useMemo(() => {
    const list: string[] = [];
    plan.forEach((dayItem) => {
      dayItem.tasks.forEach((_, tIdx) => {
        list.push(`day-${dayItem.day}-task-${tIdx}`);
      });
    });
    return list;
  }, [plan]);

  const totalTasks = allTasks.length;
  const completedCount = allTasks.filter((k) => !!completedTasks[k]).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Notify parent if progress changes
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate(completedCount, totalTasks);
    }
  }, [completedCount, totalTasks, onProgressUpdate]);

  const toggleTask = (taskKey: string) => {
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));
  };

  const toggleDayCompletion = (dayNumber: number, tasks: string[]) => {
    const allDone = tasks.every((_, tIdx) => !!completedTasks[`day-${dayNumber}-task-${tIdx}`]);
    setCompletedTasks((prev) => {
      const updated = { ...prev };
      tasks.forEach((_, tIdx) => {
        updated[`day-${dayNumber}-task-${tIdx}`] = !allDone;
      });
      return updated;
    });
  };

  const markAllComplete = () => {
    const all: Record<string, boolean> = {};
    allTasks.forEach((k) => {
      all[k] = true;
    });
    setCompletedTasks(all);
  };

  const resetAllTasks = () => {
    if (window.confirm('Reset all checked tasks for this 7-day study plan?')) {
      setCompletedTasks({});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to compute calendar date for day item
  const getDayCalendarDate = (dayNum: number) => {
    try {
      const base = new Date(startDate);
      if (isNaN(base.getTime())) return '';
      base.setDate(base.getDate() + (dayNum - 1));
      return base.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Filter days based on selection
  const filteredPlan = plan.filter((dayItem) => {
    const dayTasksCompleted = dayItem.tasks.filter((_, tIdx) => {
      const taskKey = `day-${dayItem.day}-task-${tIdx}`;
      return !!completedTasks[taskKey];
    }).length;
    const isDayComplete = dayTasksCompleted === dayItem.tasks.length && dayItem.tasks.length > 0;

    if (filterMode === 'completed') return isDayComplete;
    if (filterMode === 'pending') return !isDayComplete;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Progress Bar */}
      <div className="bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white">
                7-Day Master Preparation Curriculum
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Persistent Checklist
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Intensely structured, day-by-day technical execution plan tailored to this job description.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={markAllComplete}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Mark all tasks as done"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Mark All Done</span>
            </button>

            <button
              type="button"
              onClick={resetAllTasks}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Reset checkmarks"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>

            {onExportPdf && (
              <button
                type="button"
                onClick={onExportPdf}
                className="px-2.5 py-1.5 rounded-lg border border-indigo-700/60 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs flex items-center gap-1.5 transition-colors"
                title="Download formatted PDF document"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Print plan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Milestone Celebration Banner if 100% complete */}
        {progressPercent === 100 && totalTasks > 0 && (
          <div className="p-4 bg-gradient-to-r from-emerald-950/80 via-indigo-950/70 to-emerald-950/80 rounded-xl border border-emerald-500/50 flex items-center gap-3.5 animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>7-Day Curriculum Completed!</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </h4>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                You've tackled all core technical requirements, architecture blueprints, and behavioral scenarios for this role. You are primed to excel in your technical rounds.
              </p>
            </div>
          </div>
        )}

        {/* Progress Bar & KPI Metrics */}
        <div className="space-y-3 pt-3 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Overall Study Completion Progress</span>
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {completedCount} / {totalTasks} Tasks Completed
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Est. {Math.max(0, (totalTasks - completedCount) * 1.5)} hrs study remaining</span>
              </div>

              <span className="font-mono font-extrabold text-sm text-indigo-300">
                {progressPercent}%
              </span>
            </div>
          </div>

          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-sky-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-indigo-500/20"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick Schedule Date Picker & Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Plan Start Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All (7 Days)
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('pending')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterMode === 'pending'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('completed')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  filterMode === 'completed'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlan.map((dayItem) => {
          const dayTasksCompleted = dayItem.tasks.filter((_, tIdx) => {
            const taskKey = `day-${dayItem.day}-task-${tIdx}`;
            return !!completedTasks[taskKey];
          }).length;
          const totalDayTasks = dayItem.tasks.length;
          const isDayComplete = dayTasksCompleted === totalDayTasks && totalDayTasks > 0;
          const dayPercent = totalDayTasks > 0 ? Math.round((dayTasksCompleted / totalDayTasks) * 100) : 0;
          const calendarDate = getDayCalendarDate(dayItem.day);

          return (
            <div
              key={dayItem.day}
              className={`p-4 sm:p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isDayComplete
                  ? 'bg-slate-900/90 border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shrink-0">
                      Day {dayItem.day}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate" title={dayItem.focus}>
                        {dayItem.focus}
                      </h4>
                      {calendarDate && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          {calendarDate}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleDayCompletion(dayItem.day, dayItem.tasks)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        isDayComplete
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                      title={isDayComplete ? 'Mark day incomplete' : 'Mark all day tasks complete'}
                    >
                      {isDayComplete ? 'Day Done ✓' : 'Mark All Done'}
                    </button>
                  </div>
                </div>

                {/* Day-specific Mini Progress Bar */}
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-3 border border-slate-850">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDayComplete ? 'bg-emerald-400' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${dayPercent}%` }}
                  />
                </div>

                {/* Tasks List */}
                <div className="space-y-2">
                  {dayItem.tasks.map((task, tIdx) => {
                    const taskKey = `day-${dayItem.day}-task-${tIdx}`;
                    const isChecked = !!completedTasks[taskKey];

                    return (
                      <div
                        key={tIdx}
                        onClick={() => toggleTask(taskKey)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-all text-xs select-none border ${
                          isChecked
                            ? 'bg-emerald-950/20 border-emerald-900/30 text-slate-400'
                            : 'bg-slate-950/40 hover:bg-slate-850/60 border-transparent hover:border-slate-800 text-slate-200'
                        }`}
                      >
                        <button
                          type="button"
                          aria-label="Toggle task"
                          className="shrink-0 mt-0.5 text-indigo-400"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                        <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Day footer summary */}
              <div className="pt-3 mt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{dayTasksCompleted} of {totalDayTasks} completed</span>
                <span className={isDayComplete ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {dayPercent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
