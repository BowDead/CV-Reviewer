import { extractText, getDocumentProxy } from "unpdf";

export async function extractPdfText(buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  try {
    const { totalPages, text } = await extractText(pdf, { mergePages: true });
    return { text, pageCount: totalPages };
  } finally {
    await pdf.loadingTask.destroy();
  }
}
