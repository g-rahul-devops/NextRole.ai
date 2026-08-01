export type VisaStatus = "yes" | "no" | "unclear";
export type RemoteKind = "remote" | "hybrid" | "onsite" | "unknown";

export interface NormalizedJob {
  source: string;
  source_job_id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  country: string | null;
  region: "remote" | "india" | "other";
  remote_type: RemoteKind;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  skills: string[];
  visa_sponsorship: VisaStatus;
  apply_url: string;
  posted_date: string | null;
}

export interface ConnectorQuery {
  keyword: string;
  location: string; // free-form, "" for anywhere
  limit: number;
}

export interface JobConnector {
  id: string;
  label: string;
  /** true when the connector can run without a user-provided API key */
  isConfigured: () => boolean;
  fetch: (query: ConnectorQuery) => Promise<NormalizedJob[]>;
}

export const SKILL_VOCAB = [
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
  "vault",
];

export function extractSkills(text: string): string[] {
  const lower = (text || "").toLowerCase();
  return SKILL_VOCAB.filter((s) => lower.includes(s));
}

export function stripHtml(html: string): string {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const INDIA_HINTS = [
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
  "kolkata",
];

export function classifyRegion(location: string, remote: RemoteKind): "remote" | "india" | "other" {
  const l = (location || "").toLowerCase();
  if (INDIA_HINTS.some((h) => l.includes(h))) return "india";
  if (remote === "remote") return "remote";
  return "other";
}

export function detectRemote(text: string): RemoteKind {
  const l = (text || "").toLowerCase();
  if (l.includes("hybrid")) return "hybrid";
  if (l.includes("remote") || l.includes("work from home") || l.includes("anywhere")) return "remote";
  if (l.includes("on-site") || l.includes("onsite") || l.includes("in office")) return "onsite";
  return "unknown";
}

const SPONSOR_YES = [
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
  "work permit sponsorship",
];

const SPONSOR_NO = [
  "no visa sponsorship",
  "we do not sponsor",
  "we are unable to sponsor",
  "unable to provide sponsorship",
  "sponsorship is not available",
  "not able to sponsor",
  "must have valid work authorization",
  "must be authorized to work",
  "without sponsorship",
  "no sponsorship",
];

/**
 * Rule-based visa classification. NEVER assumes sponsorship — returns "unclear"
 * unless the description states it explicitly.
 */
export function classifyVisaByRules(text: string): VisaStatus {
  const l = (text || "").toLowerCase();
  if (SPONSOR_NO.some((p) => l.includes(p))) return "no";
  if (SPONSOR_YES.some((p) => l.includes(p))) return "yes";
  return "unclear";
}

export function dedupeKey(job: NormalizedJob): string {
  const norm = (s: string) =>
    (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .slice(0, 8)
      .join(" ");
  return `${norm(job.company)}|${norm(job.title)}|${norm(job.location).slice(0, 24)}`;
}
