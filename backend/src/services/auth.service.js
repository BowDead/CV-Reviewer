import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/user.model.js";
import { createDataKeyEnc } from "../utils/encryption.js";
import { hashPassword, verifyPassword } from "../utils/password.js";

const UNIQUE_VIOLATION = "23505";
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const emailSchema = z
  .string({ error: "Podaj adres e-mail." })
  .trim()
  .toLowerCase()
  .max(254, "Adres e-mail jest za długi.")
  .pipe(z.email({ error: "Nieprawidłowy adres e-mail." }));

const registerSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "Podaj hasło." })
    .min(
      PASSWORD_MIN_LENGTH,
      `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków.`,
    )
    .max(
      PASSWORD_MAX_LENGTH,
      `Hasło może mieć najwyżej ${PASSWORD_MAX_LENGTH} znaków.`,
    ),
  role: z.enum(["candidate", "employer"], {
    error: "Wybierz rolę: kandydat albo pracodawca.",
  }),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: "Podaj hasło." })
    .min(1, "Podaj hasło.")
    .max(PASSWORD_MAX_LENGTH, "Nieprawidłowy e-mail lub hasło."),
});
// Opóźnienie pozwalające na ukrycie prawdziwego czasu odpowiedzi.
const dummyHashPromise = hashPassword("konto-ktore-nie-istnieje");

function parseInput(schema, input) {
  const result = schema.safeParse(input ?? {});
  if (!result.success) {
    throw new HttpError(400, result.error.issues[0].message);
  }
  return result.data;
}

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
      throw new HttpError(409, "Konto z tym adresem e-mail już istnieje.");
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
    throw new HttpError(401, "Nieprawidłowy e-mail lub hasło.");
  }
  return user;
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(401, "Sesja wygasła. Zaloguj się ponownie.");
  }
  return user;
}
