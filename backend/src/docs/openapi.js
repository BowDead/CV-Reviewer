import { readFileSync } from "node:fs";
import { parse } from "yaml";

export const openApiDocument = parse(
  readFileSync(new URL("./openapi.yaml", import.meta.url), "utf8"),
);
