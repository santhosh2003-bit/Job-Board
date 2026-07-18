"use client";

import { useState } from "react";

type FieldErrors = Record<string, string[] | undefined>;

export function ApplyForm({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrors({});
    setFormError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 201) {
        setStatus("success");
        return;
      }
      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && body.issues) {
        setErrors(body.issues);
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
      setStatus("idle");
    } catch {
      setFormError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-900">
          Application sent!
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Thanks for applying to {jobTitle}. The team will be in touch if
          there&apos;s a match.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {formError && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {formError}
        </p>
      )}

      <Field label="Full name" name="name" errors={errors.name} required>
        <input id="name" name="name" required className="input" placeholder="Ada Lovelace" />
      </Field>

      <Field label="Email" name="email" errors={errors.email} required>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="ada@example.com"
        />
      </Field>

      <Field label="Phone" name="phone" errors={errors.phone}>
        <input id="phone" name="phone" className="input" placeholder="Optional" />
      </Field>

      <Field label="Resume / portfolio link" name="resumeUrl" errors={errors.resumeUrl}>
        <input
          id="resumeUrl"
          name="resumeUrl"
          type="url"
          className="input"
          placeholder="https://…"
        />
      </Field>

      <Field label="LinkedIn" name="linkedinUrl" errors={errors.linkedinUrl}>
        <input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          className="input"
          placeholder="https://linkedin.com/in/…"
        />
      </Field>

      <Field label="Cover letter" name="coverLetter" errors={errors.coverLetter}>
        <textarea
          id="coverLetter"
          name="coverLetter"
          rows={4}
          className="input resize-y"
          placeholder="Tell the team why you're a great fit (optional)"
        />
      </Field>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="btn-primary w-full"
      >
        {status === "submitting" ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  errors,
  required,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {errors?.length ? (
        <p className="mt-1 text-xs text-rose-600">{errors[0]}</p>
      ) : null}
    </div>
  );
}
