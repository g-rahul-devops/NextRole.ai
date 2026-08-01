import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listSavedJobs } from "@/lib/jobs.functions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "Saved jobs — PipelineMatch" },
      { name: "description", content: "Roles you bookmarked for later." },
      { property: "og:title", content: "Saved jobs — PipelineMatch" },
      { property: "og:description", content: "Your shortlist of DevOps and SRE roles." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const saved = useQuery({ queryKey: ["saved"], queryFn: () => listSavedJobs() });

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label">shortlist</p>
        <h1 className="mt-1 text-2xl font-semibold">Saved jobs</h1>
      </div>
      {saved.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : saved.data?.length ? (
        <div className="space-y-3">
          {saved.data.map((row) => {
            const job = row.jobs as { id: string; title: string; company: string; location: string | null; visa_sponsorship: string } | null;
            if (!job) return null;
            return (
              <div key={row.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
                <div>
                  <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="font-semibold hover:text-primary">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {job.company} · {job.location ?? "—"}
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  visa: {job.visa_sponsorship}
                </Badge>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing saved yet.
        </p>
      )}
    </div>
  );
}
