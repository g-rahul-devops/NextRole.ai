//#region src/lib/resume.server.ts
/** Extract plain text from an uploaded resume file. */
async function extractText(bytes, mimeType, fileName) {
	const lower = fileName.toLowerCase();
	if (mimeType.includes("pdf") || lower.endsWith(".pdf")) {
		const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
		const { text } = await pdfText(await getDocumentProxy(bytes), { mergePages: true });
		return String(text);
	}
	return new TextDecoder().decode(bytes).replace(/\u0000/g, " ");
}
//#endregion
export { extractText };
