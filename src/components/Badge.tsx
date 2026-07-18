import { ReactNode } from "react";

type Variant = "default" | "brand" | "green" | "amber" | "slate";

const variants: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700",
  brand: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  slate: "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200",
};

export function Badge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
