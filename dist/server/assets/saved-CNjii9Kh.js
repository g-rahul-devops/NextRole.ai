import { s as listSavedJobs, t as Skeleton } from "./skeleton-CdrIB4qs.js";
import { t as Badge } from "./badge-DZvycHSJ.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_authenticated/saved.tsx?tsr-split=component
function SavedPage() {
	const saved = useQuery({
		queryKey: ["saved"],
		queryFn: () => listSavedJobs()
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
			className: "mono-label",
			children: "shortlist"
		}), /* @__PURE__ */ jsx("h1", {
			className: "mt-1 text-2xl font-semibold",
			children: "Saved jobs"
		})] }), saved.isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-40 w-full" }) : saved.data?.length ? /* @__PURE__ */ jsx("div", {
			className: "space-y-3",
			children: saved.data.map((row) => {
				const job = row.jobs;
				if (!job) return null;
				return /* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between rounded-xl border border-border bg-card p-5",
					children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Link, {
						to: "/jobs/$jobId",
						params: { jobId: job.id },
						className: "font-semibold hover:text-primary",
						children: job.title
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-sm text-muted-foreground",
						children: [
							job.company,
							" · ",
							job.location ?? "—"
						]
					})] }), /* @__PURE__ */ jsxs(Badge, {
						variant: "outline",
						className: "font-mono text-[11px]",
						children: ["visa: ", job.visa_sponsorship]
					})]
				}, row.id);
			})
		}) : /* @__PURE__ */ jsx("p", {
			className: "rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground",
			children: "Nothing saved yet."
		})]
	});
}
//#endregion
export { SavedPage as component };
