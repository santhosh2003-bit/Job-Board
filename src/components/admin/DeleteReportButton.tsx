"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteReportButton({
  id,
  label,
  redirectTo,
}: {
  id: string;
  label: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete the report for “${label}”?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/ats/checks/${id}`, { method: "DELETE" });
    if (res.ok) {
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } else {
      alert("Could not delete report.");
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onDelete}
      disabled={busy}
      className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
