// Human-readable labels and option lists shared across forms and filters.

export const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "INTERN", label: "Internship" },
  { value: "ENTRY", label: "Entry level" },
  { value: "MID", label: "Mid level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead / Principal" },
] as const;

export const CATEGORIES = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Customer Support",
  "Data & Analytics",
  "Finance",
  "Human Resources",
  "Operations",
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "salary_high", label: "Highest salary" },
] as const;

export const CURRENCIES = ["USD", "EUR", "GBP", "INR"] as const;

export const PAGE_SIZE = 8;

export const jobTypeLabel = (value: string) =>
  JOB_TYPES.find((t) => t.value === value)?.label ?? value;

export const experienceLabel = (value: string) =>
  EXPERIENCE_LEVELS.find((e) => e.value === value)?.label ?? value;
