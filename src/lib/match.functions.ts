import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Score every semantically-similar job against a resume and store the results. */
export const runMatching = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ resumeId: z.string().uuid(), topK: z.number().min(10).max(200).default(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { scoreJob, explainScore } = await import("@/lib/agent.server");

    const { data: resume, error: resumeError } = await context.supabase
      .from("resumes")
      .select("id, parsed, embedding")
      .eq("id", data.resumeId)
      .maybeSingle();
    if (resumeError) throw new Error(resumeError.message);
    if (!resume?.embedding) throw new Error("Resume has no embedding yet. Re-upload it.");

    const { data: neighbours, error: rpcError } = await context.supabase.rpc("match_jobs", {
      query_embedding: resume.embedding as never,
      match_count: data.topK,
    });
    if (rpcError) throw new Error(rpcError.message);

    const list = (neighbours ?? []) as Array<{ job_id: string; similarity: number }>;
    if (list.length === 0) return { matched: 0 };

    const { data: jobs, error: jobsError } = await context.supabase
      .from("jobs")
      .select("id, title, company, description, skills, region, remote_type, location, visa_sponsorship")
      .in("id", list.map((n) => n.job_id));
    if (jobsError) throw new Error(jobsError.message);

    const simMap = new Map(list.map((n) => [n.job_id, Number(n.similarity)]));
    const parsed = resume.parsed as unknown as Parameters<typeof scoreJob>[0];

    const rows = (jobs ?? []).map((job) => {
      const similarity = simMap.get(job.id) ?? 0;
      const { score, breakdown } = scoreJob(parsed, job, similarity);
      return {
        user_id: context.userId,
        resume_id: data.resumeId,
        job_id: job.id,
        score,
        breakdown: breakdown as never,
        explanation: explainScore(parsed, job, breakdown, score),
      };
    });

    const { error } = await context.supabase
      .from("job_matches")
      .upsert(rows, { onConflict: "resume_id,job_id" });
    if (error) throw new Error(error.message);
    return { matched: rows.length };
  });

export const generateCoverLetter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ jobId: z.string().uuid(), resumeId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { chat, hashText } = await import("@/lib/ai.server");
    const { readCache, writeCache, checkAndBumpUsage } = await import("@/lib/agent.server");

    const [{ data: job }, { data: resume }] = await Promise.all([
      context.supabase.from("jobs").select("title, company, description, skills").eq("id", data.jobId).maybeSingle(),
      context.supabase.from("resumes").select("raw_text, parsed").eq("id", data.resumeId).maybeSingle(),
    ]);
    if (!job || !resume) throw new Error("Job or resume not found");

    const cacheKey = `cover:${hashText(`${job.title}${job.company}${job.description}`)}:${hashText(resume.raw_text)}`;
    const save = async (content: string) => {
      await context.supabase.from("cover_letters").upsert(
        { user_id: context.userId, job_id: data.jobId, resume_id: data.resumeId, content },
        { onConflict: "user_id,job_id,resume_id" },
      );
    };

    const cached = await readCache(cacheKey);
    if (cached?.["content"]) {
      const content = String(cached["content"]);
      await save(content);
      return { content, cached: true };
    }

    await checkAndBumpUsage(context.userId, "cover_letter", 10);

    const content = await chat(
      "You write concise, specific cover letters for DevOps and cloud engineering roles. 4 short paragraphs, no fluff, no invented experience, plain text only.",
      `JOB: ${job.title} at ${job.company}\nRequired skills: ${(job.skills ?? []).join(", ")}\nDescription: ${job.description.slice(0, 4000)}\n\nCANDIDATE RESUME:\n${resume.raw_text.slice(0, 6000)}`,
    );

    await writeCache(cacheKey, { content });
    await save(content);
    return { content, cached: false };
  });
