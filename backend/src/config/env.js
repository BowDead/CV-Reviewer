import "dotenv/config";

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Brak zmiennej środowiskowej ${name}. Uzupełnij backend/.env albo compose.yaml.`,
    );
  }
  return value;
}

const jwtSecret = required("JWT_SECRET");
if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET jest za krótki (minimum 32 znaki).");
}

const masterKey = Buffer.from(required("MASTER_KEY"), "base64url");
if (masterKey.length !== 32) {
  throw new Error("MASTER_KEY musi mieć 32 bajty zapisane w base64url.");
}

export const env = {
  port: Number(process.env.PORT) || 3001,
  isProduction: process.env.NODE_ENV === "production",
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret,
  masterKey,
};
