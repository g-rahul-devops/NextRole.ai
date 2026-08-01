import { a as useServerFn, r as listResumes, t as useActiveResume } from "./use-active-resume-CM_oKsN9.js";
import { t as Route } from "./jobs._jobId-BkA22uDl.js";
import { c as toggleSaveJob, i as getJob, t as Skeleton, u as upsertApplication } from "./skeleton-CdrIB4qs.js";
import { t as Badge } from "./badge-DZvycHSJ.js";
import { t as generateCoverLetter } from "./match.functions-Cucwqmn8.js";
import { t as Button } from "./button-79MBYDnH.js";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
//#region src/routes/_authenticated/jobs.$jobId.tsx?tsr-split=component
var STATUSES = [
	"applied",
	"interview",
	"rejected",
	"offer"
];
function JobDetail() {
	const { jobId } = Route.useParams();
	const qc = useQueryClient();
	const save = useServerFn(toggleSaveJob);
	const setStatus = useServerFn(upsertApplication);
	const writeLetter = useServerFn(generateCoverLetter);
	const [letter, setLetter] = useState(null);
	const [busy, setBusy] = useState(false);
	const resumes = useQuery({
		queryKey: ["resumes"],
		queryFn: () => listResumes()
	});
	const { resumeId } = useActiveResume(resumes.data);
	const detail = useQuery({
		queryKey: [
			"job",
			jobId,
			resumeId
		],
		queryFn: () => getJob({ data: {
			id: jobId,
			resumeId
		} })
	});
	if (detail.isLoading) return /* @__PURE__ */ jsx(Skeleton, { className: "h-96 w-full" });
	if (!detail.data) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-muted-foreground",
		children: "Job not found."
	});
	const { job, match, saved, application } = detail.data;
	const breakdown = match?.breakdown ?? {};
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsx(Link, {
			to: "/jobs",
			className: "mono-label hover:text-foreground",
			children: "← back to jobs"
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid gap-6 lg:grid-cols-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "space-y-6 lg:col-span-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-border bg-card p-6",
					children: [
						/* @__PURE__ */ jsx("h1", {
							className: "text-2xl font-semibold",
							children: job.title
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-muted-foreground",
							children: [
								job.company,
								" · ",
								job.location ?? "—"
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-4 flex flex-wrap gap-1.5",
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
								})
							]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-6 flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ jsx(Button, {
									asChild: true,
									children: /* @__PURE__ */ jsx("a", {
										href: job.apply_url,
										target: "_blank",
										rel: "noreferrer noopener",
										children: "Apply"
									})
								}),
								/* @__PURE__ */ jsx(Button, {
									variant: saved ? "secondary" : "outline",
									onClick: async () => {
										await save({ data: { jobId } });
										qc.invalidateQueries({ queryKey: ["job", jobId] });
									},
									children: saved ? "Saved" : "Save"
								}),
								STATUSES.map((s) => /* @__PURE__ */ jsx(Button, {
									size: "sm",
									variant: application?.status === s ? "default" : "ghost",
									onClick: async () => {
										await setStatus({ data: {
											jobId,
											status: s
										} });
										qc.invalidateQueries();
										toast.success(`Marked ${s}`);
									},
									children: s
								}, s))
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-border bg-card p-6",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-base font-semibold",
						children: "Description"
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground",
						children: (job.description ?? "").slice(0, 8e3)
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-border bg-card p-6",
					children: [/* @__PURE__ */ jsx("h2", {
						className: "text-base font-semibold",
						children: "Match"
					}), match ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 font-mono text-4xl font-bold text-primary",
							children: Math.round(Number(match.score))
						}),
						/* @__PURE__ */ jsx("div", {
							className: "mt-4 space-y-2",
							children: Object.entries(breakdown).map(([k, v]) => /* @__PURE__ */ jsxs("div", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-muted-foreground",
									children: k
								}), /* @__PURE__ */ jsx("span", {
									className: "font-mono",
									children: Math.round(Number(v))
								})]
							}, k))
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: match.explanation
						})
					] }) : /* @__PURE__ */ jsx("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Not scored yet — run matching from the dashboard."
					})]
				}), /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-border bg-card p-6",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-base font-semibold",
							children: "Cover letter"
						}),
						/* @__PURE__ */ jsx(Button, {
							className: "mt-3 w-full",
							disabled: !resumeId || busy,
							onClick: async () => {
								setBusy(true);
								try {
									const r = await writeLetter({ data: {
										jobId,
										resumeId
									} });
									setLetter(r.content);
								} catch (e) {
									toast.error(e.message);
								} finally {
									setBusy(false);
								}
							},
							children: busy ? "Writing…" : "Generate"
						}),
						(letter ?? detail.data.coverLetter) && /* @__PURE__ */ jsx("p", {
							className: "mt-4 whitespace-pre-wrap text-sm text-muted-foreground",
							children: letter ?? detail.data.coverLetter
						})
					]
				})]
			})]
		})]
	});
}
//#endregion
export { JobDetail as component };
