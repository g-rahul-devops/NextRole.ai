import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const UploadInput = z.object({
  fileName: z.string().min(1).max(200),
  mimeType: z.string().max(120),
  base64: z.string().min(10),
});

export const uploadResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UploadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { extractText } = await import("@/lib/resume.server");
    const { parseResume } = await import("@/lib/agent.server");
    const { embedTexts } = await import("@/lib/ai.server");

    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const text = await extractText(bytes, data.mimeType, data.fileName);
    if (text.trim().length < 50) {
      throw new Error("Could not read enough text from that file. Try a text-based PDF or paste the text.");
    }

    const parsed = await parseResume(text);
    const [embedding] = await embedTexts([
      `${parsed.summary}\nSkills: ${parsed.skills.join(", ")}\nTitles: ${parsed.titles.join(", ")}\nCertifications: ${parsed.certifications.join(", ")}\n${text.slice(0, 4000)}`,
    ]);

    const { data: row, error } = await context.supabase
      .from("resumes")
      .insert({
        user_id: context.userId,
        file_name: data.fileName,
        raw_text: text.slice(0, 40000),
        parsed: parsed as never,
        embedding: JSON.stringify(embedding ?? []),
      })
      .select("id, file_name, parsed, created_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const listResumes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("resumes")
      .select("id, file_name, parsed, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("resumes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
