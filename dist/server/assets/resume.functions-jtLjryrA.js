import { t as createServerFn } from "../server.js";
import { t as createServerRpc } from "./createServerRpc-B0PkXF8x.js";
import { t as requireSupabaseAuth } from "./auth-middleware-BxjOzQ2s.js";
import { z } from "zod";
//#region src/lib/resume.functions.ts?tss-serverfn-split
var UploadInput = z.object({
	fileName: z.string().min(1).max(200),
	mimeType: z.string().max(120),
	base64: z.string().min(10)
});
var uploadResume_createServerFn_handler = createServerRpc({
	id: "107b1c81c8664a01d9ab046533f665238584805e69057fbd7a0567e2e69cb528",
	name: "uploadResume",
	filename: "src/lib/resume.functions.ts"
}, (opts) => uploadResume.__executeServer(opts));
var uploadResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => UploadInput.parse(input)).handler(uploadResume_createServerFn_handler, async ({ data, context }) => {
	const { extractText } = await import("./resume.server-SJOxD21f.js");
	const { parseResume } = await import("./agent.server-dcUdr-4K.js");
	const { embedTexts } = await import("./ai.server-BiSpfVnc.js");
	const text = await extractText(Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0)), data.mimeType, data.fileName);
	if (text.trim().length < 50) throw new Error("Could not read enough text from that file. Try a text-based PDF or paste the text.");
	const parsed = await parseResume(text);
	const [embedding] = await embedTexts([`${parsed.summary}\nSkills: ${parsed.skills.join(", ")}\nTitles: ${parsed.titles.join(", ")}\nCertifications: ${parsed.certifications.join(", ")}\n${text.slice(0, 4e3)}`]);
	const { data: row, error } = await context.supabase.from("resumes").insert({
		user_id: context.userId,
		file_name: data.fileName,
		raw_text: text.slice(0, 4e4),
		parsed,
		embedding: JSON.stringify(embedding ?? [])
	}).select("id, file_name, parsed, created_at").single();
	if (error) throw new Error(error.message);
	return row;
});
var listResumes_createServerFn_handler = createServerRpc({
	id: "b288288ab2fbfc0ca7181e1a97e7dfa0595009975ab09c38712ba7388546face",
	name: "listResumes",
	filename: "src/lib/resume.functions.ts"
}, (opts) => listResumes.__executeServer(opts));
var listResumes = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listResumes_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("resumes").select("id, file_name, parsed, created_at").order("created_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
});
var deleteResume_createServerFn_handler = createServerRpc({
	id: "b770062f53397f87339e19e0ecab926a5a29badd155b20f722f317084c9c2140",
	name: "deleteResume",
	filename: "src/lib/resume.functions.ts"
}, (opts) => deleteResume.__executeServer(opts));
var deleteResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input)).handler(deleteResume_createServerFn_handler, async ({ data, context }) => {
	const { error } = await context.supabase.from("resumes").delete().eq("id", data.id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { deleteResume_createServerFn_handler, listResumes_createServerFn_handler, uploadResume_createServerFn_handler };
