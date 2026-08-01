import { n as getAnalytics, t as Skeleton } from "./skeleton-CdrIB4qs.js";
import { t as Progress } from "./progress-QgqYNxi0.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useQuery } from "@tanstack/react-query";
//#region src/routes/_authenticated/analytics.tsx?tsr-split=component
function AnalyticsPage() {
	const stats = useQuery({
		queryKey: ["analytics"],
		queryFn: () => getAnalytics()
	});
	const d = stats.data;
	const total = d ? Object.values(d.funnel).reduce((a, b) => a + b, 0) : 0;
	return /* @__PURE__ */ jsxs("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
			className: "mono-label",
			children: "telemetry"
		}), /* @__PURE__ */ jsx("h1", {
			className: "mt-1 text-2xl font-semibold",
			children: "Analytics"
		})] }), stats.isLoading || !d ? /* @__PURE__ */ jsx(Skeleton, { className: "h-64 w-full" }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				{
					label: "Jobs indexed",
					value: d.totalJobs
				},
				{
					label: "Scored jobs",
					value: d.scoredJobs
				},
				{
					label: "Saved",
					value: d.savedJobs
				},
				{
					label: "Avg score",
					value: d.averageScore
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
		}), /* @__PURE__ */ jsxs("div", {
			className: "rounded-xl border border-border bg-card p-6",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "text-base font-semibold",
				children: "Application funnel"
			}), /* @__PURE__ */ jsx("div", {
				className: "mt-4 space-y-4",
				children: Object.entries(d.funnel).map(([stage, count]) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs("div", {
					className: "flex justify-between text-sm",
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-muted-foreground",
						children: stage
					}), /* @__PURE__ */ jsx("span", {
						className: "font-mono",
						children: count
					})]
				}), /* @__PURE__ */ jsx(Progress, {
					className: "mt-1",
					value: total ? count / total * 100 : 0
				})] }, stage))
			})]
		})] })]
	});
}
//#endregion
export { AnalyticsPage as component };
