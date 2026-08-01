import {
  classifyRegion,
  classifyVisaByRules,
  detectRemote,
  extractSkills,
  stripHtml,
  type ConnectorQuery,
  type JobConnector,
  type NormalizedJob,
} from "./types";

/**
 * Remotive — public remote-jobs API, no key required.
 * https://remotive.com/api/remote-jobs
 */
export const remotiveConnector: JobConnector = {
  id: "remotive",
  label: "Remotive (remote jobs)",
  isConfigured: () => true,
  async fetch({ keyword, limit }: ConnectorQuery): Promise<NormalizedJob[]> {
    const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(keyword)}&limit=${limit}`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`Remotive ${res.status}`);
    const body = (await res.json()) as { jobs?: Array<Record<string, unknown>> };
    return (body.jobs ?? []).slice(0, limit).map((raw) => {
      const description = stripHtml(String(raw["description"] ?? ""));
      const location = String(raw["candidate_required_location"] ?? "Remote");
      const remote_type = "remote" as const;
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
        posted_date: raw["publication_date"] ? String(raw["publication_date"]) : null,
      } satisfies NormalizedJob;
    });
  },
};

/**
 * Arbeitnow — public job board API, no key required. Good EU coverage.
 */
export const arbeitnowConnector: JobConnector = {
  id: "arbeitnow",
  label: "Arbeitnow (EU / remote)",
  isConfigured: () => true,
  async fetch({ keyword, limit }: ConnectorQuery): Promise<NormalizedJob[]> {
    const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Arbeitnow ${res.status}`);
    const body = (await res.json()) as { data?: Array<Record<string, unknown>> };
    const kw = keyword.toLowerCase().split(" ")[0] ?? "";
    return (body.data ?? [])
      .filter((raw) => String(raw["title"] ?? "").toLowerCase().includes(kw))
      .slice(0, limit)
      .map((raw) => {
        const description = stripHtml(String(raw["description"] ?? ""));
        const location = String(raw["location"] ?? "");
        const remote_type = raw["remote"] === true ? ("remote" as const) : detectRemote(location);
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
          posted_date: created ? new Date(created * 1000).toISOString() : null,
        } satisfies NormalizedJob;
      });
  },
};

/**
 * Adzuna — requires ADZUNA_APP_ID + ADZUNA_APP_KEY (free tier).
 */
export const adzunaConnector: JobConnector = {
  id: "adzuna",
  label: "Adzuna (global + India)",
  isConfigured: () => Boolean(process.env["ADZUNA_APP_ID"] && process.env["ADZUNA_APP_KEY"]),
  async fetch({ keyword, location, limit }: ConnectorQuery): Promise<NormalizedJob[]> {
    const appId = process.env["ADZUNA_APP_ID"];
    const appKey = process.env["ADZUNA_APP_KEY"];
    if (!appId || !appKey) return [];
    const country = adzunaCountry(location);
    const params = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      what: keyword,
      results_per_page: String(Math.min(limit, 50)),
      content_type: "application/json",
    });
    if (location && !isCountryOnly(location)) params.set("where", location);
    const res = await fetch(`https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`);
    if (!res.ok) throw new Error(`Adzuna ${res.status}`);
    const body = (await res.json()) as { results?: Array<Record<string, unknown>> };
    return (body.results ?? []).map((raw) => {
      const description = stripHtml(String(raw["description"] ?? ""));
      const loc = String((raw["location"] as { display_name?: string } | undefined)?.display_name ?? "");
      const remote_type = detectRemote(`${raw["title"]} ${loc} ${description}`);
      return {
        source: "adzuna",
        source_job_id: String(raw["id"]),
        title: String(raw["title"] ?? "Untitled"),
        company: String((raw["company"] as { display_name?: string } | undefined)?.display_name ?? "Unknown"),
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
        posted_date: raw["created"] ? String(raw["created"]) : null,
      } satisfies NormalizedJob;
    });
  },
};

/**
 * Jooble — requires JOOBLE_API_KEY.
 */
export const joobleConnector: JobConnector = {
  id: "jooble",
  label: "Jooble (aggregator)",
  isConfigured: () => Boolean(process.env["JOOBLE_API_KEY"]),
  async fetch({ keyword, location, limit }: ConnectorQuery): Promise<NormalizedJob[]> {
    const key = process.env["JOOBLE_API_KEY"];
    if (!key) return [];
    const res = await fetch(`https://jooble.org/api/${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keywords: keyword, location, page: "1" }),
    });
    if (!res.ok) throw new Error(`Jooble ${res.status}`);
    const body = (await res.json()) as { jobs?: Array<Record<string, unknown>> };
    return (body.jobs ?? []).slice(0, limit).map((raw) => {
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
        posted_date: raw["updated"] ? String(raw["updated"]) : null,
      } satisfies NormalizedJob;
    });
  },
};

/**
 * USAJobs — US federal roles. Requires USAJOBS_API_KEY + USAJOBS_USER_AGENT (email).
 */
export const usaJobsConnector: JobConnector = {
  id: "usajobs",
  label: "USAJobs (US federal)",
  isConfigured: () => Boolean(process.env["USAJOBS_API_KEY"] && process.env["USAJOBS_USER_AGENT"]),
  async fetch({ keyword, limit }: ConnectorQuery): Promise<NormalizedJob[]> {
    const key = process.env["USAJOBS_API_KEY"];
    const agent = process.env["USAJOBS_USER_AGENT"];
    if (!key || !agent) return [];
    const params = new URLSearchParams({
      Keyword: keyword,
      ResultsPerPage: String(Math.min(limit, 50)),
    });
    const res = await fetch(`https://data.usajobs.gov/api/search?${params}`, {
      headers: { "Authorization-Key": key, "User-Agent": agent, Host: "data.usajobs.gov" },
    });
    if (!res.ok) throw new Error(`USAJobs ${res.status}`);
    const body = (await res.json()) as {
      SearchResult?: { SearchResultItems?: Array<{ MatchedObjectId: string; MatchedObjectDescriptor: Record<string, unknown> }> };
    };
    return (body.SearchResult?.SearchResultItems ?? []).map((item) => {
      const d = item.MatchedObjectDescriptor;
      const summary = String((d["UserArea"] as { Details?: { JobSummary?: string } } | undefined)?.Details?.JobSummary ?? "");
      const description = stripHtml(summary || String(d["QualificationSummary"] ?? ""));
      const locations = (d["PositionLocation"] as Array<{ LocationName?: string }> | undefined) ?? [];
      const loc = locations[0]?.LocationName ?? "United States";
      const pay = (d["PositionRemuneration"] as Array<{ MinimumRange?: string; MaximumRange?: string }> | undefined) ?? [];
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
        // US federal roles require citizenship in nearly all cases.
        skills: extractSkills(`${d["PositionTitle"]} ${description}`),
        visa_sponsorship: "no",
        apply_url: String(d["PositionURI"] ?? ""),
        posted_date: d["PublicationStartDate"] ? String(d["PublicationStartDate"]) : null,
      } satisfies NormalizedJob;
    });
  },
};

function isCountryOnly(location: string) {
  return ["india", "united states", "united kingdom", "canada", "australia", "germany"].includes(
    location.toLowerCase(),
  );
}

function adzunaCountry(location: string) {
  const l = (location || "").toLowerCase();
  if (l.includes("india") || ["bengaluru", "hyderabad", "pune", "chennai", "delhi"].some((c) => l.includes(c)))
    return "in";
  if (l.includes("united kingdom") || l.includes("london")) return "gb";
  if (l.includes("canada") || l.includes("toronto")) return "ca";
  if (l.includes("australia") || l.includes("sydney")) return "au";
  if (l.includes("germany") || l.includes("berlin")) return "de";
  if (l.includes("singapore")) return "sg";
  return "us";
}

function adzunaCurrency(country: string) {
  return { in: "INR", gb: "GBP", ca: "CAD", au: "AUD", de: "EUR", sg: "SGD", us: "USD" }[country] ?? "USD";
}

export const ALL_CONNECTORS: JobConnector[] = [
  remotiveConnector,
  arbeitnowConnector,
  adzunaConnector,
  joobleConnector,
  usaJobsConnector,
];
