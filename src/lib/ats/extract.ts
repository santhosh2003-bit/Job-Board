import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

export type ExtractedResume = {
  text: string;
  kind: "pdf" | "docx" | "txt";
};

export class UnsupportedFileError extends Error {}
export class EmptyResumeError extends Error {}

/**
 * Extract plain text from an uploaded resume. Uses `unpdf` (a serverless-ready
 * pdf.js build) for PDFs and `mammoth` for DOCX — both accurate, dependency-light
 * text extractors that run in a Node serverless function.
 */
export async function extractResumeText(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<ExtractedResume> {
  const lower = fileName.toLowerCase();
  const isPdf = mimeType === "application/pdf" || lower.endsWith(".pdf");
  const isDocx =
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lower.endsWith(".docx");
  const isTxt = mimeType?.startsWith("text/") || lower.endsWith(".txt");

  let text = "";
  let kind: ExtractedResume["kind"];

  if (isPdf) {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text: pdfText } = await extractText(pdf, { mergePages: true });
    text = Array.isArray(pdfText) ? pdfText.join("\n") : pdfText;
    kind = "pdf";
  } else if (isDocx) {
    const { value } = await mammoth.extractRawText({ buffer });
    text = value;
    kind = "docx";
  } else if (isTxt) {
    text = buffer.toString("utf-8");
    kind = "txt";
  } else {
    throw new UnsupportedFileError(
      "Unsupported file type. Please upload a PDF, DOCX, or TXT resume."
    );
  }

  text = normalizeWhitespace(text);
  if (text.replace(/\s/g, "").length < 40) {
    throw new EmptyResumeError(
      "We couldn't read enough text from this file. If it's a scanned/image PDF, upload a text-based PDF or DOCX instead."
    );
  }

  return { text, kind };
}

function normalizeWhitespace(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
