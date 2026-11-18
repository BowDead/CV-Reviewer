const CODE_BLOCK = /```[\s\S]*?```/g;
const IMAGE = /!\[[^\]]*\]\([^)]*\)/g;
const LINK = /\[([^\]]*)\]\([^)]*\)/g;
const HTML_TAG = /<[^>]+>/g;
const HEADING = /^#{1,6}\s*/gm;

export function cleanReadme(markdown, limit = 600) {
  return markdown
    .replace(CODE_BLOCK, " ")
    .replace(IMAGE, " ")
    .replace(LINK, "$1")
    .replace(HTML_TAG, " ")
    .replace(HEADING, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}
