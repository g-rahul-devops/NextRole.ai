import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "../server.js";
import { t as requireSupabaseAuth } from "./auth-middleware-BxjOzQ2s.js";
import "react";
import { jsx } from "react/jsx-runtime";
import { z } from "zod";
//#region node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
//#endregion
//#region src/lib/jobs.functions.ts
var JobFilters = z.object({
	q: z.string().max(120).optional(),
	region: z.enum([
		"all",
		"remote",
		"india",
		"other"
	]).default("all"),
	remoteType: z.enum([
		"all",
		"remote",
		"hybrid",
		"onsite",
		"unknown"
	]).default("all"),
	visa: z.enum([
		"all",
		"yes",
		"no",
		"unclear"
	]).default("all"),
	minSalary: z.number().min(0).max(1e6).optional(),
	minScore: z.number().min(0).max(100).default(0),
	resumeId: z.string().uuid().nullable().optional(),
	limit: z.number().min(1).max(100).default(50)
});
var listJobs = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => JobFilters.parse(input ?? {})).handler(createSsrRpc("0f6b44b459f0f5a7154aecdbd6de5f39fc93825d0d32caf19f26936089e5a107"));
var getJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	id: z.string().uuid(),
	resumeId: z.string().uuid().nullable().optional()
}).parse(input)).handler(createSsrRpc("432b934c493a65b20930541aa425464f2c52d0a8716794775211fc250ec5a8e5"));
var toggleSaveJob = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ jobId: z.string().uuid() }).parse(input)).handler(createSsrRpc("702b9359b7913381e3b818f46684f0ed1b39bd979cdfa85f3856c27775156b6e"));
var listSavedJobs = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("2c06aacbcf719a925c7d165f0977564cfec342c6156da0e5c258b040d57b4dd2"));
var upsertApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	jobId: z.string().uuid(),
	status: z.enum([
		"applied",
		"interview",
		"rejected",
		"offer"
	]),
	notes: z.string().max(2e3).optional()
}).parse(input)).handler(createSsrRpc("792210c7315a59fe411cdcbde6b92c2df155775bb5f334f33833363966ee2f51"));
var listApplications = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("add962f30e7e6f17f7a3e016f6f563c125cffa3cffc19ef07fc9df766c3e7a4f"));
var getAnalytics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("aac7fdb5cfcc81f2a2a6d032202ea8285078fc4cd5911c834cd76e41a2c289e5"));
var getConnectorStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("ce0cdde59de02a91c3f3cc4a253aec45c2984e89034d48b2bab11edade9edc86"));
var triggerJobFetch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	keywords: z.array(z.string().max(80)).max(8).optional(),
	locations: z.array(z.string().max(60)).max(8).optional()
}).parse(input ?? {})).handler(createSsrRpc("f7d8bf980f9bc0ce8a4aa2265d3f24ceffbc1d7e96a7d0e1556aca7460ea3cfc"));
//#endregion
//#region src/components/ui/skeleton.tsx
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		className,
		style: {
			background: "#334155",
			borderRadius: 8,
			minHeight: 16
		},
		...props
	});
}
//#endregion
export { listApplications as a, toggleSaveJob as c, createSsrRpc as d, getJob as i, triggerJobFetch as l, getAnalytics as n, listJobs as o, getConnectorStatus as r, listSavedJobs as s, Skeleton as t, upsertApplication as u };
