import Groq from "groq-sdk";
import { env } from "../../config/env.js";
import { HttpError } from "../../errors/HttpError.js";

function toHttpError(err) {
  if (err instanceof Groq.AuthenticationError) {
    return new HttpError(
      502,
      "Nieprawidłowy klucz Groq API. Sprawdź GROQ_API_KEY.",
    );
  }
  if (err instanceof Groq.RateLimitError) {
    return new HttpError(
      429,
      "Przekroczono limit zapytań do Groq. Odczekaj chwilę i spróbuj ponownie.",
    );
  }
  if (err instanceof Groq.NotFoundError) {
    return new HttpError(
      502,
      `Model "${env.groqModel}" jest niedostępny. Zmień GROQ_MODEL w backend/.env.`,
    );
  }
  if (err instanceof Groq.APIConnectionTimeoutError) {
    return new HttpError(
      504,
      "Groq nie odpowiedział na czas. Spróbuj ponownie.",
    );
  }
  if (err instanceof Groq.APIConnectionError) {
    return new HttpError(502, "Brak połączenia z Groq API.");
  }
  if (err instanceof Groq.APIError) {
    return new HttpError(
      502,
      "Usługa AI zwróciła błąd. Spróbuj ponownie później.",
    );
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
    throw new HttpError(
      503,
      "Brak klucza Groq API. Dodaj GROQ_API_KEY w backend/.env.",
    );
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

  throw new HttpError(
    502,
    "Model AI zwrócił niepoprawną odpowiedź. Spróbuj ponownie.",
  );
}
