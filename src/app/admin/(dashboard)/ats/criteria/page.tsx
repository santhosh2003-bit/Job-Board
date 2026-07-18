import { CriteriaManager } from "@/components/admin/CriteriaManager";

export const dynamic = "force-dynamic";

export default function AdminCriteriaPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scoring criteria</h1>
      <p className="mt-1 text-slate-600">
        Tune what the ATS score rewards. Adjust weights, toggle dimensions on or off,
        and edit the labels candidates see — changes apply to the next check instantly.
      </p>
      <div className="mt-6">
        <CriteriaManager />
      </div>
    </div>
  );
}
