import { SkillsManager } from "@/components/admin/SkillsManager";

export const dynamic = "force-dynamic";

export default function AdminSkillsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Skills dictionary</h1>
      <p className="mt-1 text-slate-600">
        The keywords powering skills-coverage scoring. Add skills per category and give
        each one aliases (e.g. “JavaScript” → “js”) so the matcher recognises variations.
      </p>
      <div className="mt-6">
        <SkillsManager />
      </div>
    </div>
  );
}
