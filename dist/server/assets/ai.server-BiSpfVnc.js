//#region src/lib/ai.server.ts
var GATEWAY = "https://ai.gateway.lovable.dev/v1";
var CHAT_MODEL = "openai/gpt-5.6-terra";
var EMBED_MODEL = "google/gemini-embedding-2";
function key() {
	const k = process.env["LOVABLE_API_KEY"];
	if (!k) throw new Error("Missing LOVABLE_API_KEY");
	return k;
}
function headers() {
	return {
		"Content-Type": "application/json",
		"Lovable-API-Key": key()
	};
}
async function handle(res, what) {
	if (res.ok) return res.json();
	const text = await res.text();
	if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
	if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
	throw new Error(`${what} failed (${res.status}): ${text.slice(0, 300)}`);
}
/** Embed up to 100 inputs per request (Gemini batch cap). */
async function embedTexts(inputs) {
	const out = [];
	for (let i = 0; i < inputs.length; i += 100) {
		const batch = inputs.slice(i, i + 100).map((t) => t.slice(0, 6e3) || "empty");
		const sorted = [...(await handle(await fetch(`${GATEWAY}/embeddings`, {
			method: "POST",
			headers: headers(),
			body: JSON.stringify({
				model: EMBED_MODEL,
				input: batch
			})
		}), "Embedding")).data].sort((a, b) => a.index - b.index);
		out.push(...sorted.map((d) => d.embedding));
	}
	return out;
}
async function chat(system, user, opts = {}) {
	return (await handle(await fetch(`${GATEWAY}/chat/completions`, {
		method: "POST",
		headers: headers(),
		body: JSON.stringify({
			model: CHAT_MODEL,
			reasoning_effort: "none",
			...opts.json ? { response_format: { type: "json_object" } } : {},
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}]
		})
	}), "AI request")).choices[0]?.message?.content ?? "";
}
function hashText(text) {
	let h1 = 2166136261;
	let h2 = 16777619;
	for (let i = 0; i < text.length; i++) {
		const c = text.charCodeAt(i);
		h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
		h2 = Math.imul(h2 + c, 2246822519) >>> 0;
	}
	return `${h1.toString(16)}${h2.toString(16)}${text.length.toString(16)}`;
}
//#endregion
export { chat, embedTexts, hashText };
