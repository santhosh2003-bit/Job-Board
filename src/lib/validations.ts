import { z } from "zod";

const jobTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "TEMPORARY",
]);

const experienceEnum = z.enum(["INTERN", "ENTRY", "MID", "SENIOR", "LEAD"]);

/** Accepts either a real array or a newline / comma separated string from a textarea. */
const stringList = z
  .union([z.array(z.string()), z.string()])
  .transform((val) =>
    (Array.isArray(val) ? val : val.split(/\r?\n|,/))
      .map((s) => s.trim())
      .filter(Boolean)
  );

export const createJobSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    company: z.string().min(2, "Company name is required").max(120),
    companyLogo: z.string().url().optional().or(z.literal("")),
    companyWebsite: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    location: z.string().min(2, "Location is required").max(120),
    type: jobTypeEnum,
    category: z.string().min(2, "Category is required"),
    experienceLevel: experienceEnum,
    remote: z.boolean().default(false),
    salaryMin: z.coerce.number().int().nonnegative().optional(),
    salaryMax: z.coerce.number().int().nonnegative().optional(),
    currency: z.string().default("USD"),
    description: z.string().min(30, "Please write at least 30 characters"),
    requirements: stringList.default([]),
    benefits: stringList.default([]),
    tags: stringList.default([]),
    applyEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
    featured: z.boolean().default(false),
  })
  .refine(
    (d) => !d.salaryMin || !d.salaryMax || d.salaryMax >= d.salaryMin,
    { message: "Maximum salary must be greater than minimum", path: ["salaryMax"] }
  );

export const applicationSchema = z.object({
  name: z.string().min(2, "Your name is required").max(120),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(40).optional().or(z.literal("")),
  resumeUrl: z.string().url("Enter a valid link to your resume").optional().or(z.literal("")),
  linkedinUrl: z.string().url("Enter a valid LinkedIn URL").optional().or(z.literal("")),
  coverLetter: z.string().max(5000).optional().or(z.literal("")),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type ApplicationInput = z.infer<typeof applicationSchema>;
