import { t as createServerFn } from "../server.js";
import { t as requireSupabaseAuth } from "./auth-middleware-BxjOzQ2s.js";
import { d as createSsrRpc } from "./skeleton-CdrIB4qs.js";
import { z } from "zod";
//#region src/lib/match.functions.ts
/** Score every semantically-similar job against a resume and store the results. */
var runMatching = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	resumeId: z.string().uuid(),
	topK: z.number().min(10).max(200).default(80)
}).parse(input)).handler(createSsrRpc("a54e268432ca3903da159ad56a9d26e9356703954856b303a785ac5df3626374"));
var generateCoverLetter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({
	jobId: z.string().uuid(),
	resumeId: z.string().uuid()
}).parse(input)).handler(createSsrRpc("01e0915b7cea1b43e783468f6d8fc7bbf1a9cde4d824ffe1acd2f134966f4b86"));
//#endregion
export { runMatching as n, generateCoverLetter as t };
