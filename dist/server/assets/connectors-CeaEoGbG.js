//#region src/lib/connectors/types.ts
var SKILL_VOCAB = [
	"azure",
	"gcp",
	"google cloud",
	"aws",
	"kubernetes",
	"docker",
	"terraform",
	"ansible",
	"jenkins",
	"github actions",
	"azure pipelines",
	"azure devops",
	"cloud build",
	"gitlab ci",
	"argocd",
	"helm",
	"prometheus",
	"grafana",
	"linux",
	"python",
	"bash",
	"go",
	"ci/cd",
	"sre",
	"observability",
	"istio",
	"packer",
	"pulumi",
	"cloudformation",
	"datadog",
	"elk",
	"postgres",
	"kafka",
	"vault"
];
function extractSkills(text) {
	const lower = (text || "").toLowerCase();
	return SKILL_VOCAB.filter((s) => lower.includes(s));
}
function stripHtml(html) {
	return (html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();
}
var INDIA_HINTS = [
	"india",
	"bengaluru",
	"bangalore",
	"hyderabad",
	"pune",
	"chennai",
	"gurgaon",
	"gurugram",
	"noida",
	"delhi",
	"mumbai",
	"kolkata"
];
function classifyRegion(location, remote) {
	const l = (location || "").toLowerCase();
	if (INDIA_HINTS.some((h) => l.includes(h))) return "india";
	if (remote === "remote") return "remote";
	return "other";
}
function detectRemote(text) {
	const l = (text || "").toLowerCase();
	if (l.includes("hybrid")) return "hybrid";
	if (l.includes("remote") || l.includes("work from home") || l.includes("anywhere")) return "remote";
	if (l.includes("on-site") || l.includes("onsite") || l.includes("in office")) return "onsite";
	return "unknown";
}
var SPONSOR_YES = [
	"visa sponsorship available",
	"visa sponsorship is available",
	"we sponsor",
	"will sponsor",
	"sponsorship available",
	"h-1b sponsorship",
	"h1b sponsorship",
	"tier 2 sponsorship",
	"skilled worker visa",
	"relocation assistance",
	"relocation package",
	"work permit sponsorship"
];
var SPONSOR_NO = [
	"no visa sponsorship",
	"we do not sponsor",
	"we are unable to sponsor",
	"unable to provide sponsorship",
	"sponsorship is not available",
	"not able to sponsor",
	"must have valid work authorization",
	"must be authorized to work",
	"without sponsorship",
	"no sponsorship"
];
/**
* Rule-based visa classification. NEVER assumes sponsorship — returns "unclear"
* unless the description states it explicitly.
*/
function classifyVisaByRules(text) {
	const l = (text || "").toLowerCase();
	if (SPONSOR_NO.some((p) => l.includes(p))) return "no";
	if (SPONSOR_YES.some((p) => l.includes(p))) return "yes";
	return "unclear";
}
function dedupeKey(job) {
	const norm = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, 8).join(" ");
	return `${norm(job.company)}|${norm(job.title)}|${norm(job.location).slice(0, 24)}`;
}
//#endregion
//#region src/lib/connectors/index.ts
/**
* Remotive — public remote-jobs API, no key required.
* https://remotive.com/api/remote-jobs
*/
var remotiveConnector = {
	id: "remotive",
	label: "Remotive (remote jobs)",
	isConfigured: () => true,
	async fetch({ keyword, limit }) {
		const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=${limit}`;
		const res = await fetch(url, { headers: { accept: "application/json" } });
		if (!res.ok) throw new Error(`Remotive ${res.status}`);
		return ((await res.json()).jobs ?? []).slice(0, limit).map((raw) => {
			const description = stripHtml(String(raw["description"] ?? ""));
			const location = String(raw["candidate_required_location"] ?? "Remote");
			const remote_type = "remote";
			return {
				source: "remotive",
				source_job_id: String(raw["id"]),
				title: String(raw["title"] ?? "Untitled"),
				company: String(raw["company_name"] ?? "Unknown"),
				description,
				location,
				country: null,
				region: classifyRegion(location, remote_type),
				remote_type,
				salary_min: null,
				salary_max: null,
				salary_currency: null,
				skills: extractSkills(`${raw["title"]} ${description}`),
				visa_sponsorship: classifyVisaByRules(description),
				apply_url: String(raw["url"] ?? ""),
				posted_date: raw["publication_date"] ? String(raw["publication_date"]) : null
			};
		});
	}
};
/**
* Arbeitnow — public job board API, no key required. Good EU coverage.
*/
var arbeitnowConnector = {
	id: "arbeitnow",
	label: "Arbeitnow (EU / remote)",
	isConfigured: () => true,
	async fetch({ keyword, limit }) {
		const res = await fetch("https://www.arbeitnow.com/api/job-board-api", { headers: { accept: "application/json" } });
		if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
		const body = await res.json();
		const kw = keyword.toLowerCase().split(" ")[0] ?? "";
		return (body.data ?? []).filter((raw) => String(raw["title"] ?? "").toLowerCase().includes(kw)).slice(0, limit).map((raw) => {
			const description = stripHtml(String(raw["description"] ?? ""));
			const location = String(raw["location"] ?? "");
			const remote_type = raw["remote"] === true ? "remote" : detectRemote(location);
			const created = Number(raw["created_at"] ?? 0);
			return {
				source: "arbeitnow",
				source_job_id: String(raw["slug"]),
				title: String(raw["title"] ?? "Untitled"),
				company: String(raw["company_name"] ?? "Unknown"),
				description,
				location,
				country: null,
				region: classifyRegion(location, remote_type),
				remote_type,
				salary_min: null,
				salary_max: null,
				salary_currency: null,
				skills: extractSkills(`${raw["title"]} ${description}`),
				visa_sponsorship: classifyVisaByRules(description),
				apply_url: String(raw["url"] ?? ""),
				posted_date: created ? (/* @__PURE__ */ new Date(created * 1e3)).toISOString() : null
			};
		});
	}
};
/**
* Adzuna — requires ADZUNA_APP_ID + ADZUNA_APP_KEY (free tier).
*/
var adzunaConnector = {
	id: "adzuna",
	label: "Adzuna (global + India)",
	isConfigured: () => Boolean(process.env["ADZUNA_APP_ID"] && process.env["ADZUNA_APP_KEY"]),
	async fetch({ keyword, location, limit }) {
		const appId = process.env["ADZUNA_APP_ID"];
		const appKey = process.env["ADZUNA_APP_KEY"];
		if (!appId || !appKey) return [];
		const country = adzunaCountry(location);
		const params = new URLSearchParams({
			app_id: appId,
			app_key: appKey,
			what: keyword,
			results_per_page: String(Math.min(limit, 50)),
			content_type: "application/json"
		});
		if (location && !isCountryOnly(location)) params.set("where", location);
		const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`);
		if (!res.ok) throw new Error(`Adzuna ${res.status}`);
		return ((await res.json()).results ?? []).map((raw) => {
			const description = stripHtml(String(raw["description"] ?? ""));
			const loc = String(raw["location"]?.display_name ?? "");
			const remote_type = detectRemote(`${raw["title"]} ${loc} ${description}`);
			return {
				source: "adzuna",
				source_job_id: String(raw["id"]),
				title: String(raw["title"] ?? "Untitled"),
				company: String(raw["company"]?.display_name ?? "Unknown"),
				description,
				location: loc,
				country: country.toUpperCase(),
				region: classifyRegion(loc, remote_type),
				remote_type,
				salary_min: raw["salary_min"] ? Number(raw["salary_min"]) : null,
				salary_max: raw["salary_max"] ? Number(raw["salary_max"]) : null,
				salary_currency: adzunaCurrency(country),
				skills: extractSkills(`${raw["title"]} ${description}`),
				visa_sponsorship: classifyVisaByRules(description),
				apply_url: String(raw["redirect_url"] ?? ""),
				posted_date: raw["created"] ? String(raw["created"]) : null
			};
		});
	}
};
/**
* Jooble — requires JOOBLE_API_KEY.
*/
var joobleConnector = {
	id: "jooble",
	label: "Jooble (aggregator)",
	isConfigured: () => Boolean(process.env["JOOBLE_API_KEY"]),
	async fetch({ keyword, location, limit }) {
		const key = process.env["JOOBLE_API_KEY"];
		if (!key) return [];
		const res = await fetch(`https://jooble.org/api/${key}`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				keywords: keyword,
				location,
				page: "1"
			})
		});
		if (!res.ok) throw new Error(`Jooble ${res.status}`);
		return ((await res.json()).jobs ?? []).slice(0, limit).map((raw) => {
			const description = stripHtml(String(raw["snippet"] ?? ""));
			const loc = String(raw["location"] ?? "");
			const remote_type = detectRemote(`${raw["title"]} ${loc} ${description}`);
			return {
				source: "jooble",
				source_job_id: String(raw["id"] ?? raw["link"]),
				title: String(raw["title"] ?? "Untitled"),
				company: String(raw["company"] ?? "Unknown"),
				description,
				location: loc,
				country: null,
				region: classifyRegion(loc, remote_type),
				remote_type,
				salary_min: null,
				salary_max: null,
				salary_currency: null,
				skills: extractSkills(`${raw["title"]} ${description}`),
				visa_sponsorship: classifyVisaByRules(description),
				apply_url: String(raw["link"] ?? ""),
				posted_date: raw["updated"] ? String(raw["updated"]) : null
			};
		});
	}
};
/**
* USAJobs — US federal roles. Requires USAJOBS_API_KEY + USAJOBS_USER_AGENT (email).
*/
var usaJobsConnector = {
	id: "usajobs",
	label: "USAJobs (US federal)",
	isConfigured: () => Boolean(process.env["USAJOBS_API_KEY"] && process.env["USAJOBS_USER_AGENT"]),
	async fetch({ keyword, limit }) {
		const key = process.env["USAJOBS_API_KEY"];
		const agent = process.env["USAJOBS_USER_AGENT"];
		if (!key || !agent) return [];
		const params = new URLSearchParams({
			Keyword: keyword,
			ResultsPerPage: String(Math.min(limit, 50))
		});
		const res = await fetch(`https://data.usajobs.gov/api/search?${params}`, { headers: {
			"Authorization-Key": key,
			"User-Agent": agent,
			Host: "data.usajobs.gov"
		} });
		if (!res.ok) throw new Error(`USAJobs ${res.status}`);
		return ((await res.json()).SearchResult?.SearchResultItems ?? []).map((item) => {
			const d = item.MatchedObjectDescriptor;
			const description = stripHtml(String(d["UserArea"]?.Details?.JobSummary ?? "") || String(d["QualificationSummary"] ?? ""));
			const loc = (d["PositionLocation"] ?? [])[0]?.LocationName ?? "United States";
			const pay = d["PositionRemuneration"] ?? [];
			const remote_type = detectRemote(`${d["PositionTitle"]} ${loc} ${description}`);
			return {
				source: "usajobs",
				source_job_id: item.MatchedObjectId,
				title: String(d["PositionTitle"] ?? "Untitled"),
				company: String(d["OrganizationName"] ?? "US Government"),
				description,
				location: loc,
				country: "US",
				region: classifyRegion(loc, remote_type),
				remote_type,
				salary_min: pay[0]?.MinimumRange ? Number(pay[0].MinimumRange) : null,
				salary_max: pay[0]?.MaximumRange ? Number(pay[0].MaximumRange) : null,
				salary_currency: "USD",
				skills: extractSkills(`${d["PositionTitle"]} ${description}`),
				visa_sponsorship: "no",
				apply_url: String(d["PositionURI"] ?? ""),
				posted_date: d["PublicationStartDate"] ? String(d["PublicationStartDate"]) : null
			};
		});
	}
};
function isCountryOnly(location) {
	return [
		"india",
		"united states",
		"united kingdom",
		"canada",
		"australia",
		"germany"
	].includes(location.toLowerCase());
}
function adzunaCountry(location) {
	const l = (location || "").toLowerCase();
	if (l.includes("india") || [
		"bengaluru",
		"hyderabad",
		"pune",
		"chennai",
		"delhi"
	].some((c) => l.includes(c))) return "in";
	if (l.includes("united kingdom") || l.includes("london")) return "gb";
	if (l.includes("canada") || l.includes("toronto")) return "ca";
	if (l.includes("australia") || l.includes("sydney")) return "au";
	if (l.includes("germany") || l.includes("berlin")) return "de";
	if (l.includes("singapore")) return "sg";
	return "us";
}
function adzunaCurrency(country) {
	return {
		in: "INR",
		gb: "GBP",
		ca: "CAD",
		au: "AUD",
		de: "EUR",
		sg: "SGD",
		us: "USD"
	}[country] ?? "USD";
}
var ALL_CONNECTORS = [
	remotiveConnector,
	arbeitnowConnector,
	adzunaConnector,
	joobleConnector,
	usaJobsConnector
];
//#endregion
export { ALL_CONNECTORS, dedupeKey as t };
