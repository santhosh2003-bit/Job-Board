"use client";

import { useRef, useState } from "react";
import { AtsReportView } from "@/components/ats/AtsReport";
import type { AtsReport } from "@/lib/ats/types";

type JobOption = { id: string; title: string; company: string };
type Mode = "job" | "paste" | "none";

export function AtsChecker({ jobs }: { jobs: JobOption[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("job");
  const [jobId, setJobId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "analyzing" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AtsReport | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    const ok = /\.(pdf|docx|txt)$/i.test(f.name);
    if (!ok) {
      setError("Please upload a PDF, DOCX, or TXT file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File is too large (max 5 MB).");
      return;
    }
    setFile(f);
  }

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please attach your resume first.");
      return;
    }
    setStatus("analyzing");
    setError(null);

    const fd = new FormData();
    fd.append("resume", file);
    if (mode === "job" && jobId) fd.append("jobId", jobId);
    if (mode === "paste" && jobDescription.trim()) fd.append("jobDescription", jobDescription.trim());
    if (name.trim()) fd.append("candidateName", name.trim());
    if (email.trim()) fd.append("candidateEmail", email.trim());

    try {
      const res = await fetch("/api/ats/check", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong analysing your resume.");
        setStatus("idle");
        return;
      }
      setReport(body);
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  function reset() {
    setReport(null);
    setStatus("idle");
    setFile(null);
    setError(null);
  }

  if (status === "done" && report) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Analysed <span className="font-medium text-slate-700">{file?.name}</span>
          </p>
          <button onClick={reset} className="btn-secondary">
            Check another resume
          </button>
        </div>
        <AtsReportView report={report} />
      </div>
    );
  }

  return (
    <form onSubmit={analyze} className="space-y-6">
      {/* Upload */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">1. Upload your resume</h2>
        <p className="mt-1 text-sm text-slate-500">PDF, DOCX, or TXT — up to 5 MB. Text-based files score best.</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-indigo-300 hover:bg-slate-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-slate-400" aria-hidden="true">
            <path d="M12 16V4m0 0 4 4m-4-4L8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {file ? (
            <p className="mt-2 font-medium text-slate-900">{file.name}</p>
          ) : (
            <>
              <p className="mt-2 font-medium text-slate-700">Drop your resume here, or click to browse</p>
              <p className="text-sm text-slate-400">We never store your file — only the resulting score.</p>
            </>
          )}
        </div>
      </div>

      {/* Target */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">2. Match against a role (optional)</h2>
        <p className="mt-1 text-sm text-slate-500">
          Add a target job for keyword-match scoring, or skip for a general ATS check.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <ModeTab active={mode === "job"} onClick={() => setMode("job")}>Pick a listed job</ModeTab>
          <ModeTab active={mode === "paste"} onClick={() => setMode("paste")}>Paste a job description</ModeTab>
          <ModeTab active={mode === "none"} onClick={() => setMode("none")}>General check</ModeTab>
        </div>

        {mode === "job" && (
          <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="input mt-4">
            <option value="">Select a job…</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
            ))}
          </select>
        )}
        {mode === "paste" && (
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={6}
            className="input mt-4 resize-y"
            placeholder="Paste the full job description here…"
          />
        )}
        {mode === "none" && (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-500">
            No job selected — we&apos;ll score general ATS-friendliness (sections, contact info,
            skills, formatting, impact) without keyword matching.
          </p>
        )}
      </div>

      {/* Optional identity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-slate-900">3. Your details (optional)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ats-name" className="label">Name</label>
            <input id="ats-name" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Ada Lovelace" />
          </div>
          <div>
            <label htmlFor="ats-email" className="label">Email</label>
            <input id="ats-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="ada@example.com" />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {error}
        </p>
      )}

      <button type="submit" disabled={status === "analyzing"} className="btn-primary w-full py-3 text-base">
        {status === "analyzing" ? "Analysing your resume…" : "Check ATS score"}
      </button>
    </form>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
