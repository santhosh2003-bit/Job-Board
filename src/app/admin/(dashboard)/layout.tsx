import type { Metadata } from "next";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Admin · ATS",
};

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              ATS Admin
            </p>
          </div>
          <AdminNav />
          <div className="mt-6 space-y-1 border-t border-slate-200 pt-4">
            <Link href="/ats" className="btn-ghost w-full justify-start text-sm">
              Open ATS checker ↗
            </Link>
            <LogoutButton />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
