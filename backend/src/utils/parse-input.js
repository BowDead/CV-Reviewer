import { HttpError } from "../errors/HttpError.js";

const ERROR_CODE = /^[A-Z0-9_]+$/;

export function parseInput(schema, input) {
  const result = schema.safeParse(input ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    const code = ERROR_CODE.test(issue.message)
      ? issue.message
      : "INVALID_INPUT";
    throw new HttpError(400, code, {
      min: issue.minimum,
      max: issue.maximum,
    });
  }
  return result.data;
}
