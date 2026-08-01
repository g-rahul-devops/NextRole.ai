import { ALL_CONNECTORS, t as dedupeKey } from "./connectors-CeaEoGbG.js";
import { chat, embedTexts, hashText } from "./ai.server-BiSpfVnc.js";
import { createClient } from "@supabase/supabase-js";
//#region src/integrations/supabase/client.server.ts
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
function createSupabaseAdminClient() {
	const SUPABASE_URL = process.env["SUPABASE_URL"];
	const SUPABASE_SERVICE_ROLE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"];
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []].join(", ")}. Connect Supabase in Lovable Cloud.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		global: { fetch: createSupabaseFetch(SUPABASE_SERVICE_ROLE_KEY) },
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
var _supabaseAdmin;
var supabaseAdmin = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
	return Reflect.get(_supabaseAdmin, prop, receiver);
} });
//#endregion
//#region src/lib/agent.server.ts
var ROLE_KEYWORDS = [
	"DevOps Engineer",
	"Site Reliability Engineer",
	"Cloud Engineer",
	"Platform Engineer",
	"Azure DevOps Engineer",
	"GCP DevOps Engineer",
	"Infrastructure Engineer",
	"CI/CD Engineer"
];
var MAX_LLM_VISA_CALLS = 12;
async function runFetchAgent(input) {
	const keywords = input.keywords?.length ? input.keywords : ROLE_KEYWORDS.slice(0, 3);
	const locations = input.locations?.length ? input.locations : ["Remote", "India"];
	const perQuery = input.perQuery ?? 20;
	const report = {
		fetched: 0,
		inserted: 0,
		duplicates: 0,
		llmVisaCalls: 0,
		bySource: {},
		errors: [],
		skipped: []
	};
	const collected = /* @__PURE__ */ new Map();
	for (const connector of ALL_CONNECTORS) {
		if (!connector.isConfigured()) {
			report.skipped.push(connector.label);
			continue;
		}
		for (const location of locations) {
			for (const keyword of keywords) try {
				const jobs = await connector.fetch({
					keyword,
					location,
					limit: perQuery
				});
				report.fetched += jobs.length;
				report.bySource[connector.id] = (report.bySource[connector.id] ?? 0) + jobs.length;
				for (const job of jobs) {
					if (!job.apply_url) continue;
					const k = dedupeKey(job);
					if (collected.has(k)) {
						report.duplicates += 1;
						continue;
					}
					collected.set(k, job);
				}
			} catch (error) {
				report.errors.push(`${connector.id}/${keyword}/${location}: ${error.message}`);
			}
			if (connector.id === "remotive" || connector.id === "arbeitnow") break;
		}
	}
	const candidates = [...collected.values()];
	if (candidates.length === 0) return report;
	const { data: existing } = await supabaseAdmin.from("jobs").select("dedupe_key").in("dedupe_key", candidates.map(dedupeKey));
	const known = new Set((existing ?? []).map((r) => r.dedupe_key));
	const fresh = candidates.filter((j) => !known.has(dedupeKey(j)));
	report.duplicates += candidates.length - fresh.length;
	if (fresh.length === 0) return report;
	let llmBudget = MAX_LLM_VISA_CALLS;
	for (const job of fresh) {
		if (job.visa_sponsorship !== "unclear" || llmBudget <= 0 || job.description.length < 200) continue;
		const cacheKey = `visa:${hashText(job.description)}`;
		const cached = await readCache(cacheKey);
		if (cached) {
			job.visa_sponsorship = cached["status"] ?? "unclear";
			continue;
		}
		llmBudget -= 1;
		report.llmVisaCalls += 1;
		try {
			const answer = await chat("You classify visa sponsorship in job descriptions. Reply with JSON {\"status\":\"yes\"|\"no\"|\"unclear\"}. Answer \"yes\" ONLY if the text explicitly offers sponsorship or relocation support. Answer \"no\" only if it explicitly excludes sponsorship or requires existing work authorization. Otherwise answer \"unclear\". Never guess.", job.description.slice(0, 4e3), { json: true });
			const parsed = JSON.parse(answer);
			const status = parsed.status === "yes" || parsed.status === "no" ? parsed.status : "unclear";
			job.visa_sponsorship = status;
			await writeCache(cacheKey, { status });
		} catch {
			job.visa_sponsorship = "unclear";
		}
	}
	const embeddings = await embedTexts(fresh.map((j) => `${j.title} at ${j.company}. ${j.location}. Skills: ${j.skills.join(", ")}. ${j.description}`));
	const rows = fresh.map((job, i) => ({
		source: job.source,
		source_job_id: job.source_job_id,
		title: job.title,
		company: job.company,
		description: job.description.slice(0, 2e4),
		location: job.location,
		country: job.country,
		region: job.region,
		remote_type: job.remote_type,
		salary_min: job.salary_min,
		salary_max: job.salary_max,
		salary_currency: job.salary_currency,
		skills: job.skills,
		visa_sponsorship: job.visa_sponsorship,
		apply_url: job.apply_url,
		posted_date: job.posted_date,
		dedupe_key: dedupeKey(job),
		embedding: JSON.stringify(embeddings[i] ?? [])
	}));
	const { data: inserted, error } = await supabaseAdmin.from("jobs").upsert(rows, {
		onConflict: "dedupe_key",
		ignoreDuplicates: true
	}).select("id");
	if (error) report.errors.push(error.message);
	report.inserted = inserted?.length ?? 0;
	return report;
}
async function parseResume(text) {
	const cacheKey = `resume:${hashText(text)}`;
	const cached = await readCache(cacheKey);
	if (cached) return cached;
	const raw = await chat("You extract structured data from resumes. Return JSON with keys: full_name (string), summary (2 sentences), skills (array of lowercase technology strings, max 40), titles (array of job titles held), years_experience (number), certifications (array), industries (array), preferred_locations (array). Use empty values when unknown; never invent facts.", text.slice(0, 2e4), { json: true });
	let parsed = {};
	try {
		parsed = JSON.parse(raw);
	} catch {
		parsed = {};
	}
	const result = {
		full_name: String(parsed.full_name ?? ""),
		summary: String(parsed.summary ?? ""),
		skills: (parsed.skills ?? []).map((s) => String(s).toLowerCase()).slice(0, 40),
		titles: (parsed.titles ?? []).map(String).slice(0, 12),
		years_experience: Number(parsed.years_experience ?? 0) || 0,
		certifications: (parsed.certifications ?? []).map(String).slice(0, 20),
		industries: (parsed.industries ?? []).map(String).slice(0, 10),
		preferred_locations: (parsed.preferred_locations ?? []).map(String).slice(0, 10)
	};
	await writeCache(cacheKey, result);
	return result;
}
var WEIGHTS = {
	skills: .45,
	experience: .2,
	certification: .1,
	location: .1,
	industry: .15
};
var CERT_HINTS = [
	"az-",
	"aws certified",
	"gcp",
	"cka",
	"ckad",
	"terraform associate",
	"azure administrator",
	"professional cloud"
];
function scoreJob(resume, job, similarity) {
	const jobText = `${job.title} ${job.description}`.toLowerCase();
	const jobSkills = job.skills.length ? job.skills : [];
	const matchedSkills = jobSkills.filter((s) => resume.skills.some((r) => r.includes(s) || s.includes(r)));
	const skills = jobSkills.length ? matchedSkills.length / jobSkills.length : Math.max(0, similarity);
	const wanted = /(\d+)\+?\s*years?/.exec(jobText);
	const required = wanted ? Number(wanted[1]) : 3;
	const experience = Math.min(1, resume.years_experience / Math.max(required, 1));
	const certification = resume.certifications.length ? resume.certifications.some((c) => CERT_HINTS.some((h) => c.toLowerCase().includes(h)) || jobText.includes(c.toLowerCase())) ? 1 : .5 : 0;
	const prefs = resume.preferred_locations.map((p) => p.toLowerCase());
	const location = job.remote_type === "remote" ? 1 : prefs.length === 0 ? .6 : prefs.some((p) => job.location.toLowerCase().includes(p) || job.region.includes(p)) ? 1 : .3;
	const industry = Math.max(0, Math.min(1, similarity));
	const breakdown = {
		skills,
		experience,
		certification,
		location,
		industry
	};
	const score = 100 * (skills * WEIGHTS.skills + experience * WEIGHTS.experience + certification * WEIGHTS.certification + location * WEIGHTS.location + industry * WEIGHTS.industry);
	return {
		score: Math.round(score * 10) / 10,
		breakdown
	};
}
function explainScore(resume, job, breakdown, score) {
	const matched = job.skills.filter((s) => resume.skills.some((r) => r.includes(s) || s.includes(r)));
	const missing = job.skills.filter((s) => !matched.includes(s));
	return [
		`Overall match ${score}/100 for ${job.title} at ${job.company}.`,
		matched.length ? `Skill overlap (${Math.round(breakdown.skills * 100)}%): ${matched.slice(0, 8).join(", ")}.` : "No direct skill keywords matched from the posting.",
		missing.length ? `Gaps to address: ${missing.slice(0, 6).join(", ")}.` : "No obvious skill gaps.",
		`Experience fit ${Math.round(breakdown.experience * 100)}%, certifications ${Math.round(breakdown.certification * 100)}%, location fit ${Math.round(breakdown.location * 100)}% (${job.remote_type}).`,
		`Visa sponsorship: ${job.visa_sponsorship}.`
	].join(" ");
}
async function readCache(cacheKey) {
	const { data } = await supabaseAdmin.from("ai_cache").select("value").eq("cache_key", cacheKey).maybeSingle();
	return data?.value ?? null;
}
async function writeCache(cacheKey, value) {
	await supabaseAdmin.from("ai_cache").upsert({
		cache_key: cacheKey,
		value
	});
}
async function checkAndBumpUsage(userId, kind, dailyCap) {
	const day = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	const { data } = await supabaseAdmin.from("ai_usage").select("count").eq("user_id", userId).eq("day", day).eq("kind", kind).maybeSingle();
	const used = data?.count ?? 0;
	if (used >= dailyCap) throw new Error(`Daily limit reached (${dailyCap} ${kind} generations per day).`);
	await supabaseAdmin.from("ai_usage").upsert({
		user_id: userId,
		day,
		kind,
		count: used + 1
	});
	return used + 1;
}
//#endregion
export { checkAndBumpUsage, explainScore, parseResume, readCache, runFetchAgent, scoreJob, writeCache };
