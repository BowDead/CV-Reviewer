import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../errors/HttpError.js";
import {
  deleteLlmKey,
  findDefaultLlmKey,
  insertLlmKey,
  listLlmKeys,
  updateLlmKeyOrder,
} from "../models/llm-key.model.js";
import { decryptBytes, encryptBytes } from "../utils/encryption.js";
import { parseInput } from "../utils/parse-input.js";
import {
  getProvider,
  listProviders,
  PROVIDER_IDS,
} from "./ai/providers/index.js";
import { getUserDataKey } from "./user-crypto.service.js";

const MAX_KEYS = 10;
const UNIQUE_VIOLATION = "23505";

const addKeySchema = z.object({
  provider: z.enum(PROVIDER_IDS, { error: "PROVIDER_REQUIRED" }),
  model: z
    .string({ error: "MODEL_REQUIRED" })
    .trim()
    .min(1, "MODEL_REQUIRED")
    .max(100, "MODEL_TOO_LONG"),
  label: z.string().trim().max(100, "LLM_KEY_LABEL_TOO_LONG").optional(),
  apiKey: z
    .string({ error: "API_KEY_REQUIRED" })
    .trim()
    .min(1, "API_KEY_REQUIRED")
    .max(500, "API_KEY_TOO_LONG")
    .regex(/^[\x21-\x7e]+$/, "API_KEY_INVALID_CHARS"),
});

const keyIdSchema = z.uuid({ error: "LLM_KEY_NOT_FOUND" });

const orderSchema = z.object({
  ids: z.array(keyIdSchema, { error: "LLM_KEY_ORDER_INVALID" }),
});

export async function getLlmKeys(userId) {
  return { keys: await listLlmKeys(userId), providers: listProviders() };
}

export async function addLlmKey(userId, input) {
  const { provider, model, label, apiKey } = parseInput(addKeySchema, input);

  const existing = await listLlmKeys(userId);
  if (existing.length >= MAX_KEYS) {
    throw new HttpError(409, "LLM_KEY_LIMIT", { max: MAX_KEYS });
  }

  await getProvider(provider).verifyKey({ apiKey, model });

  const dataKey = await getUserDataKey(userId);
  try {
    return await insertLlmKey({
      userId,
      provider,
      model,
      label: label || null,
      apiKeyEnc: encryptBytes(Buffer.from(apiKey, "utf8"), dataKey),
    });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, "LLM_KEY_SAVE_FAILED");
    }
    throw err;
  }
}

export async function removeLlmKey(userId, keyId) {
  const id = parseInput(keyIdSchema, keyId);
  if (!(await deleteLlmKey(userId, id))) {
    throw new HttpError(404, "LLM_KEY_NOT_FOUND");
  }
}

export async function reorderLlmKeys(userId, input) {
  const { ids } = parseInput(orderSchema, input);

  const existing = await listLlmKeys(userId);
  const existingIds = new Set(existing.map((key) => key.id));
  const isComplete =
    new Set(ids).size === ids.length &&
    ids.length === existing.length &&
    ids.every((id) => existingIds.has(id));
  if (!isComplete) {
    throw new HttpError(400, "LLM_KEY_ORDER_INVALID");
  }

  await updateLlmKeyOrder(userId, ids);
  return listLlmKeys(userId);
}

function bindProvider({ provider, model, apiKey }) {
  return {
    model,
    completeJson: (request) =>
      getProvider(provider).completeJson({ ...request, apiKey, model }),
  };
}

export async function resolveLlm(userId) {
  const key = await findDefaultLlmKey(userId);
  if (key) {
    const dataKey = await getUserDataKey(userId);
    const apiKey = decryptBytes(key.apiKeyEnc, dataKey).toString("utf8");
    return bindProvider({ provider: key.provider, model: key.model, apiKey });
  }

  if (!env.isProduction && env.groqApiKey) {
    return bindProvider({
      provider: "groq",
      model: env.groqModel,
      apiKey: env.groqApiKey,
    });
  }

  throw new HttpError(409, "LLM_KEY_REQUIRED");
}
