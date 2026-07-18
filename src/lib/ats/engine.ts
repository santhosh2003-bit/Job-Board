import natural from "natural";
import {
  buildResumeIndex,
  extractKeywords,
  matchesTerm,
  normalize,
  type ResumeIndex,
} from "@/lib/ats/nlp";
import type {
  AtsReport,
  CriterionResult,
  EngineCriterion,
  EngineInput,
} from "@/lib/ats/types";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const ACTION_VERBS = [
  "led","built","designed","developed","implemented","managed","created","launched",
  "improved","increased","reduced","optimized","delivered","architected","drove",
  "owned","spearheaded","automated","migrated","scaled","mentored","shipped","achieved",
  "streamlined","engineered","established","coordinated","analyzed","negotiated","grew",
];

const SECTION_PATTERNS: { label: string; essential: boolean; re: RegExp }[] = [
  { label: "Work experience", essential: true, re: /\b(work\s+experience|experience|employment|professional\s+experience|work\s+history)\b/i },
  { label: "Education", essential: true, re: /\b(education|academic|qualifications?)\b/i },
  { label: "Skills", essential: true, re: /\b(skills|technical\s+skills|core\s+competencies|technologies)\b/i },
  { label: "Summary", essential: false, re: /\b(summary|profile|objective|about\s+me)\b/i },
  { label: "Projects / Certifications", essential: false, re: /\b(projects?|certifications?|achievements?|awards?)\b/i },
];

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const LINK_RE = /(https?:\/\/[^\s]+|www\.[^\s]+|linkedin\.com\/[^\s]+|github\.com\/[^\s]+)/gi;
const QUANT_RE = /(\$\s?\d[\d,.]*|\d[\d,.]*\s?(%|percent|k\b|m\b|x\b|\+))/gi;

// --- Individual criterion evaluators -------------------------------------------------

function evalJdMatch(input: EngineInput, index: ResumeIndex): Partial<CriterionResult> {
  if (!input.jobDescription?.trim()) {
    return { applicable: false, score: 0, details: "No job description provided — skipped.", suggestions: [] };
  }
  const keywords = extractKeywords(input.jobDescription, 25);
  const matched = keywords.filter((k) => matchesTerm(index, k));
  const missing = keywords.filter((k) => !matched.includes(k));
  const score = keywords.length ? (matched.length / keywords.length) * 100 : 0;
  return {
    applicable: true,
    score: clamp(score),
    matched,
    missing: missing.slice(0, 15),
    details: `Your resume matches ${matched.length} of ${keywords.length} key terms from the job description.`,
    suggestions:
      missing.length > 0
        ? [`Naturally incorporate relevant missing keywords such as: ${missing.slice(0, 8).join(", ")}.`]
        : ["Great keyword coverage against this job description."],
  };
}

function evalSkillsCoverage(input: EngineInput, index: ResumeIndex): Partial<CriterionResult> {
  const relevant = input.jobCategory
    ? input.skills.filter((s) => s.category === input.jobCategory)
    : input.skills;
  const pool = relevant.length >= 5 ? relevant : input.skills;
  if (pool.length === 0) {
    return { applicable: false, score: 0, details: "No skills dictionary configured.", suggestions: [] };
  }

  const matched: string[] = [];
  const missing: string[] = [];
  for (const skill of pool) {
    const terms = [skill.name, ...skill.aliases];
    if (terms.some((t) => matchesTerm(index, t))) matched.push(skill.name);
    else missing.push(skill.name);
  }

  // Fair target so both freshers and 20-year veterans are scored sensibly:
  // reward a healthy number of relevant skills without demanding the whole list.
  const target = Math.min(pool.length, input.jobCategory ? 12 : 10);
  const score = (matched.length / target) * 100;
  return {
    applicable: true,
    score: clamp(score),
    matched: matched.slice(0, 20),
    missing: missing.slice(0, 12),
    details: `Detected ${matched.length} recognised skill${matched.length === 1 ? "" : "s"}${input.jobCategory ? ` for ${input.jobCategory}` : ""}.`,
    suggestions:
      matched.length < target
        ? [`Add any skills you genuinely have from: ${missing.slice(0, 8).join(", ")}.`]
        : ["Strong, relevant skills coverage."],
  };
}

function evalContactInfo(input: EngineInput): Partial<CriterionResult> {
  const text = input.resumeText;
  const hasEmail = EMAIL_RE.test(text);
  const hasPhone = PHONE_RE.test(text);
  const links = text.match(LINK_RE) ?? [];
  const hasLink = links.length > 0;

  const score = (hasEmail ? 40 : 0) + (hasPhone ? 30 : 0) + (hasLink ? 30 : 0);
  const missing: string[] = [];
  if (!hasEmail) missing.push("email address");
  if (!hasPhone) missing.push("phone number");
  if (!hasLink) missing.push("LinkedIn / portfolio link");

  return {
    applicable: true,
    score: clamp(score),
    details: `Found ${[hasEmail && "email", hasPhone && "phone", hasLink && "a link"].filter(Boolean).join(", ") || "no contact details"}.`,
    suggestions: missing.length ? [`Add your ${missing.join(", ")} near the top of the resume.`] : ["All key contact details present."],
  };
}

function evalSections(input: EngineInput): Partial<CriterionResult> {
  const text = input.resumeText;
  const present: string[] = [];
  const missing: string[] = [];
  let score = 0;
  for (const section of SECTION_PATTERNS) {
    const found = section.re.test(text);
    if (found) {
      present.push(section.label);
      score += section.essential ? 25 : section.label === "Summary" ? 15 : 10;
    } else {
      missing.push(section.label);
    }
  }
  return {
    applicable: true,
    score: clamp(score),
    matched: present,
    missing,
    details: `Recognised ${present.length} of ${SECTION_PATTERNS.length} standard resume sections.`,
    suggestions: missing.length
      ? [`Add clearly-titled section headings for: ${missing.join(", ")}.`]
      : ["All standard sections are clearly labelled."],
  };
}

function evalActionImpact(input: EngineInput, index: ResumeIndex): Partial<CriterionResult> {
  const verbHits = ACTION_VERBS.filter((v) => index.stemSet.has(natural.PorterStemmer.stem(v)));
  const quantHits = (input.resumeText.match(QUANT_RE) ?? []).length;

  // Two sub-signals: variety of action verbs and quantified achievements.
  const verbScore = Math.min(100, (verbHits.length / 8) * 100);
  const quantScore = Math.min(100, (quantHits / 5) * 100);
  const score = verbScore * 0.5 + quantScore * 0.5;

  const suggestions: string[] = [];
  if (verbHits.length < 8) suggestions.push("Start bullet points with strong action verbs (led, built, improved, delivered).");
  if (quantHits < 5) suggestions.push("Quantify impact with numbers, %, or $ (e.g. 'reduced load time by 40%').");
  if (!suggestions.length) suggestions.push("Excellent use of action verbs and quantified results.");

  return {
    applicable: true,
    score: clamp(score),
    details: `${verbHits.length} distinct action verbs and ${quantHits} quantified result${quantHits === 1 ? "" : "s"} detected.`,
    suggestions,
  };
}

function evalFormatting(input: EngineInput): Partial<CriterionResult> {
  const text = input.resumeText;
  const words = normalize(text).split(" ").filter(Boolean).length;
  const bullets = (text.match(/(^|\n)\s*[•\-*·]/g) ?? []).length;
  const hasDates = /\b(19|20)\d{2}\b/.test(text);
  const weirdRatio = (text.match(/[^\x20-\x7E\n]/g) ?? []).length / Math.max(text.length, 1);

  let score = 100;
  const suggestions: string[] = [];
  if (words < 200) { score -= 35; suggestions.push("Resume is quite short — aim for 400–1000 words of substance."); }
  else if (words > 1400) { score -= 20; suggestions.push("Resume is long — tighten it toward 1–2 focused pages."); }
  if (bullets < 3) { score -= 20; suggestions.push("Use bullet points so ATS and recruiters can scan achievements."); }
  if (!hasDates) { score -= 15; suggestions.push("Include employment/education dates (e.g. 2019–2023)."); }
  if (weirdRatio > 0.03) { score -= 15; suggestions.push("Avoid special glyphs/icons and multi-column layouts that break ATS parsing."); }
  if (!suggestions.length) suggestions.push("Clean, ATS-friendly structure.");

  return {
    applicable: true,
    score: clamp(score),
    details: `${words} words, ${bullets} bullet points${hasDates ? ", dates present" : ""}.`,
    suggestions,
  };
}

function evalReadability(input: EngineInput): Partial<CriterionResult> {
  const words = normalize(input.resumeText).split(" ").filter(Boolean).length;
  const sentences = Math.max(1, (input.resumeText.match(/[.!?\n]+/g) ?? []).length);
  const avgLen = words / sentences;

  let score = 100;
  const suggestions: string[] = [];
  if (avgLen > 28) { score -= 30; suggestions.push("Shorten long sentences — keep bullets concise and skimmable."); }
  if (words < 250) { score -= 25; suggestions.push("Add more detail about your experience and impact."); }
  if (!suggestions.length) suggestions.push("Good length and readability.");

  return { applicable: true, score: clamp(score), details: `~${Math.round(avgLen)} words per line/sentence on average.`, suggestions };
}

const EVALUATORS: Record<
  string,
  (input: EngineInput, index: ResumeIndex) => Partial<CriterionResult>
> = {
  jd_match: evalJdMatch,
  skills_coverage: evalSkillsCoverage,
  contact_info: (i) => evalContactInfo(i),
  sections: (i) => evalSections(i),
  action_impact: evalActionImpact,
  formatting: (i) => evalFormatting(i),
  readability: (i) => evalReadability(i),
};

function ratingFor(score: number): AtsReport["rating"] {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "Needs work";
}

/**
 * Run the full ATS analysis. Criteria and weights come from the caller (loaded
 * from admin-managed DB rows), so scoring is fully configurable at run time.
 */
export function runAtsEngine(input: EngineInput): AtsReport {
  const index = buildResumeIndex(input.resumeText);
  const enabled = input.criteria.filter((c: EngineCriterion) => c.enabled);

  const criteria: CriterionResult[] = [];
  for (const c of enabled) {
    const evaluator = EVALUATORS[c.key];
    if (!evaluator) continue; // unknown key (e.g. admin removed the evaluator) → skip
    const partial = evaluator(input, index);
    criteria.push({
      key: c.key,
      label: c.label,
      weight: c.weight,
      score: partial.score ?? 0,
      applicable: partial.applicable ?? true,
      details: partial.details ?? "",
      suggestions: partial.suggestions ?? [],
      matched: partial.matched,
      missing: partial.missing,
    });
  }

  // Weighted average over applicable criteria only (weights renormalised).
  const applicable = criteria.filter((c) => c.applicable);
  const totalWeight = applicable.reduce((sum, c) => sum + c.weight, 0);
  const overallScore = totalWeight
    ? clamp(applicable.reduce((sum, c) => sum + c.score * c.weight, 0) / totalWeight)
    : 0;

  const jd = criteria.find((c) => c.key === "jd_match");
  const wordCount = normalize(input.resumeText).split(" ").filter(Boolean).length;
  const links = input.resumeText.match(LINK_RE) ?? [];

  return {
    overallScore,
    rating: ratingFor(overallScore),
    summary: buildSummary(overallScore, criteria),
    wordCount,
    matchedKeywords: jd?.matched ?? [],
    missingKeywords: jd?.missing ?? [],
    contact: {
      email: input.resumeText.match(EMAIL_RE)?.[0] ?? null,
      phone: input.resumeText.match(PHONE_RE)?.[0]?.trim() ?? null,
      links: [...new Set(links)].slice(0, 5),
    },
    criteria,
  };
}

function buildSummary(score: number, criteria: CriterionResult[]): string {
  const weakest = [...criteria]
    .filter((c) => c.applicable)
    .sort((a, b) => a.score - b.score)[0];
  const band =
    score >= 85 ? "This resume is highly ATS-optimised."
    : score >= 70 ? "This resume is solid and ATS-friendly with a few improvements available."
    : score >= 50 ? "This resume passes basic ATS checks but needs work to stand out."
    : "This resume is likely to struggle with ATS screening.";
  return weakest ? `${band} Focus first on “${weakest.label}”.` : band;
}
