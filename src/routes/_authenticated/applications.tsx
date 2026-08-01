import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listApplications } from "@/lib/jobs.functions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({
    meta: [
      { title: "Application tracker — PipelineMatch" },
      { name: "description", content: "Track applied, interview, rejected and offer stages for every role." },
      { property: "og:title", content: "Application tracker — PipelineMatch" },
      { property: "og:description", content: "Your DevOps job pipeline, stage by stage." },
    ],
  }),
  component: ApplicationsPage,
});

const COLUMNS = ["applied", "interview", "rejected", "offer"] as const;

function ApplicationsPage() {
  const apps = useQuery({ queryKey: ["applications"], queryFn: () => listApplications() });

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label">pipeline</p>
        <h1 className="mt-1 text-2xl font-semibold">Application tracker</h1>
      </div>
      {apps.isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {COLUMNS.map((col) => {
            const items = (apps.data ?? []).filter((a) => a.status === col);
            return (
              <div key={col} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="mono-label">{col}</p>
                  <Badge variant="secondary">{items.length}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  {items.map((a) => {
                    const job = a.jobs as { id: string; title: string; company: string } | null;
                    if (!job) return null;
                    return (
                      <Link
                        key={a.id}
                        to="/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="block rounded-lg bg-secondary/50 p-3 text-sm hover:bg-secondary"
                      >
                        <span className="font-medium">{job.title}</span>
                        <span className="block text-xs text-muted-foreground">{job.company}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
