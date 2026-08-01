/** Extract plain text from an uploaded resume file. */
export async function extractText(bytes: Uint8Array, mimeType: string, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (mimeType.includes("pdf") || lower.endsWith(".pdf")) {
    const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
    const doc = await getDocumentProxy(bytes);
    const { text } = await pdfText(doc, { mergePages: true });
    return String(text);
  }
  // txt / md / anything decodable as UTF-8 (docx binary will fail the length check upstream)
  return new TextDecoder().decode(bytes).replace(/\u0000/g, " ");
}
