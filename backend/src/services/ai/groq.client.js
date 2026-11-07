import Groq from "groq-sdk";
import { env } from "../../config/env.js";
import { HttpError } from "../../errors/HttpError.js";

const PROVIDER = { provider: "Groq" };

function toHttpError(err) {
  if (err instanceof Groq.AuthenticationError) {
    return new HttpError(502, "AI_KEY_INVALID", PROVIDER);
  }
  if (err instanceof Groq.RateLimitError) {
    return new HttpError(429, "AI_RATE_LIMIT", PROVIDER);
  }
  if (err instanceof Groq.NotFoundError) {
    return new HttpError(502, "AI_MODEL_UNAVAILABLE", { model: env.groqModel });
  }
  if (err instanceof Groq.APIConnectionTimeoutError) {
    return new HttpError(504, "AI_TIMEOUT", PROVIDER);
  }
  if (err instanceof Groq.APIConnectionError) {
    return new HttpError(502, "AI_CONNECTION", PROVIDER);
  }
  if (err instanceof Groq.APIError) {
    return new HttpError(502, "AI_PROVIDER_ERROR");
  }
  return err;
}

function isInvalidJsonError(err) {
  return (
    err instanceof SyntaxError ||
    (err instanceof Groq.BadRequestError && /json/i.test(err.message))
  );
}

export async function completeJson({
  apiKey,
  system,
  user,
  temperature = 0.3,
}) {
  if (!apiKey) {
    throw new HttpError(503, "AI_KEY_MISSING");
  }

  const client = new Groq({ apiKey, timeout: 60_000, maxRetries: 2 });
  for (const currentTemperature of [temperature, 0]) {
    try {
      const completion = await client.chat.completions.create({
        model: env.groqModel,
        temperature: currentTemperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });

      return JSON.parse(completion.choices[0]?.message?.content ?? "");
    } catch (err) {
      if (isInvalidJsonError(err)) {
        continue;
      }
      console.error("Błąd Groq API:", err);
      throw toHttpError(err);
    }
  }

  throw new HttpError(502, "AI_INVALID_RESPONSE");
}
