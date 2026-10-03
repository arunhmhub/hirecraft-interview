export type ExperienceLevel = 'Junior' | 'Mid' | 'Senior' | 'Staff / Lead' | 'Principal / Architect';

export interface TechnicalQuestion {
  question: string;
  focus_area: string;
}

export interface DayPlan {
  day: number;
  focus: string;
  tasks: string[];
}

export interface RoleSummary {
  identified_title: string;
  experience_level: string;
  primary_tech_stack: string[];
  role_mission: string;
}

export interface AnalysisResult {
  top_skills: string[];
  technical_questions: TechnicalQuestion[];
  behavioral_questions: string[];
  system_design_or_architecture_topics: string[];
  seven_day_plan: DayPlan[];
  questions_for_interviewer: string[];
  role_summary?: RoleSummary;
  _note?: string;
}

export interface MockFeedbackResult {
  score: number;
  rating: string;
  strengths: string[];
  areas_for_improvement: string[];
  hiring_manager_verdict: string;
  model_ideal_answer_outline: string;
  recommended_follow_up?: string;
}

export interface JobPreset {
  id: string;
  title: string;
  company_type: string;
  experience_level: ExperienceLevel;
  description: string;
  tags: string[];
}
