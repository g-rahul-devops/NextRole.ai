import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { listResumes, uploadResume, deleteResume } from "@/lib/resume.functions";
import { getConnectorStatus, triggerJobFetch, getAnalytics } from "@/lib/jobs.functions";
import { runMatching } from "@/lib/match.functions";
import { useActiveResume } from "@/hooks/use-active-resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Upload, RefreshCw, Sparkles, Trash2, CheckCircle2, CircleDashed } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — PipelineMatch" },
      { name: "description", content: "Upload your resume, run the fetch agent and score DevOps jobs." },
      { property: "og:title", content: "Dashboard — PipelineMatch" },
      { property: "og:description", content: "Resume parsing, job ingestion and match scoring in one place." },
    ],
  }),
  component: Dashboard,
});

type Parsed = {
  summary: string;
  skills: string[];
  titles: string[];
  certifications: string[];
  yearsExperience: number;
  industries: string[];
};

function Dashboard() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = useServerFn(uploadResume);
  const remove = useServerFn(deleteResume);
  const fetchJobs = useServerFn(triggerJobFetch);
  const match = useServerFn(runMatching);

  const resumes = useQuery({ queryKey: ["resumes"], queryFn: () => listResumes() });
  const connectors = useQuery({ queryKey: ["connectors"], queryFn: () => getConnectorStatus() });
  const stats = useQuery({ queryKey: ["analytics"], queryFn: () => getAnalytics() });
  const { resumeId, select } = useActiveResume(resumes.data);

  const fetchMutation = useMutation({
    mutationFn: () => fetchJobs({ data: {} }),
    onSuccess: (r) => {
      toast.success(`Fetched ${r.fetched} postings · ${r.inserted} new · ${r.duplicates} duplicates`);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const matchMutation = useMutation({
    mutationFn: () => match({ data: { resumeId: resumeId!, topK: 80 } }),
    onSuccess: (r) => {
      toast.success(`Scored ${r.matched} jobs against your resume`);
      qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function onFile(file: File) {
    setUploading(true);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      let binary = "";
      for (let i = 0; i < buffer.length; i += 8192) {
        binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
      }
      await upload({
        data: { fileName: file.name, mimeType: file.type || "application/octet-stream", base64: btoa(binary) },
      });
      toast.success("Resume parsed");
      qc.invalidateQueries({ queryKey: ["resumes"] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const active = resumes.data?.find((r) => r.id === resumeId);
  const parsed = active?.parsed as Parsed | undefined;

  return (
    <div className="space-y-8">
      <div>
        <p className="mono-label">control plane</p>
        <h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Jobs indexed", value: stats.data?.totalJobs ?? 0 },
          { label: "Scored", value: stats.data?.scoredJobs ?? 0 },
          { label: "Strong matches (70+)", value: stats.data?.strongMatches ?? 0 },
          { label: "Avg match score", value: stats.data?.averageScore ?? 0 },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <p className="mono-label">{s.label}</p>
            <p className="mt-2 font-mono text-3xl font-bold text-primary">{s.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Resume</h2>
              <p className="text-sm text-muted-foreground">PDF, DOCX-exported text or plain text.</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onFile(f);
              }}
            />
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="size-4" />
              {uploading ? "Parsing…" : "Upload"}
            </Button>
          </div>

          {resumes.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : resumes.data?.length ? (
            <div className="space-y-2">
              {resumes.data.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    r.id === resumeId ? "border-primary/60 bg-secondary/40" : "border-border"
                  }`}
                >
                  <button className="flex-1 text-left" onClick={() => select(r.id)}>
                    <p className="text-sm font-medium">{r.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()} ·{" "}
                      {(r.parsed as Parsed | null)?.skills?.length ?? 0} skills detected
                    </p>
                  </button>
                  {r.id === resumeId && <Badge>Active</Badge>}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      await remove({ data: { id: r.id } });
                      qc.invalidateQueries({ queryKey: ["resumes"] });
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No resume yet. Upload one to unlock matching.
            </p>
          )}

          {parsed && (
            <div className="space-y-3 rounded-lg bg-secondary/40 p-4">
              <p className="text-sm text-muted-foreground">{parsed.summary}</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.skills?.slice(0, 24).map((s) => (
                  <Badge key={s} variant="secondary" className="font-mono text-[11px]">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="mono-label">
                {parsed.yearsExperience} yrs experience · {parsed.certifications?.length ?? 0} certifications
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Agent actions</h2>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => fetchMutation.mutate()}
              disabled={fetchMutation.isPending}
            >
              <RefreshCw className={`size-4 ${fetchMutation.isPending ? "animate-spin" : ""}`} />
              {fetchMutation.isPending ? "Fetching…" : "Run fetch agent"}
            </Button>
            <Button
              className="w-full"
              onClick={() => matchMutation.mutate()}
              disabled={!resumeId || matchMutation.isPending}
            >
              <Sparkles className="size-4" />
              {matchMutation.isPending ? "Scoring…" : "Score jobs vs resume"}
            </Button>
            {matchMutation.isPending && <Progress value={65} />}
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-base font-semibold">Source connectors</h2>
            {connectors.data?.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span>{c.label}</span>
                {c.configured ? (
                  <span className="flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="size-4" /> ready
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CircleDashed className="size-4" /> needs key
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
