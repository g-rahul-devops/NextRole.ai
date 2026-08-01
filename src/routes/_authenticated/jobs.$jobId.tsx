import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getJob, toggleSaveJob, upsertApplication } from "@/lib/jobs.functions";
import { generateCoverLetter } from "@/lib/match.functions";
import { listResumes } from "@/lib/resume.functions";
import { useActiveResume } from "@/hooks/use-active-resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job detail — PipelineMatch" },
      { name: "description", content: "Match breakdown, visa signal and AI cover letter for this role." },
      { property: "og:title", content: "Job detail — PipelineMatch" },
      { property: "og:description", content: "See why this DevOps role scored the way it did." },
    ],
  }),
  component: JobDetail,
});

const STATUSES = ["applied", "interview", "rejected", "offer"] as const;

function JobDetail() {
  const { jobId } = Route.useParams();
  const qc = useQueryClient();
  const save = useServerFn(toggleSaveJob);
  const setStatus = useServerFn(upsertApplication);
  const writeLetter = useServerFn(generateCoverLetter);
  const [letter, setLetter] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const resumes = useQuery({ queryKey: ["resumes"], queryFn: () => listResumes() });
  const { resumeId } = useActiveResume(resumes.data);
  const detail = useQuery({
    queryKey: ["job", jobId, resumeId],
    queryFn: () => getJob({ data: { id: jobId, resumeId } }),
  });

  if (detail.isLoading) return <Skeleton className="h-96 w-full" />;
  if (!detail.data) return <p className="text-sm text-muted-foreground">Job not found.</p>;

  const { job, match, saved, application } = detail.data;
  const breakdown = (match?.breakdown ?? {}) as Record<string, number>;

  return (
    <div className="space-y-6">
      <Link to="/jobs" className="mono-label hover:text-foreground">
        ← back to jobs
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h1 className="text-2xl font-semibold">{job.title}</h1>
            <p className="mt-1 text-muted-foreground">
              {job.company} · {job.location ?? "—"}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <Badge variant="outline" className="font-mono text-[11px]">
                {job.remote_type}
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                visa: {job.visa_sponsorship}
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                {job.source}
              </Badge>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <a href={job.apply_url} target="_blank" rel="noreferrer noopener">
                  Apply
                </a>
              </Button>
              <Button
                variant={saved ? "secondary" : "outline"}
                onClick={async () => {
                  await save({ data: { jobId } });
                  qc.invalidateQueries({ queryKey: ["job", jobId] });
                }}
              >
                {saved ? "Saved" : "Save"}
              </Button>
              {STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={application?.status === s ? "default" : "ghost"}
                  onClick={async () => {
                    await setStatus({ data: { jobId, status: s } });
                    qc.invalidateQueries();
                    toast.success(`Marked ${s}`);
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {(job.description ?? "").slice(0, 8000)}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Match</h2>
            {match ? (
              <>
                <p className="mt-2 font-mono text-4xl font-bold text-primary">{Math.round(Number(match.score))}</p>
                <div className="mt-4 space-y-2">
                  {Object.entries(breakdown).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-mono">{Math.round(Number(v))}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{match.explanation}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Not scored yet — run matching from the dashboard.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Cover letter</h2>
            <Button
              className="mt-3 w-full"
              disabled={!resumeId || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const r = await writeLetter({ data: { jobId, resumeId: resumeId! } });
                  setLetter(r.content);
                } catch (e) {
                  toast.error((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Writing…" : "Generate"}
            </Button>
            {(letter ?? detail.data.coverLetter) && (
              <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
                {letter ?? detail.data.coverLetter}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
