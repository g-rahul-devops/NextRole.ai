import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const JobFilters = z.object({
  q: z.string().max(120).optional(),
  region: z.enum(["all", "remote", "india", "other"]).default("all"),
  remoteType: z.enum(["all", "remote", "hybrid", "onsite", "unknown"]).default("all"),
  visa: z.enum(["all", "yes", "no", "unclear"]).default("all"),
  minSalary: z.number().min(0).max(1_000_000).optional(),
  minScore: z.number().min(0).max(100).default(0),
  resumeId: z.string().uuid().nullable().optional(),
  limit: z.number().min(1).max(100).default(50),
});

export type JobFilterInput = z.input<typeof JobFilters>;

export const listJobs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => JobFilters.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("jobs")
      .select(
        "id, title, company, location, region, remote_type, salary_min, salary_max, salary_currency, skills, visa_sponsorship, source, posted_date, apply_url",
      )
      .order("posted_date", { ascending: false, nullsFirst: false })
      .limit(data.limit);

    if (data.q) query = query.or(`title.ilike.%${data.q}%,company.ilike.%${data.q}%`);
    if (data.region !== "all") query = query.eq("region", data.region);
    if (data.remoteType !== "all") query = query.eq("remote_type", data.remoteType);
    if (data.visa !== "all") query = query.eq("visa_sponsorship", data.visa);
    if (data.minSalary) query = query.gte("salary_max", data.minSalary);

    const { data: jobs, error } = await query;
    if (error) throw new Error(error.message);

    const ids = (jobs ?? []).map((j) => j.id);
    const [{ data: matches }, { data: saved }] = await Promise.all([
      data.resumeId
        ? context.supabase
            .from("job_matches")
            .select("job_id, score")
            .eq("resume_id", data.resumeId)
            .in("job_id", ids)
        : Promise.resolve({ data: [] as Array<{ job_id: string; score: number }> }),
      context.supabase.from("saved_jobs").select("job_id").in("job_id", ids),
    ]);

    const scoreMap = new Map((matches ?? []).map((m) => [m.job_id, Number(m.score)]));
    const savedSet = new Set((saved ?? []).map((s) => s.job_id));

    return (jobs ?? [])
      .map((j) => ({ ...j, score: scoreMap.get(j.id) ?? null, saved: savedSet.has(j.id) }))
      .filter((j) => (data.minScore > 0 ? (j.score ?? -1) >= data.minScore : true))
      .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  });

export const getJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), resumeId: z.string().uuid().nullable().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: job, error } = await context.supabase.from("jobs").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!job) throw new Error("Job not found");

    const [{ data: match }, { data: saved }, { data: application }, { data: letter }] = await Promise.all([
      data.resumeId
        ? context.supabase
            .from("job_matches")
            .select("score, breakdown, explanation")
            .eq("job_id", data.id)
            .eq("resume_id", data.resumeId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      context.supabase.from("saved_jobs").select("id").eq("job_id", data.id).maybeSingle(),
      context.supabase.from("applications").select("id, status").eq("job_id", data.id).maybeSingle(),
      data.resumeId
        ? context.supabase
            .from("cover_letters")
            .select("content")
            .eq("job_id", data.id)
            .eq("resume_id", data.resumeId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const { embedding: _embedding, ...rest } = job as Record<string, unknown>;
    return {
      job: rest as Omit<typeof job, "embedding">,
      match,
      saved: Boolean(saved),
      application,
      coverLetter: letter?.content ?? null,
    };
  });

export const toggleSaveJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ jobId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("saved_jobs")
      .select("id")
      .eq("job_id", data.jobId)
      .maybeSingle();
    if (existing) {
      await context.supabase.from("saved_jobs").delete().eq("id", existing.id);
      return { saved: false };
    }
    const { error } = await context.supabase
      .from("saved_jobs")
      .insert({ user_id: context.userId, job_id: data.jobId });
    if (error) throw new Error(error.message);
    return { saved: true };
  });

export const listSavedJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_jobs")
      .select("id, created_at, jobs(id, title, company, location, remote_type, visa_sponsorship, apply_url)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        jobId: z.string().uuid(),
        status: z.enum(["applied", "interview", "rejected", "offer"]),
        notes: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("applications").upsert(
      {
        user_id: context.userId,
        job_id: data.jobId,
        status: data.status,
        notes: data.notes ?? null,
      },
      { onConflict: "user_id,job_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("applications")
      .select("id, status, notes, updated_at, job_id, jobs(id, title, company, location, apply_url)")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ count: jobCount }, { data: matches }, { data: apps }, { count: savedCount }] = await Promise.all([
      context.supabase.from("jobs").select("id", { count: "exact", head: true }),
      context.supabase.from("job_matches").select("score"),
      context.supabase.from("applications").select("status"),
      context.supabase.from("saved_jobs").select("id", { count: "exact", head: true }),
    ]);

    const scores = (matches ?? []).map((m) => Number(m.score));
    const funnel = { applied: 0, interview: 0, rejected: 0, offer: 0 };
    for (const a of apps ?? []) funnel[a.status as keyof typeof funnel] += 1;

    return {
      totalJobs: jobCount ?? 0,
      scoredJobs: scores.length,
      savedJobs: savedCount ?? 0,
      averageScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : 0,
      strongMatches: scores.filter((s) => s >= 70).length,
      funnel,
    };
  });

export const getConnectorStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { ALL_CONNECTORS } = await import("@/lib/connectors");
    return ALL_CONNECTORS.map((c) => ({ id: c.id, label: c.label, configured: c.isConfigured() }));
  });

export const triggerJobFetch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        keywords: z.array(z.string().max(80)).max(8).optional(),
        locations: z.array(z.string().max(60)).max(8).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { runFetchAgent, checkAndBumpUsage } = await import("@/lib/agent.server");
    await checkAndBumpUsage(context.userId, "job_fetch", 20);
    return runFetchAgent({ keywords: data.keywords, locations: data.locations });
  });
