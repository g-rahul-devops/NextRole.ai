import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-B0PkXF8x.js";
import { t as requireSupabaseAuth } from "./auth-middleware-BxjOzQ2s.js";
import { z } from "zod";
//#region src/lib/jobs.functions.ts?tss-serverfn-split
var JobFilters = z.object({
	q: z.string().max(120).optional(),
	region: z.enum([
		"all",
		"remote",
		"india",
		"other"
	]).default("all"),
	remoteType: z.enum([
		"all",
		"remote",
		"hybrid",
		"onsite",
		"unknown"
	]).default("all"),
	visa: z.enum([
		"all",
		"yes",
		"no",
		"unclear"
	]).default("all"),
	minSalary: z.number().min(0).max(1e6).optional(),
	minScore: z.number().min(0).max(100).default(0),
	resumeId: z.string().uuid().nullable().optional(),
	limit: z.number().min(1).max(100).default(50)
});
var listJobs_createServerFn_handler = createServerRpc({
	id: "0f6b44b459f0f5a7154aecdbd6de5f39fc93825d0d32caf19f26936089e5a107",
	name: "listJobs",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => listJobs.__executeServer(opts));
var listJobs = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => JobFilters.parse(input ?? {})).handler(listJobs_createServerFn_handler, async ({ data, context }) => {
	let query = context.supabase.from("jobs").select("id, title, company, location, region, remote_type, salary_min, salary_max, salary_currency, skills, visa_sponsorship, source, posted_date, apply_url").order("posted_date", {
		ascending: false,
		nullsFirst: false
	}).limit(data.limit);
	if (data.q) query = query.or(`title.ilike.%${data.q}%,company.ilike.%${data.q}%`);
	if (data.region !== "all") query = query.eq("region", data.region);
	if (data.remoteType !== "all") query = query.eq("remote_type", data.remoteType);
	if (data.visa !== "all") query = query.eq("visa_sponsorship", data.visa);
	if (data.minSalary) query = query.gte("salary_max", data.minSalary);
	const { data: jobs, error } = await query;
	if (error) throw new Error(error.message);
	const ids = (jobs ?? []).map((j) => j.id);
	const [{ data: matches }, { data: saved }] = await Promise.all([data.resumeId ? context.supabase.from("job_matches").select("job_id, score").eq("resume_id", data.resumeId).in("job_id", ids) : Promise.resolve({ data: [] }), context.supabase.from("saved_jobs").select("job_id").in("job_id", ids)]);
	const scoreMap = new Map((matches ?? []).map((m) => [m.job_id, Number(m.score)]));
	const savedSet = new Set((saved ?? []).map((s) => s.job_id));
	return (jobs ?? []).map((j) => ({
		...j,
		score: scoreMap.get(j.id) ?? null,
		saved: savedSet.has(j.id)
	})).filter((j) => data.minScore > 0 ? (j.score ?? -1) >= data.minScore : true).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
});
var getJob_createServerFn_handler = createServerRpc({
	id: "432b934c493a65b20930541aa425464f2c52d0a8716794775211fc250ec5a8e5",
	name: "getJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => getJob.__executeServer(opts));
var getJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	id: z.string().uuid(),
	resumeId: z.string().uuid().nullable().optional()
}).parse(input)).handler(getJob_createServerFn_handler, async ({ data, context }) => {
	const { data: job, error } = await context.supabase.from("jobs").select("*").eq("id", data.id).maybeSingle();
	if (error) throw new Error(error.message);
	if (!job) throw new Error("Job not found");
	const [{ data: match }, { data: saved }, { data: application }, { data: letter }] = await Promise.all([
		data.resumeId ? context.supabase.from("job_matches").select("score, breakdown, explanation").eq("job_id", data.id).eq("resume_id", data.resumeId).maybeSingle() : Promise.resolve({ data: null }),
		context.supabase.from("saved_jobs").select("id").eq("job_id", data.id).maybeSingle(),
		context.supabase.from("applications").select("id, status").eq("job_id", data.id).maybeSingle(),
		data.resumeId ? context.supabase.from("cover_letters").select("content").eq("job_id", data.id).eq("resume_id", data.resumeId).maybeSingle() : Promise.resolve({ data: null })
	]);
	const { embedding: _embedding, ...rest } = job;
	return {
		job: rest,
		match,
		saved: Boolean(saved),
		application,
		coverLetter: letter?.content ?? null
	};
});
var toggleSaveJob_createServerFn_handler = createServerRpc({
	id: "702b9359b7913381e3b818f46684f0ed1b39bd979cdfa85f3856c27775156b6e",
	name: "toggleSaveJob",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => toggleSaveJob.__executeServer(opts));
var toggleSaveJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ jobId: z.string().uuid() }).parse(input)).handler(toggleSaveJob_createServerFn_handler, async ({ data, context }) => {
	const { data: existing } = await context.supabase.from("saved_jobs").select("id").eq("job_id", data.jobId).maybeSingle();
	if (existing) {
		await context.supabase.from("saved_jobs").delete().eq("id", existing.id);
		return { saved: false };
	}
	const { error } = await context.supabase.from("saved_jobs").insert({
		user_id: context.userId,
		job_id: data.jobId
	});
	if (error) throw new Error(error.message);
	return { saved: true };
});
var listSavedJobs_createServerFn_handler = createServerRpc({
	id: "2c06aacbcf719a925c7d165f0977564cfec342c6156da0e5c258b040d57b4dd2",
	name: "listSavedJobs",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => listSavedJobs.__executeServer(opts));
var listSavedJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listSavedJobs_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("saved_jobs").select("id, created_at, jobs(id, title, company, location, remote_type, visa_sponsorship, apply_url)").order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var upsertApplication_createServerFn_handler = createServerRpc({
	id: "792210c7315a59fe411cdcbde6b92c2df155775bb5f334f33833363966ee2f51",
	name: "upsertApplication",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => upsertApplication.__executeServer(opts));
var upsertApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	jobId: z.string().uuid(),
	status: z.enum([
		"applied",
		"interview",
		"rejected",
		"offer"
	]),
	notes: z.string().max(2e3).optional()
}).parse(input)).handler(upsertApplication_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.from("applications").upsert({
		user_id: context.userId,
		job_id: data.jobId,
		status: data.status,
		notes: data.notes ?? null
	}, { onConflict: "user_id,job_id" });
	if (error) throw new Error(error.message);
	return { ok: true };
});
var listApplications_createServerFn_handler = createServerRpc({
	id: "add962f30e7e6f17f7a3e016f6f563c125cffa3cffc19ef07fc9df766c3e7a4f",
	name: "listApplications",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => listApplications.__executeServer(opts));
var listApplications = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listApplications_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("applications").select("id, status, notes, updated_at, job_id, jobs(id, title, company, location, apply_url)").order("updated_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getAnalytics_createServerFn_handler = createServerRpc({
	id: "aac7fdb5cfcc81f2a2a6d032202ea8285078fc4cd5911c834cd76e41a2c289e5",
	name: "getAnalytics",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => getAnalytics.__executeServer(opts));
var getAnalytics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getAnalytics_createServerFn_handler, async ({ context }) => {
	const [{ count: jobCount }, { data: matches }, { data: apps }, { count: savedCount }] = await Promise.all([
		context.supabase.from("jobs").select("id", {
			count: "exact",
			head: true
		}),
		context.supabase.from("job_matches").select("score"),
		context.supabase.from("applications").select("status"),
		context.supabase.from("saved_jobs").select("id", {
			count: "exact",
			head: true
		})
	]);
	const scores = (matches ?? []).map((m) => Number(m.score));
	const funnel = {
		applied: 0,
		interview: 0,
		rejected: 0,
		offer: 0
	};
	for (const a of apps ?? []) funnel[a.status] += 1;
	return {
		totalJobs: jobCount ?? 0,
		scoredJobs: scores.length,
		savedJobs: savedCount ?? 0,
		averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0,
		strongMatches: scores.filter((s) => s >= 70).length,
		funnel
	};
});
var getConnectorStatus_createServerFn_handler = createServerRpc({
	id: "ce0cdde59de02a91c3f3cc4a253aec45c2984e89034d48b2bab11edade9edc86",
	name: "getConnectorStatus",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => getConnectorStatus.__executeServer(opts));
var getConnectorStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getConnectorStatus_createServerFn_handler, async () => {
	const { ALL_CONNECTORS } = await import("./connectors-CeaEoGbG.js");
	return ALL_CONNECTORS.map((c) => ({
		id: c.id,
		label: c.label,
		configured: c.isConfigured()
	}));
});
var triggerJobFetch_createServerFn_handler = createServerRpc({
	id: "f7d8bf980f9bc0ce8a4aa2265d3f24ceffbc1d7e96a7d0e1556aca7460ea3cfc",
	name: "triggerJobFetch",
	filename: "src/lib/jobs.functions.ts"
}, (opts) => triggerJobFetch.__executeServer(opts));
var triggerJobFetch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	keywords: z.array(z.string().max(80)).max(8).optional(),
	locations: z.array(z.string().max(60)).max(8).optional()
}).parse(input ?? {})).handler(triggerJobFetch_createServerFn_handler, async ({ data, context }) => {
	const { runFetchAgent, checkAndBumpUsage } = await import("./agent.server-dcUdr-4K.js");
	await checkAndBumpUsage(context.userId, "job_fetch", 20);
	return runFetchAgent({
		keywords: data.keywords,
		locations: data.locations
	});
});
//#endregion
export { getAnalytics_createServerFn_handler, getConnectorStatus_createServerFn_handler, getJob_createServerFn_handler, listApplications_createServerFn_handler, listJobs_createServerFn_handler, listSavedJobs_createServerFn_handler, toggleSaveJob_createServerFn_handler, triggerJobFetch_createServerFn_handler, upsertApplication_createServerFn_handler };
