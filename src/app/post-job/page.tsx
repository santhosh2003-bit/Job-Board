import type { Metadata } from "next";
import { PostJobForm } from "@/components/PostJobForm";

export const metadata: Metadata = {
  title: "Post a job",
  description: "Publish a job listing on WorkWave in minutes.",
};

export default function PostJobPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Post a job
        </h1>
        <p className="mt-2 text-slate-600">
          Fill in the details below. Your listing goes live instantly and appears
          in search right away — no account required for this demo.
        </p>
      </header>
      <PostJobForm />
    </div>
  );
}
