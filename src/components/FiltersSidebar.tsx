"use client";

import { useState } from "react";
import { JobFilters } from "@/components/JobFilters";

/** Wraps the filters: always visible on desktop, collapsible on mobile. */
export function FiltersSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="btn-secondary mb-4 w-full lg:hidden"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 6h18M6 12h12M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {open ? "Hide filters" : "Show filters"}
      </button>

      <div className={`${open ? "block" : "hidden"} lg:block`}>
        <div className="card p-5 lg:sticky lg:top-20">
          <JobFilters />
        </div>
      </div>
    </div>
  );
}
