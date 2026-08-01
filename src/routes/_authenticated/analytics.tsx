import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/lib/jobs.functions";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — PipelineMatch" },
      { name: "description", content: "Match quality and application funnel analytics for your DevOps job search." },
      { property: "og:title", content: "Analytics — PipelineMatch" },
      { property: "og:description", content: "Funnel conversion and match score distribution." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const stats = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics() });
  const d = stats.data;
  const total = d ? Object.values(d.funnel).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="mono-label">telemetry</p>
        <h1 className="mt-1 text-2xl font-semibold">Analytics</h1>
      </div>
      {stats.isLoading || !d ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Jobs indexed", value: d.totalJobs },
              { label: "Scored jobs", value: d.scoredJobs },
              { label: "Saved", value: d.savedJobs },
              { label: "Avg score", value: d.averageScore },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                <p className="mono-label">{s.label}</p>
                <p className="mt-2 font-mono text-3xl font-bold text-primary">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Application funnel</h2>
            <div className="mt-4 space-y-4">
              {Object.entries(d.funnel).map(([stage, count]) => (
                <div key={stage}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{stage}</span>
                    <span className="font-mono">{count}</span>
                  </div>
                  <Progress className="mt-1" value={total ? (count / total) * 100 : 0} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
