"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteJobButton({
  jobId,
  jobTitle,
}: {
  jobId: string;
  jobTitle: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onDelete() {
    if (!confirm(`Delete “${jobTitle}”? This also removes its applications.`))
      return;
    setBusy(true);
    const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Could not delete the job. Please try again.");
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={busy}
      className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
    >
      {busy ? "Deleting…" : "Delete"}
    </button>
  );
}
