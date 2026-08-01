import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listJobs, toggleSaveJob } from "@/lib/jobs.functions";
import { listResumes } from "@/lib/resume.functions";
import { useActiveResume } from "@/hooks/use-active-resume";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/jobs/")({
  head: () => ({
    meta: [
      { title: "Jobs — PipelineMatch" },
      { name: "description", content: "Browse and filter DevOps, SRE and cloud roles ranked by match score." },
      { property: "og:title", content: "Jobs — PipelineMatch" },
      { property: "og:description", content: "Filter by region, remote type, visa sponsorship and match score." },
    ],
  }),
  component: JobsPage,
});

const REGIONS = ["all", "remote", "india", "other"] as const;
const VISAS = ["all", "yes", "no", "unclear"] as const;

function JobsPage() {
  const qc = useQueryClient();
  const save = useServerFn(toggleSaveJob);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("all");
  const [visa, setVisa] = useState<(typeof VISAS)[number]>("all");

  const resumes = useQuery({ queryKey: ["resumes"], queryFn: () => listResumes() });
  const { resumeId } = useActiveResume(resumes.data);

  const jobs = useQuery({
    queryKey: ["jobs", q, region, visa, resumeId],
    queryFn: () => listJobs({ data: { q: q || undefined, region, visa, resumeId, limit: 60 } }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label">index</p>
        <h1 className="mt-1 text-2xl font-semibold">Jobs</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
        <Input
          className="w-full sm:max-w-xs"
          placeholder="Search title or company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="flex gap-1">
          {REGIONS.map((r) => (
            <Button key={r} size="sm" variant={region === r ? "default" : "ghost"} onClick={() => setRegion(r)}>
              {r}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {VISAS.map((v) => (
            <Button key={v} size="sm" variant={visa === v ? "secondary" : "ghost"} onClick={() => setVisa(v)}>
              visa: {v}
            </Button>
          ))}
        </div>
      </div>

      {jobs.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : jobs.data?.length ? (
        <div className="space-y-3">
          {jobs.data.map((job) => (
            <article key={job.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    to="/jobs/$jobId"
                    params={{ jobId: job.id }}
                    className="text-base font-semibold hover:text-primary"
                  >
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {job.company} · <MapPin className="inline size-3" /> {job.location ?? "—"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {job.remote_type}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      visa: {job.visa_sponsorship}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {job.source}
                    </Badge>
                    {(job.skills ?? []).slice(0, 5).map((s: string) => (
                      <Badge key={s} variant="secondary" className="font-mono text-[11px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {job.score != null && (
                    <span className="font-mono text-2xl font-bold text-primary">{Math.round(job.score)}</span>
                  )}
                  <Button
                    size="icon"
                    variant={job.saved ? "default" : "ghost"}
                    onClick={async () => {
                      await save({ data: { jobId: job.id } });
                      qc.invalidateQueries({ queryKey: ["jobs"] });
                    }}
                  >
                    <Bookmark className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No jobs yet — run the fetch agent from the dashboard.
        </p>
      )}
    </div>
  );
}
