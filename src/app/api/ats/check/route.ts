import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractResumeText,
  UnsupportedFileError,
  EmptyResumeError,
} from "@/lib/ats/extract";
import { runAtsEngine } from "@/lib/ats/engine";
import type { EngineCriterion, EngineSkill } from "@/lib/ats/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** POST /api/ats/check — analyse an uploaded resume and return an ATS report. */
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = form.get("resume");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Please attach a resume file." }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (max 5 MB)." }, { status: 422 });
  }

  const jobId = str(form.get("jobId"));
  const pastedJd = str(form.get("jobDescription"));
  const candidateName = str(form.get("candidateName"));
  const candidateEmail = str(form.get("candidateEmail"));

  // Resolve the job description + category, either from a selected job or pasted text.
  let jobDescription: string | null = pastedJd || null;
  let jobCategory: string | null = null;
  let jobTitle: string | null = null;
  if (jobId) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (job) {
      jobTitle = `${job.title} · ${job.company}`;
      jobCategory = job.category;
      jobDescription = [job.description, job.requirements.join("\n"), job.tags.join(", ")]
        .filter(Boolean)
        .join("\n");
    }
  }

  // Extract text from the uploaded file.
  let resumeText: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    ({ text: resumeText } = await extractResumeText(buffer, file.name, file.type));
  } catch (err) {
    if (err instanceof UnsupportedFileError || err instanceof EmptyResumeError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("Resume extraction failed:", err);
    return NextResponse.json({ error: "Could not read this file. Try a different format." }, { status: 422 });
  }

  // Load admin-managed scoring config.
  const [criteriaRows, skillRows] = await Promise.all([
    prisma.atsCriterion.findMany({ orderBy: { order: "asc" } }),
    prisma.atsSkill.findMany(),
  ]);

  const criteria: EngineCriterion[] = criteriaRows.map((c) => ({
    key: c.key, label: c.label, description: c.description, weight: c.weight, enabled: c.enabled,
  }));
  const skills: EngineSkill[] = skillRows.map((s) => ({
    name: s.name, category: s.category, aliases: s.aliases, weight: s.weight,
  }));

  const report = runAtsEngine({ resumeText, jobDescription, jobCategory, criteria, skills });

  // Persist the report so admins can review every check.
  await prisma.atsCheck.create({
    data: {
      candidateName: candidateName || null,
      candidateEmail: candidateEmail || null,
      resumeFileName: file.name,
      jobId: jobId || null,
      jobTitle,
      hasJobDescription: Boolean(jobDescription),
      overallScore: report.overallScore,
      rating: report.rating,
      breakdown: report.criteria,
      matchedKeywords: report.matchedKeywords,
      missingKeywords: report.missingKeywords,
      wordCount: report.wordCount,
      textPreview: resumeText.slice(0, 600),
    },
  });

  return NextResponse.json(report);
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
