// Shared types for the ATS scoring engine. The frontend renders reports purely
// from these structures — no scoring logic or labels are hard-coded in the UI.

export type CriterionKey =
  | "jd_match"
  | "skills_coverage"
  | "contact_info"
  | "sections"
  | "action_impact"
  | "formatting"
  | "readability";

export type CriterionResult = {
  key: string;
  label: string;
  weight: number;
  /** 0–100 sub-score for this dimension. */
  score: number;
  /** Whether this criterion applied to the check (e.g. jd_match needs a JD). */
  applicable: boolean;
  /** One-line human explanation of the sub-score. */
  details: string;
  /** Actionable suggestions to improve this dimension. */
  suggestions: string[];
  /** Optional matched/missing items surfaced in the UI. */
  matched?: string[];
  missing?: string[];
};

export type AtsReport = {
  overallScore: number;
  rating: "Excellent" | "Good" | "Fair" | "Needs work";
  summary: string;
  wordCount: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  contact: {
    email: string | null;
    phone: string | null;
    links: string[];
  };
  criteria: CriterionResult[];
};

export type EngineCriterion = {
  key: string;
  label: string;
  description: string;
  weight: number;
  enabled: boolean;
};

export type EngineSkill = {
  name: string;
  category: string;
  aliases: string[];
  weight: number;
};

export type EngineInput = {
  resumeText: string;
  jobDescription?: string | null;
  jobCategory?: string | null;
  criteria: EngineCriterion[];
  skills: EngineSkill[];
};
