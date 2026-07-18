"use client";

import { useEffect, useMemo, useState } from "react";

type Skill = {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  weight: number;
};

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  // Add form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [aliases, setAliases] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function load() {
    const d = await fetch("/api/admin/ats/skills").then((r) => r.json());
    setSkills(d.skills);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/ats/skills")
      .then((r) => r.json())
      .then((d) => {
        if (active) {
          setSkills(d.skills);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => [...new Set(skills.map((s) => s.category))].sort(),
    [skills]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of skills) {
      if (filter && s.category !== filter) continue;
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [skills, filter]);

  async function addSkill(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setAddError(null);
    const res = await fetch("/api/admin/ats/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, aliases }),
    });
    setAdding(false);
    if (res.ok) {
      setName(""); setAliases("");
      await load();
    } else {
      const body = await res.json().catch(() => ({}));
      setAddError(body.error ?? "Could not add skill.");
    }
  }

  async function remove(id: string, label: string) {
    if (!confirm(`Remove “${label}” from the dictionary?`)) return;
    const res = await fetch(`/api/admin/ats/skills/${id}`, { method: "DELETE" });
    if (res.ok) setSkills((prev) => prev.filter((s) => s.id !== id));
  }

  async function saveAliases(id: string, value: string) {
    const res = await fetch(`/api/admin/ats/skills/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aliases: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSkills((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  }

  if (loading) return <p className="text-slate-500">Loading skills…</p>;

  return (
    <div className="space-y-6">
      {/* Add skill */}
      <form onSubmit={addSkill} className="card p-5">
        <h2 className="text-sm font-semibold text-slate-900">Add a skill</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Skill name" className="input" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="Category" list="ats-categories" className="input" />
          <input value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="Aliases (comma separated)" className="input sm:col-span-1" />
          <button type="submit" disabled={adding} className="btn-primary">
            {adding ? "Adding…" : "Add skill"}
          </button>
        </div>
        <datalist id="ats-categories">
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>
        {addError && <p className="mt-2 text-sm text-rose-600">{addError}</p>}
      </form>

      {/* Category filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Filter:</span>
        <button onClick={() => setFilter("")} className={`rounded-full px-3 py-1 text-sm ${filter === "" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
          All ({skills.length})
        </button>
        {categories.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`rounded-full px-3 py-1 text-sm ${filter === c ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grouped skills */}
      {grouped.map(([cat, list]) => (
        <div key={cat} className="card p-5">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            {cat} <span className="text-slate-400">({list.length})</span>
          </h3>
          <div className="divide-y divide-slate-100">
            {list.map((s) => (
              <SkillRow key={s.id} skill={s} onRemove={remove} onSaveAliases={saveAliases} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillRow({
  skill,
  onRemove,
  onSaveAliases,
}: {
  skill: Skill;
  onRemove: (id: string, label: string) => void;
  onSaveAliases: (id: string, value: string) => void;
}) {
  const [aliases, setAliases] = useState(skill.aliases.join(", "));
  const dirty = aliases !== skill.aliases.join(", ");

  return (
    <div className="flex flex-wrap items-center gap-3 py-2.5">
      <span className="min-w-32 font-medium text-slate-800">{skill.name}</span>
      <input
        value={aliases}
        onChange={(e) => setAliases(e.target.value)}
        placeholder="aliases…"
        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      {dirty && (
        <button onClick={() => onSaveAliases(skill.id, aliases)} className="text-sm font-medium text-indigo-600 hover:underline">
          Save
        </button>
      )}
      <button onClick={() => onRemove(skill.id, skill.name)} className="text-sm font-medium text-rose-600 hover:text-rose-700">
        Delete
      </button>
    </div>
  );
}
