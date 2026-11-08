import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import { findDataKeyEnc } from "../models/user.model.js";
import { decryptBytes } from "../utils/encryption.js";

export async function getUserDataKey(userId) {
  const dataKeyEnc = await findDataKeyEnc(userId);
  if (!dataKeyEnc) {
    throw new HttpError(401, "SESSION_EXPIRED");
  }
  return decryptBytes(dataKeyEnc, env.masterKey);
}
