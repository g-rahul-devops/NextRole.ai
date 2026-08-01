import { a as listApplications, t as Skeleton } from "./skeleton-CdrIB4qs.js";
import { t as Badge } from "./badge-DZvycHSJ.js";
import { Link } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_authenticated/applications.tsx?tsr-split=component
var COLUMNS = [
	"applied",
	"interview",
	"rejected",
	"offer"
];
function ApplicationsPage() {
	const apps = useQuery({
		queryKey: ["applications"],
		queryFn: () => listApplications()
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
			className: "mono-label",
			children: "pipeline"
		}), /* @__PURE__ */ jsx("h1", {
			className: "mt-1 text-2xl font-semibold",
			children: "Application tracker"
		})] }), apps.isLoading ? /* @__PURE__ */ jsx(Skeleton, { className: "h-64 w-full" }) : /* @__PURE__ */ jsx("div", {
			className: "grid gap-4 md:grid-cols-4",
			children: COLUMNS.map((col) => {
				const items = (apps.data ?? []).filter((a) => a.status === col);
				return /* @__PURE__ */ jsxs("div", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ jsx("p", {
							className: "mono-label",
							children: col
						}), /* @__PURE__ */ jsx(Badge, {
							variant: "secondary",
							children: items.length
						})]
					}), /* @__PURE__ */ jsx("div", {
						className: "mt-3 space-y-2",
						children: items.map((a) => {
							const job = a.jobs;
							if (!job) return null;
							return /* @__PURE__ */ jsxs(Link, {
								to: "/jobs/$jobId",
								params: { jobId: job.id },
								className: "block rounded-lg bg-secondary/50 p-3 text-sm hover:bg-secondary",
								children: [/* @__PURE__ */ jsx("span", {
									className: "font-medium",
									children: job.title
								}), /* @__PURE__ */ jsx("span", {
									className: "block text-xs text-muted-foreground",
									children: job.company
								})]
							}, a.id);
						})
					})]
				}, col);
			})
		})]
	});
}
//#endregion
export { ApplicationsPage as component };
