import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import { ne } from "zod/v4/locales";

const idSchema = z.uuid();

export function parseId(id, notFoundCode) {
  if (!idSchema.safeParse(id).success) {
    throw new HttpError(404, notFoundCode);
  }
  return id;
}
