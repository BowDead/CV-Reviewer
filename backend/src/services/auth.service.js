import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/user.model.js";
import { createDataKeyEnc } from "../utils/encryption.js";
import { parseInput } from "../utils/parse-input.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const UNIQUE_VIOLATION = "23505";
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const emailSchema = z
  .string({ error: "EMAIL_REQUIRED" })
  .trim()
  .toLowerCase()
  .max(254, "EMAIL_TOO_LONG")
  .pipe(z.email({ error: "EMAIL_INVALID" }));

const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "PASSWORD_REQUIRED" })
    .min(PASSWORD_MIN_LENGTH, "PASSWORD_TOO_SHORT")
    .max(PASSWORD_MAX_LENGTH, "PASSWORD_TOO_LONG"),
  role: z.enum(["candidate", "employer"], { error: "ROLE_INVALID" }),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "PASSWORD_REQUIRED" })
    .min(1, "PASSWORD_REQUIRED")
    .max(PASSWORD_MAX_LENGTH, "INVALID_CREDENTIALS"),
});
// Opóźnienie pozwalające na ukrycie prawdziwego czasu odpowiedzi.
const dummyHashPromise = hashPassword("konto-ktore-nie-istnieje");

export async function registerUser(input) {
  const { email, password, role } = parseInput(registerSchema, input);
  const passwordHash = await hashPassword(password);

  try {
    return await createUser({
      email,
      passwordHash,
      role,
      dataKeyEnc: createDataKeyEnc(),
    });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      throw new HttpError(409, "EMAIL_TAKEN");
    }
    throw err;
  }
}

export async function loginUser(input) {
  const { email, password } = parseInput(loginSchema, input);
  const user = await findUserByEmail(email);

  const passwordMatches = await verifyPassword(
    password,
    user?.passwordHash ?? (await dummyHashPromise),
  );

  if (!user || !passwordMatches) {
    throw new HttpError(401, "INVALID_CREDENTIALS");
  }
  return user;
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(401, "SESSION_EXPIRED");
  }
  return user;
}
