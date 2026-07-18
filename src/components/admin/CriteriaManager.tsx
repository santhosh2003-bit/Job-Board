"use client";

import { useEffect, useState } from "react";

type Criterion = {
  id: string;
  key: string;
  label: string;
  description: string;
  weight: number;
  enabled: boolean;
  order: number;
};

export function CriteriaManager() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ats/criteria")
      .then((r) => r.json())
      .then((d) => setCriteria(d.criteria))
      .finally(() => setLoading(false));
  }, []);

  const enabledTotal = criteria
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + c.weight, 0);

  function patch(id: string, changes: Partial<Criterion>) {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));
  }

  async function save(c: Criterion) {
    setSavingId(c.id);
    setSavedId(null);
    const res = await fetch(`/api/admin/ats/criteria/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weight: c.weight,
        enabled: c.enabled,
        label: c.label,
        description: c.description,
      }),
    });
    setSavingId(null);
    if (res.ok) {
      setSavedId(c.id);
      setTimeout(() => setSavedId((s) => (s === c.id ? null : s)), 1500);
    } else {
      alert("Failed to save criterion.");
    }
  }

  if (loading) return <p className="text-slate-500">Loading criteria…</p>;

  return (
    <div className="space-y-4">
      <p className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700 ring-1 ring-inset ring-indigo-200">
        Weights are relative — the engine normalises them across enabled criteria at scoring time.
        Enabled weight total: <strong>{enabledTotal}</strong>.
      </p>

      {criteria.map((c) => {
        const share = c.enabled && enabledTotal ? Math.round((c.weight / enabledTotal) * 100) : 0;
        return (
          <div key={c.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <input
                  value={c.label}
                  onChange={(e) => patch(c.id, { label: e.target.value })}
                  className="input font-medium"
                />
                <textarea
                  value={c.description}
                  onChange={(e) => patch(c.id, { description: e.target.value })}
                  rows={2}
                  className="input mt-2 resize-y text-sm"
                />
                <p className="mt-1 text-xs text-slate-400">
                  engine key: <code className="rounded bg-slate-100 px-1">{c.key}</code>
                  {c.enabled && <> · effective share ≈ {share}%</>}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={c.enabled}
                    onChange={(e) => patch(c.id, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Enabled
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Weight</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={c.weight}
                    onChange={(e) => patch(c.id, { weight: Number(e.target.value) })}
                    className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-3">
              {savedId === c.id && <span className="text-sm text-emerald-600">Saved ✓</span>}
              <button
                onClick={() => save(c)}
                disabled={savingId === c.id}
                className="btn-primary px-4 py-2 text-sm"
              >
                {savingId === c.id ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
