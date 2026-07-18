import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="text-6xl font-black text-indigo-600">404</span>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        removed.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-secondary">
          Go home
        </Link>
        <Link href="/jobs" className="btn-primary">
          Browse jobs
        </Link>
      </div>
    </div>
  );
}
