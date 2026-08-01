import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Terminal, Radar, Gauge, ShieldCheck, FileText, KanbanSquare } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PipelineMatch — AI DevOps & SRE Job Matching Agent" },
      {
        name: "description",
        content:
          "An AI agent that pulls DevOps, SRE and cloud roles from job portals, flags visa sponsorship, and ranks every posting against your resume.",
      },
      { property: "og:title", content: "PipelineMatch — AI DevOps Job Matching Agent" },
      {
        property: "og:description",
        content: "Fetch, dedupe and score Azure/GCP DevOps roles against your resume with semantic matching.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Radar,
    title: "Multi-portal fetch agent",
    body: "Connectors for Remotive, Arbeitnow, Adzuna, Jooble and USAJobs behind one interface. Deduped on company + title + location. No ToS-violating scrapers.",
  },
  {
    icon: ShieldCheck,
    title: "Honest visa signals",
    body: "Sponsorship is derived from explicit language only. Anything ambiguous is marked unclear — never assumed available.",
  },
  {
    icon: Gauge,
    title: "Weighted match scoring",
    body: "Skills 45%, experience 20%, certifications 10%, location 10%, industry fit 15% — backed by vector similarity and a written explanation.",
  },
  {
    icon: FileText,
    title: "Cover letters, cached",
    body: "Generated per job + resume pair, hashed and cached, with a daily generation cap so repeat runs cost nothing.",
  },
  {
    icon: KanbanSquare,
    title: "Application tracker",
    body: "Applied, Interview, Rejected, Offer — with funnel analytics across everything you've matched.",
  },
];

function Landing() {
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-brand-icon">
            <Terminal size={18} />
          </div>
          <span>PipelineMatch</span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <main className="landing-hero">
        <div className="hero-badge">devops · sre · platform · cloud</div>
        <h1>
          Find your next <span>DevOps role</span> with AI precision
        </h1>
        <p>
          Pull Azure, GCP, Kubernetes and SRE postings from multiple job portals, score each role against your resume,
          and keep every application in one place.
        </p>
        <div className="hero-actions">
          <Button asChild size="lg" className="glow-ring">
            <Link to="/auth">Start matching</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">Upload a resume</Link>
          </Button>
        </div>
      </main>

      <section className="landing-grid">
        {FEATURES.map((f) => (
          <article key={f.title} className="landing-card">
            <f.icon size={20} />
            <h2>{f.title}</h2>
            <p>{f.body}</p>
          </article>
        ))}
      </section>

      <footer className="landing-footer">Job data comes from documented, ToS-compliant APIs only.</footer>
    </div>
  );
}
