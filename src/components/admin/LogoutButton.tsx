"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button onClick={logout} disabled={busy} className="btn-ghost w-full justify-start text-sm">
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
