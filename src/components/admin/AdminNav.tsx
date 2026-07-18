"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/ats/criteria", label: "Scoring criteria" },
  { href: "/admin/ats/skills", label: "Skills dictionary" },
  { href: "/admin/ats/reports", label: "Candidate reports" },
];

export function AdminNav() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="space-y-1">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive(l.href, l.exact)
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
