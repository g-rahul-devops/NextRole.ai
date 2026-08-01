import { a as useServerFn, i as uploadResume, n as deleteResume, r as listResumes, t as useActiveResume } from "./use-active-resume-CM_oKsN9.js";
import { l as triggerJobFetch, n as getAnalytics, r as getConnectorStatus, t as Skeleton } from "./skeleton-CdrIB4qs.js";
import { t as Progress } from "./progress-QgqYNxi0.js";
import { t as Badge } from "./badge-DZvycHSJ.js";
import { n as runMatching } from "./match.functions-Cucwqmn8.js";
import { t as Button } from "./button-79MBYDnH.js";
import { useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, CircleDashed, RefreshCw, Sparkles, Trash2, Upload } from "lucide-react";
//#region src/routes/_authenticated/dashboard.tsx?tsr-split=component
function Dashboard() {
	const qc = useQueryClient();
	const fileRef = useRef(null);
	const [uploading, setUploading] = useState(false);
	const upload = useServerFn(uploadResume);
	const remove = useServerFn(deleteResume);
	const fetchJobs = useServerFn(triggerJobFetch);
	const match = useServerFn(runMatching);
	const resumes = useQuery({
		queryKey: ["resumes"],
		queryFn: () => listResumes()
	});
	const connectors = useQuery({
		queryKey: ["connectors"],
		queryFn: () => getConnectorStatus()
	});
	const stats = useQuery({
		queryKey: ["analytics"],
		queryFn: () => getAnalytics()
	});
	const { resumeId, select } = useActiveResume(resumes.data);
	const fetchMutation = useMutation({
		mutationFn: () => fetchJobs({ data: {} }),
		onSuccess: (r) => {
			toast.success(`Fetched ${r.fetched} postings · ${r.inserted} new · ${r.duplicates} duplicates`);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	const matchMutation = useMutation({
		mutationFn: () => match({ data: {
			resumeId,
			topK: 80
		} }),
		onSuccess: (r) => {
			toast.success(`Scored ${r.matched} jobs against your resume`);
			qc.invalidateQueries();
		},
		onError: (e) => toast.error(e.message)
	});
	async function onFile(file) {
		setUploading(true);
		try {
			const buffer = new Uint8Array(await file.arrayBuffer());
			let binary = "";
			for (let i = 0; i < buffer.length; i += 8192) binary += String.fromCharCode(...buffer.subarray(i, i + 8192));
			await upload({ data: {
				fileName: file.name,
				mimeType: file.type || "application/octet-stream",
				base64: btoa(binary)
			} });
			toast.success("Resume parsed");
			qc.invalidateQueries({ queryKey: ["resumes"] });
		} catch (e) {
			toast.error(e.message);
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = "";
		}
	}
	const parsed = (resumes.data?.find((r) => r.id === resumeId))?.parsed;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-8",
		children: [
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
				className: "mono-label",
				children: "control plane"
			}), /* @__PURE__ */ jsx("h1", {
				className: "mt-1 text-2xl font-semibold",
				children: "Dashboard"
			})] }),
			/* @__PURE__ */ jsx("section", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					{
						label: "Jobs indexed",
						value: stats.data?.totalJobs ?? 0
					},
					{
						label: "Scored",
						value: stats.data?.scoredJobs ?? 0
					},
					{
						label: "Strong matches (70+)",
						value: stats.data?.strongMatches ?? 0
					},
					{
						label: "Avg match score",
						value: stats.data?.averageScore ?? 0
					}
				].map((s) => /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-border bg-card p-5",
					children: [/* @__PURE__ */ jsx("p", {
						className: "mono-label",
						children: s.label
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-2 font-mono text-3xl font-bold text-primary",
						children: s.value
					})]
				}, s.label))
			}),
			/* @__PURE__ */ jsxs("section", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "space-y-4 rounded-xl border border-border bg-card p-6 lg:col-span-2",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between",
							children: [
								/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
									className: "text-base font-semibold",
									children: "Resume"
								}), /* @__PURE__ */ jsx("p", {
									className: "text-sm text-muted-foreground",
									children: "PDF, DOCX-exported text or plain text."
								})] }),
								/* @__PURE__ */ jsx("input", {
									ref: fileRef,
									type: "file",
									accept: ".pdf,.txt,.md",
									className: "hidden",
									onChange: (e) => {
										const f = e.target.files?.[0];
										if (f) onFile(f);
									}
								}),
								/* @__PURE__ */ jsxs(Button, {
									onClick: () => fileRef.current?.click(),
									disabled: uploading,
									children: [/* @__PURE__ */ jsx(Upload, { className: "size-4" }), uploading ? "Parsing…" : "Upload"]
								})
							]
						}),
						resumes.isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-24 w-full" }) : resumes.data?.length ? /* @__PURE__ */ jsx("div", {
							className: "space-y-2",
							children: resumes.data.map((r) => /* @__PURE__ */ jsxs("div", {
								className: `flex items-center gap-3 rounded-lg border p-3 ${r.id === resumeId ? "border-primary/60 bg-secondary/40" : "border-border"}`,
								children: [
									/* @__PURE__ */ jsxs("button", {
										className: "flex-1 text-left",
										onClick: () => select(r.id),
										children: [/* @__PURE__ */ jsx("p", {
											className: "text-sm font-medium",
											children: r.file_name
										}), /* @__PURE__ */ jsxs("p", {
											className: "text-xs text-muted-foreground",
											children: [
												new Date(r.created_at).toLocaleDateString(),
												" ·",
												" ",
												r.parsed?.skills?.length ?? 0,
												" skills detected"
											]
										})]
									}),
									r.id === resumeId && /* @__PURE__ */ jsx(Badge, { children: "Active" }),
									/* @__PURE__ */ jsx(Button, {
										variant: "ghost",
										size: "icon",
										onClick: async () => {
											await remove({ data: { id: r.id } });
											qc.invalidateQueries({ queryKey: ["resumes"] });
										},
										children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
									})
								]
							}, r.id))
						}) : /* @__PURE__ */ jsx("p", {
							className: "rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
							children: "No resume yet. Upload one to unlock matching."
						}),
						parsed && /* @__PURE__ */ jsxs("div", {
							className: "space-y-3 rounded-lg bg-secondary/40 p-4",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-sm text-muted-foreground",
									children: parsed.summary
								}),
								/* @__PURE__ */ jsx("div", {
									className: "flex flex-wrap gap-1.5",
									children: parsed.skills?.slice(0, 24).map((s) => /* @__PURE__ */ jsx(Badge, {
										variant: "secondary",
										className: "font-mono text-[11px]",
										children: s
									}, s))
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "mono-label",
									children: [
										parsed.yearsExperience,
										" yrs experience · ",
										parsed.certifications?.length ?? 0,
										" certifications"
									]
								})
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "space-y-6",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "space-y-3 rounded-xl border border-border bg-card p-6",
						children: [
							/* @__PURE__ */ jsx("h2", {
								className: "text-base font-semibold",
								children: "Agent actions"
							}),
							/* @__PURE__ */ jsxs(Button, {
								className: "w-full",
								variant: "outline",
								onClick: () => fetchMutation.mutate(),
								disabled: fetchMutation.isPending,
								children: [/* @__PURE__ */ jsx(RefreshCw, { className: `size-4 ${fetchMutation.isPending ? "animate-spin" : ""}` }), fetchMutation.isPending ? "Fetching…" : "Run fetch agent"]
							}),
							/* @__PURE__ */ jsxs(Button, {
								className: "w-full",
								onClick: () => matchMutation.mutate(),
								disabled: !resumeId || matchMutation.isPending,
								children: [/* @__PURE__ */ jsx(Sparkles, { className: "size-4" }), matchMutation.isPending ? "Scoring…" : "Score jobs vs resume"]
							}),
							matchMutation.isPending && /* @__PURE__ */ jsx(Progress, { value: 65 })
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "space-y-3 rounded-xl border border-border bg-card p-6",
						children: [/* @__PURE__ */ jsx("h2", {
							className: "text-base font-semibold",
							children: "Source connectors"
						}), connectors.data?.map((c) => /* @__PURE__ */ jsxs("div", {
							className: "flex items-center justify-between text-sm",
							children: [/* @__PURE__ */ jsx("span", { children: c.label }), c.configured ? /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1.5 text-success",
								children: [/* @__PURE__ */ jsx(CheckCircle2, { className: "size-4" }), " ready"]
							}) : /* @__PURE__ */ jsxs("span", {
								className: "flex items-center gap-1.5 text-muted-foreground",
								children: [/* @__PURE__ */ jsx(CircleDashed, { className: "size-4" }), " needs key"]
							})]
						}, c.id))]
					})]
				})]
			})
		]
	});
}
//#endregion
export { Dashboard as component };
