"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  CATEGORIES,
} from "@/lib/constants";

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page"); // any filter change resets pagination
      router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
    },
    [router, searchParams]
  );

  const active = (key: string) => searchParams.get(key) ?? "";
  const hasFilters = Array.from(searchParams.keys()).some((k) => k !== "page");

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="text-xs font-medium text-indigo-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Remote toggle */}
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5">
        <span className="text-sm font-medium text-slate-700">Remote only</span>
        <input
          type="checkbox"
          checked={active("remote") === "true"}
          onChange={(e) => setParam("remote", e.target.checked ? "true" : null)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
      </label>

      <FilterGroup label="Job type">
        {JOB_TYPES.map((t) => (
          <RadioRow
            key={t.value}
            name="type"
            label={t.label}
            checked={active("type") === t.value}
            onSelect={() =>
              setParam("type", active("type") === t.value ? null : t.value)
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Experience level">
        {EXPERIENCE_LEVELS.map((e) => (
          <RadioRow
            key={e.value}
            name="experienceLevel"
            label={e.label}
            checked={active("experienceLevel") === e.value}
            onSelect={() =>
              setParam(
                "experienceLevel",
                active("experienceLevel") === e.value ? null : e.value
              )
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Category">
        <select
          value={active("category")}
          onChange={(e) => setParam("category", e.target.value || null)}
          className="input"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup label="Minimum salary">
        <select
          value={active("minSalary")}
          onChange={(e) => setParam("minSalary", e.target.value || null)}
          className="input"
        >
          <option value="">Any salary</option>
          <option value="50000">50k+</option>
          <option value="80000">80k+</option>
          <option value="100000">100k+</option>
          <option value="150000">150k+</option>
        </select>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function RadioRow({
  label,
  checked,
  onSelect,
}: {
  name: string;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
        checked
          ? "bg-indigo-50 font-medium text-indigo-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span
        className={`grid h-4 w-4 place-items-center rounded-full border ${
          checked ? "border-indigo-600" : "border-slate-300"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
      </span>
      {label}
    </button>
  );
}
