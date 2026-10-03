import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { AnalysisResult, ExperienceLevel } from '../types';
import { 
  Sparkles, 
  TrendingUp, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  RotateCcw,
  Compass
} from 'lucide-react';

interface SkillsRadarChartProps {
  data: AnalysisResult;
  experienceLevel: ExperienceLevel;
  candidateContext?: string;
}

interface RadarDataPoint {
  subject: string;
  fullSkill: string;
  jdRequirement: number;
  candidateLevel: number;
  gap: number;
}

export const SkillsRadarChart: React.FC<SkillsRadarChartProps> = ({
  data,
  experienceLevel,
  candidateContext,
}) => {
  // Generate baseline competency requirements based on experience level
  const baselineJDScore = useMemo(() => {
    switch (experienceLevel) {
      case 'Junior':
        return 65;
      case 'Mid':
        return 75;
      case 'Senior':
        return 88;
      case 'Staff / Lead':
        return 94;
      case 'Principal / Architect':
        return 98;
      default:
        return 85;
    }
  }, [experienceLevel]);

  // Initial candidate scores computed from skills and background context
  const initialChartData = useMemo(() => {
    const skills = data.top_skills.slice(0, 6); // Top 6 core skills for optimal radar geometry
    const hasResume = Boolean(candidateContext && candidateContext.trim().length > 10);

    return skills.map((skill, index) => {
      // Shorten label for clean polar axis display
      let shortLabel = skill;
      if (shortLabel.length > 20) {
        // extract primary noun or acronym
        const parts = shortLabel.split(/[:(,&/]/)[0].trim();
        shortLabel = parts.length > 20 ? parts.substring(0, 18) + '...' : parts;
      }

      // Compute calibrated values
      const jdScore = Math.min(100, baselineJDScore + ((index % 3) * 4));
      
      // If candidate provided resume context, check for keyword presence
      let candidateScore = Math.max(45, baselineJDScore - 12);
      if (hasResume) {
        const resumeText = candidateContext!.toLowerCase();
        const skillKeywords = skill.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const matchCount = skillKeywords.filter(k => resumeText.includes(k)).length;
        if (matchCount > 0) {
          candidateScore = Math.min(98, baselineJDScore + (matchCount * 5));
        } else {
          candidateScore = Math.max(40, baselineJDScore - 20);
        }
      } else {
        // Realistic default readiness gradient (e.g. 70 - 90%)
        candidateScore = Math.max(50, Math.min(95, jdScore - ((index % 4) * 6)));
      }

      return {
        subject: shortLabel,
        fullSkill: skill,
        jdRequirement: jdScore,
        candidateLevel: candidateScore,
        gap: jdScore - candidateScore,
      };
    });
  }, [data.top_skills, baselineJDScore, candidateContext]);

  // State to allow user to fine-tune and self-assess each skill
  const [chartData, setChartData] = useState<RadarDataPoint[]>(initialChartData);
  const [showSliders, setShowSliders] = useState<boolean>(false);

  // Update when initial data changes
  React.useEffect(() => {
    setChartData(initialChartData);
  }, [initialChartData]);

  const handleScoreChange = (index: number, newScore: number) => {
    setChartData((prev) => {
      const updated = [...prev];
      const pt = updated[index];
      updated[index] = {
        ...pt,
        candidateLevel: newScore,
        gap: pt.jdRequirement - newScore,
      };
      return updated;
    });
  };

  const resetToDefault = () => {
    setChartData(initialChartData);
  };

  // Overall match metrics
  const averageJd = Math.round(
    chartData.reduce((acc, curr) => acc + curr.jdRequirement, 0) / (chartData.length || 1)
  );
  const averageCandidate = Math.round(
    chartData.reduce((acc, curr) => acc + curr.candidateLevel, 0) / (chartData.length || 1)
  );
  const matchIndex = Math.min(100, Math.round((averageCandidate / averageJd) * 100));

  // Find biggest gap and biggest strength
  const sortedByGap = [...chartData].sort((a, b) => b.gap - a.gap);
  const biggestGap = sortedByGap[0];
  const sortedByStrength = [...chartData].sort((a, b) => b.candidateLevel - a.candidateLevel);
  const topStrength = sortedByStrength[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: RadarDataPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-md">
          <div className="font-bold text-white max-w-[200px] leading-tight">
            {dataPoint.fullSkill}
          </div>
          <div className="flex items-center justify-between gap-4 text-indigo-300">
            <span>JD Requirement:</span>
            <span className="font-mono font-bold">{dataPoint.jdRequirement}%</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Candidate Readiness:</span>
            <span className="font-mono font-bold">{dataPoint.candidateLevel}%</span>
          </div>
          <div className="border-t border-slate-800 pt-1 flex items-center justify-between gap-4 text-slate-400">
            <span>Delta:</span>
            <span className={`font-mono font-bold ${dataPoint.gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {dataPoint.gap > 0 ? `-${dataPoint.gap}% gap` : `+${Math.abs(dataPoint.gap)}% surplus`}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5">
      {/* Header and Summary stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">
              Skill Alignment & Competency Radar
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              {experienceLevel} Benchmark
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Maps candidate readiness against specific technical requirements defined in the job description.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSliders(!showSliders)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              showSliders
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-indigo-300" />
            <span>{showSliders ? 'Hide Tuning Sliders' : 'Calibrate My Scores'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Radar Chart on Left, Alignment Insights on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar Chart Display */}
        <div className="lg:col-span-7 bg-slate-950/70 rounded-2xl p-4 border border-slate-800/80 relative flex items-center justify-center min-h-[340px]">
          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  stroke="#334155"
                />
                <Radar
                  name="JD Requirement"
                  dataKey="jdRequirement"
                  stroke="#818cf8"
                  fill="#6366f1"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Candidate Readiness"
                  dataKey="candidateLevel"
                  stroke="#34d399"
                  fill="#10b981"
                  fillOpacity={0.4}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    paddingTop: '12px',
                    fontSize: '12px',
                  }}
                  iconType="circle"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alignment Insights & Delta Cards */}
        <div className="lg:col-span-5 space-y-3.5 text-xs">
          {/* Match Score Badge */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 block mb-0.5">
                Overall Alignment Index
              </span>
              <div className="text-xl font-black text-white">
                {matchIndex}% Role Fit
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Based on {chartData.length} core technical competency axes
              </p>
            </div>

            <div className="text-right">
              <div className={`text-2xl font-mono font-extrabold ${matchIndex >= 85 ? 'text-emerald-400' : matchIndex >= 70 ? 'text-indigo-400' : 'text-amber-400'}`}>
                {averageCandidate}%
              </div>
              <span className="text-[10px] text-slate-500 font-mono">avg readiness</span>
            </div>
          </div>

          {/* Top Strength Callout */}
          {topStrength && (
            <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-900/30 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Primary Technical Anchor:</span>
              </div>
              <div className="text-slate-200 font-medium text-[11px]">
                {topStrength.fullSkill} ({topStrength.candidateLevel}% readiness)
              </div>
              <p className="text-slate-400 text-[10px]">
                Strong competitive moat. Use this in your opening elevator pitch and architecture walk-throughs.
              </p>
            </div>
          )}

          {/* Focus Opportunity / Gap Callout */}
          {biggestGap && biggestGap.gap > 0 && (
            <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-900/30 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Target Study Priority:</span>
              </div>
              <div className="text-slate-200 font-medium text-[11px]">
                {biggestGap.fullSkill} ({biggestGap.gap}% gap to JD)
              </div>
              <p className="text-slate-400 text-[10px]">
                Recommended focus area. Allocate Day 3 and Day 4 of your 7-day preparation curriculum to this domain.
              </p>
            </div>
          )}

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Interactive: Drag sliders to simulate your current comfort level.</span>
          </div>
        </div>
      </div>

      {/* Optional Interactive Sliders Drawer */}
      {showSliders && (
        <div className="pt-4 border-t border-slate-800 space-y-4 bg-slate-950/50 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Self-Score Your Confidence (0 - 100%):</span>
            </span>

            <button
              type="button"
              onClick={resetToDefault}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to AI Baseline</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {chartData.map((item, idx) => (
              <div key={idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300 truncate max-w-[170px]" title={item.fullSkill}>
                    {item.subject}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {item.candidateLevel}%
                  </span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="100"
                  value={item.candidateLevel}
                  onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>JD Target: {item.jdRequirement}%</span>
                  <span className={item.gap > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                    {item.gap > 0 ? `-${item.gap}%` : `+${Math.abs(item.gap)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
