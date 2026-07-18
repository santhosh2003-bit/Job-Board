"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Hero search box that routes to the filtered jobs listing. */
export function SearchBar({ size = "lg" }: { size?: "lg" | "sm" }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (location.trim()) params.set("location", location.trim());
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  }

  const pad = size === "lg" ? "py-3.5" : "py-2.5";

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm sm:flex-row"
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-400 shrink-0" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="m20 20-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Job title, company or keyword"
          aria-label="Search keyword"
          className={`w-full bg-transparent ${pad} text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none`}
        />
      </div>
      <div className="flex flex-1 items-center gap-2 border-t border-slate-100 px-3 sm:border-l sm:border-t-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-slate-400 shrink-0" aria-hidden="true">
          <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
        </svg>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (or 'remote')"
          aria-label="Search location"
          className={`w-full bg-transparent ${pad} text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none`}
        />
      </div>
      <button type="submit" className="btn-primary shrink-0 px-6">
        Search
      </button>
    </form>
  );
}
