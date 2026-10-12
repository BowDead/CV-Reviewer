import { text } from "express";
import mammoth from "mammoth";

export async function extractDocxText(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return { text: value, pageCount: null };
}
