const GATEWAY = "https://ai.gateway.lovable.dev/v1";
const CHAT_MODEL = "openai/gpt-5.6-terra";
const EMBED_MODEL = "google/gemini-embedding-2";

function key(): string {
  const k = process.env["LOVABLE_API_KEY"];
  if (!k) throw new Error("Missing LOVABLE_API_KEY");
  return k;
}

function headers() {
  return { "Content-Type": "application/json", "Lovable-API-Key": key() };
}

async function handle(res: Response, what: string) {
  if (res.ok) return res.json();
  const text = await res.text();
  if (res.status === 429) throw new Error("AI rate limit reached. Please try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in workspace settings.");
  throw new Error(`${what} failed (${res.status}): ${text.slice(0, 300)}`);
}

/** Embed up to 100 inputs per request (Gemini batch cap). */
export async function embedTexts(inputs: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < inputs.length; i += 100) {
    const batch = inputs.slice(i, i + 100).map((t) => t.slice(0, 6000) || "empty");
    const res = await fetch(`${GATEWAY}/embeddings`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ model: EMBED_MODEL, input: batch }),
    });
    const body = (await handle(res, "Embedding")) as { data: Array<{ index: number; embedding: number[] }> };
    const sorted = [...body.data].sort((a, b) => a.index - b.index);
    out.push(...sorted.map((d) => d.embedding));
  }
  return out;
}

export async function chat(
  system: string,
  user: string,
  opts: { json?: boolean; maxTokens?: number } = {},
): Promise<string> {
  const res = await fetch(`${GATEWAY}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: CHAT_MODEL,
      reasoning_effort: "none",
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  const body = (await handle(res, "AI request")) as {
    choices: Array<{ message: { content: string } }>;
  };
  return body.choices[0]?.message?.content ?? "";
}

export function hashText(text: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c, 2246822519) >>> 0;
  }
  return `${h1.toString(16)}${h2.toString(16)}${text.length.toString(16)}`;
}
