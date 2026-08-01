import { t as Button } from "./button-79MBYDnH.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { FileText, Gauge, KanbanSquare, Radar, ShieldCheck, Terminal } from "lucide-react";
//#region src/routes/index.tsx?tsr-split=component
var FEATURES = [
	{
		icon: Radar,
		title: "Multi-portal fetch agent",
		body: "Connectors for Remotive, Arbeitnow, Adzuna, Jooble and USAJobs behind one interface. Deduped on company + title + location. No ToS-violating scrapers."
	},
	{
		icon: ShieldCheck,
		title: "Honest visa signals",
		body: "Sponsorship is derived from explicit language only. Anything ambiguous is marked unclear — never assumed available."
	},
	{
		icon: Gauge,
		title: "Weighted match scoring",
		body: "Skills 45%, experience 20%, certifications 10%, location 10%, industry fit 15% — backed by vector similarity and a written explanation."
	},
	{
		icon: FileText,
		title: "Cover letters, cached",
		body: "Generated per job + resume pair, hashed and cached, with a daily generation cap so repeat runs cost nothing."
	},
	{
		icon: KanbanSquare,
		title: "Application tracker",
		body: "Applied, Interview, Rejected, Offer — with funnel analytics across everything you've matched."
	}
];
function Landing() {
	return /* @__PURE__ */ jsxs("div", {
		className: "landing-shell",
		children: [
			/* @__PURE__ */ jsxs("header", {
				className: "landing-header",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "landing-brand",
					children: [/* @__PURE__ */ jsx("div", {
						className: "landing-brand-icon",
						children: /* @__PURE__ */ jsx(Terminal, { size: 18 })
					}), /* @__PURE__ */ jsx("span", { children: "PipelineMatch" })]
				}), /* @__PURE__ */ jsx(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ jsx(Link, {
						to: "/auth",
						children: "Sign in"
					})
				})]
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "landing-hero",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "hero-badge",
						children: "devops · sre · platform · cloud"
					}),
					/* @__PURE__ */ jsxs("h1", { children: [
						"Find your next ",
						/* @__PURE__ */ jsx("span", { children: "DevOps role" }),
						" with AI precision"
					] }),
					/* @__PURE__ */ jsx("p", { children: "Pull Azure, GCP, Kubernetes and SRE postings from multiple job portals, score each role against your resume, and keep every application in one place." }),
					/* @__PURE__ */ jsxs("div", {
						className: "hero-actions",
						children: [/* @__PURE__ */ jsx(Button, {
							asChild: true,
							size: "lg",
							className: "glow-ring",
							children: /* @__PURE__ */ jsx(Link, {
								to: "/auth",
								children: "Start matching"
							})
						}), /* @__PURE__ */ jsx(Button, {
							asChild: true,
							size: "lg",
							variant: "outline",
							children: /* @__PURE__ */ jsx(Link, {
								to: "/auth",
								children: "Upload a resume"
							})
						})]
					})
				]
			}),
			/* @__PURE__ */ jsx("section", {
				className: "landing-grid",
				children: FEATURES.map((f) => /* @__PURE__ */ jsxs("article", {
					className: "landing-card",
					children: [
						/* @__PURE__ */ jsx(f.icon, { size: 20 }),
						/* @__PURE__ */ jsx("h2", { children: f.title }),
						/* @__PURE__ */ jsx("p", { children: f.body })
					]
				}, f.title))
			}),
			/* @__PURE__ */ jsx("footer", {
				className: "landing-footer",
				children: "Job data comes from documented, ToS-compliant APIs only."
			})
		]
	});
}
//#endregion
export { Landing as component };
