import { a as useServerFn, r as listResumes, t as useActiveResume } from "./use-active-resume-CM_oKsN9.js";
import { c as toggleSaveJob, o as listJobs, t as Skeleton } from "./skeleton-CdrIB4qs.js";
import { t as Badge } from "./badge-DZvycHSJ.js";
import { t as Button } from "./button-79MBYDnH.js";
import { t as Input } from "./input-DBivzZwy.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, MapPin } from "lucide-react";
//#region src/routes/_authenticated/jobs.index.tsx?tsr-split=component
var REGIONS = [
	"all",
	"remote",
	"india",
	"other"
];
var VISAS = [
	"all",
	"yes",
	"no",
	"unclear"
];
function JobsPage() {
	const qc = useQueryClient();
	const save = useServerFn(toggleSaveJob);
	const [q, setQ] = useState("");
	const [region, setRegion] = useState("all");
	const [visa, setVisa] = useState("all");
	const resumes = useQuery({
		queryKey: ["resumes"],
		queryFn: () => listResumes()
	});
	const { resumeId } = useActiveResume(resumes.data);
	const jobs = useQuery({
		queryKey: [
			"jobs",
			q,
			region,
			visa,
			resumeId
		],
		queryFn: () => listJobs({ data: {
			q: q || void 0,
			region,
			visa,
			resumeId,
			limit: 60
		} })
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "mono-label",
				children: "index"
			}), /* @__PURE__ */ jsx("h1", {
				className: "mt-1 text-2xl font-semibold",
				children: "Jobs"
			})] }),
			/* @__PURE__ */ jsxs("div", {
				className: "flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ jsx(Input, {
						className: "w-full sm:max-w-xs",
						placeholder: "Search title or company…",
						value: q,
						onChange: (e) => setQ(e.target.value)
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex gap-1",
						children: REGIONS.map((r) => /* @__PURE__ */ jsx(Button, {
							size: "sm",
							variant: region === r ? "default" : "ghost",
							onClick: () => setRegion(r),
							children: r
						}, r))
					}),
					/* @__PURE__ */ jsx("div", {
						className: "flex gap-1",
						children: VISAS.map((v) => /* @__PURE__ */ jsxs(Button, {
							size: "sm",
							variant: visa === v ? "secondary" : "ghost",
							onClick: () => setVisa(v),
							children: ["visa: ", v]
						}, v))
					})
				]
			}),
			jobs.isLoading ? /* @__PURE__ */ jsx("div", {
				className: "space-y-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-full" }, i))
			}) : jobs.data?.length ? /* @__PURE__ */ jsx("div", {
				className: "space-y-3",
				children: jobs.data.map((job) => /* @__PURE__ */ jsx("article", {
					className: "rounded-xl border border-border bg-card p-5",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-start gap-4",
						children: [/* @__PURE__ */ jsxs("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ jsx(Link, {
									to: "/jobs/$jobId",
									params: { jobId: job.id },
									className: "text-base font-semibold hover:text-primary",
									children: job.title
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-sm text-muted-foreground",
									children: [
										job.company,
										" · ",
										/* @__PURE__ */ jsx(MapPin, { className: "inline size-3" }),
										" ",
										job.location ?? "—"
									]
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-3 flex flex-wrap gap-1.5",
									children: [
										/* @__PURE__ */ jsx(Badge, {
											variant: "outline",
											className: "font-mono text-[11px]",
											children: job.remote_type
										}),
										/* @__PURE__ */ jsxs(Badge, {
											variant: "outline",
											className: "font-mono text-[11px]",
											children: ["visa: ", job.visa_sponsorship]
										}),
										/* @__PURE__ */ jsx(Badge, {
											variant: "outline",
											className: "font-mono text-[11px]",
											children: job.source
										}),
										(job.skills ?? []).slice(0, 5).map((s) => /* @__PURE__ */ jsx(Badge, {
											variant: "secondary",
											className: "font-mono text-[11px]",
											children: s
										}, s))
									]
								})
							]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex flex-col items-end gap-2",
							children: [job.score != null && /* @__PURE__ */ jsx("span", {
								className: "font-mono text-2xl font-bold text-primary",
								children: Math.round(job.score)
							}), /* @__PURE__ */ jsx(Button, {
								size: "icon",
								variant: job.saved ? "default" : "ghost",
								onClick: async () => {
									await save({ data: { jobId: job.id } });
									qc.invalidateQueries({ queryKey: ["jobs"] });
								},
								children: /* @__PURE__ */ jsx(Bookmark, { className: "size-4" })
							})]
						})]
					})
				}, job.id))
			}) : /* @__PURE__ */ jsx("p", {
				className: "rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground",
				children: "No jobs yet — run the fetch agent from the dashboard."
			})
		]
	});
}
//#endregion
export { JobsPage as component };
