"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  CATEGORIES,
  CURRENCIES,
} from "@/lib/constants";

type FieldErrors = Record<string, string[] | undefined>;

export function PostJobForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      ...Object.fromEntries(fd.entries()),
      remote: fd.get("remote") === "on",
      featured: fd.get("featured") === "on",
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 201) {
        const job = await res.json();
        router.push(`/jobs/${job.id}`);
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (res.status === 422 && body.issues) {
        setErrors(body.issues);
        // Surface the first error location to the user.
        setFormError("Please fix the highlighted fields below.");
      } else {
        setFormError(body.error ?? "Something went wrong. Please try again.");
      }
      setSubmitting(false);
    } catch {
      setFormError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8" noValidate>
      {formError && (
        <p className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">
          {formError}
        </p>
      )}

      <FormSection
        title="Role details"
        subtitle="The essentials candidates see first."
      >
        <Field label="Job title" name="title" errors={errors.title} required full>
          <input id="title" name="title" required className="input" placeholder="Senior Frontend Engineer" />
        </Field>
        <Field label="Company" name="company" errors={errors.company} required>
          <input id="company" name="company" required className="input" placeholder="Acme Inc." />
        </Field>
        <Field label="Location" name="location" errors={errors.location} required>
          <input id="location" name="location" required className="input" placeholder="Berlin, Germany" />
        </Field>
        <Field label="Job type" name="type" errors={errors.type} required>
          <select id="type" name="type" className="input" defaultValue="FULL_TIME">
            {JOB_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Experience level" name="experienceLevel" errors={errors.experienceLevel} required>
          <select id="experienceLevel" name="experienceLevel" className="input" defaultValue="MID">
            {EXPERIENCE_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Category" name="category" errors={errors.category} required>
          <select id="category" name="category" className="input" defaultValue="Engineering">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
          <input type="checkbox" name="remote" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          This role can be done remotely
        </label>
      </FormSection>

      <FormSection title="Compensation" subtitle="Optional, but listings with salary get more applicants.">
        <Field label="Minimum salary" name="salaryMin" errors={errors.salaryMin}>
          <input id="salaryMin" name="salaryMin" type="number" min={0} className="input" placeholder="90000" />
        </Field>
        <Field label="Maximum salary" name="salaryMax" errors={errors.salaryMax}>
          <input id="salaryMax" name="salaryMax" type="number" min={0} className="input" placeholder="130000" />
        </Field>
        <Field label="Currency" name="currency" errors={errors.currency}>
          <select id="currency" name="currency" className="input" defaultValue="USD">
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </FormSection>

      <FormSection title="Description" subtitle="Sell the role. Markdown-style line breaks are preserved.">
        <Field label="About the role" name="description" errors={errors.description} required full>
          <textarea
            id="description"
            name="description"
            rows={6}
            required
            className="input resize-y"
            placeholder="What will this person work on? What does success look like?"
          />
        </Field>
        <Field label="Requirements" name="requirements" errors={errors.requirements} full hint="One per line.">
          <textarea id="requirements" name="requirements" rows={4} className="input resize-y" placeholder={"5+ years with React\nStrong TypeScript skills"} />
        </Field>
        <Field label="Benefits" name="benefits" errors={errors.benefits} full hint="One per line.">
          <textarea id="benefits" name="benefits" rows={3} className="input resize-y" placeholder={"Equity\nRemote-first\nHealth insurance"} />
        </Field>
        <Field label="Skills / tags" name="tags" errors={errors.tags} full hint="Comma separated.">
          <input id="tags" name="tags" className="input" placeholder="React, TypeScript, Next.js" />
        </Field>
      </FormSection>

      <FormSection title="Company & application" subtitle="Where should candidates learn more and apply?">
        <Field label="Company website" name="companyWebsite" errors={errors.companyWebsite}>
          <input id="companyWebsite" name="companyWebsite" type="url" className="input" placeholder="https://acme.com" />
        </Field>
        <Field label="Company logo URL" name="companyLogo" errors={errors.companyLogo}>
          <input id="companyLogo" name="companyLogo" type="url" className="input" placeholder="https://…/logo.png" />
        </Field>
        <Field label="Application email" name="applyEmail" errors={errors.applyEmail}>
          <input id="applyEmail" name="applyEmail" type="email" className="input" placeholder="jobs@acme.com" />
        </Field>
        <label className="flex items-center gap-2 pt-6 text-sm text-slate-700">
          <input type="checkbox" name="featured" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
          Feature this job on the homepage
        </label>
      </FormSection>

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <button type="submit" disabled={submitting} className="btn-primary px-6">
          {submitting ? "Publishing…" : "Publish job"}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  errors,
  required,
  full,
  hint,
  children,
}: {
  label: string;
  name: string;
  errors?: string[];
  required?: boolean;
  full?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={name} className="label">
        {label}
        {required && <span className="text-rose-500"> *</span>}
        {hint && <span className="ml-1 font-normal text-slate-400">— {hint}</span>}
      </label>
      {children}
      {errors?.length ? (
        <p className="mt-1 text-xs text-rose-600">{errors[0]}</p>
      ) : null}
    </div>
  );
}
