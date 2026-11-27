import { randomUUID } from "node:crypto";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { AUTH_COOKIE_NAME } from "../../src/config/auth.js";
import { createUser } from "../../src/models/user.model.js";
import { signAuthToken } from "../../src/services/token.service.js";
import { createDataKeyEnc } from "../../src/utils/encryption.js";

const app = createApp();

export function guest() {
  return request(app);
}

export async function createAccount(role) {
  const user = await createUser({
    email: `${role}-${randomUUID()}@example.com`,
    passwordHash: "konto-bez-logowania-haslem",
    role,
    dataKeyEnc: createDataKeyEnc(),
  });
  const api = request
    .agent(app)
    .set("Cookie", `${AUTH_COOKIE_NAME}=${signAuthToken(user)}`);
  return { id: user.id, email: user.email, api };
}
