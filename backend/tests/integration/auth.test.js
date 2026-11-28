import { describe, expect, test } from "vitest";
import { createAccount, guest } from "../helpers/accounts.js";
import { selectRows } from "../helpers/database.js";

const ACCOUNT = {
  email: "anna@example.com",
  password: "Haslo12345",
  role: "candidate",
};

function register(changes = {}) {
  return guest()
    .post("/api/auth/register")
    .send({ ...ACCOUNT, ...changes });
}

describe("registration", () => {
  // Valid and duplicate registration
  test("given valid registration data when POST /api/auth/register then 201 and an HttpOnly session cookie are returned", async () => {
    // Given
    const account = { ...ACCOUNT };

    // When
    const response = await guest().post("/api/auth/register").send(account);

    // Then
    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: account.email,
      role: "candidate",
    });
    expect(response.headers["set-cookie"][0]).toMatch(
      /^cvr_session=.+HttpOnly; SameSite=Lax/,
    );
  });

  test("given valid registration data when POST /api/auth/register then only the password hash is stored and the hash is not returned", async () => {
    // Given
    const account = { ...ACCOUNT };

    // When
    const response = await guest().post("/api/auth/register").send(account);

    // Then
    const [row] = await selectRows("SELECT password_hash FROM users");
    expect(row.password_hash).toMatch(/^scrypt\$/);
    expect(JSON.stringify(response.body)).not.toContain(row.password_hash);
  });

  test("given a taken email in another letter case when POST /api/auth/register then 409 EMAIL_TAKEN is returned", async () => {
    // Given
    await register();

    // When
    const response = await guest()
      .post("/api/auth/register")
      .send({ ...ACCOUNT, email: "ANNA@example.com" });

    // Then
    expect(response.status).toBe(409);
    expect(response.body.error).toBe("EMAIL_TAKEN");
  });

  // Invalid registration data
  test("given an invalid email when POST /api/auth/register then 400 EMAIL_INVALID is returned", async () => {
    // Given
    const changes = { email: "anna" };
    const code = "EMAIL_INVALID";

    // When
    const response = await guest()
      .post("/api/auth/register")
      .send({ ...ACCOUNT, ...changes });

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(code);
    expect(await selectRows("SELECT id FROM users")).toHaveLength(0);
  });

  test("given a short password when POST /api/auth/register then 400 PASSWORD_TOO_SHORT is returned", async () => {
    // Given
    const changes = { password: "krotkie" };
    const code = "PASSWORD_TOO_SHORT";

    // When
    const response = await guest()
      .post("/api/auth/register")
      .send({ ...ACCOUNT, ...changes });

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(code);
    expect(await selectRows("SELECT id FROM users")).toHaveLength(0);
  });

  test("given the admin role when POST /api/auth/register then 400 ROLE_INVALID is returned", async () => {
    // Given
    const changes = { role: "admin" };
    const code = "ROLE_INVALID";

    // When
    const response = await guest()
      .post("/api/auth/register")
      .send({ ...ACCOUNT, ...changes });

    // Then
    expect(response.status).toBe(400);
    expect(response.body.error).toBe(code);
    expect(await selectRows("SELECT id FROM users")).toHaveLength(0);
  });
});

describe("login", () => {
  test("given a correct email and password when POST /api/auth/login then 200 and the user are returned", async () => {
    // Given
    await register();

    // When
    const response = await guest()
      .post("/api/auth/login")
      .send({ email: ACCOUNT.email, password: ACCOUNT.password });

    // Then
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(ACCOUNT.email);
  });

  test("given a wrong password or an unknown email when POST /api/auth/login then the same 401 response is returned", async () => {
    // Given
    await register();

    // When
    const wrongPassword = await guest()
      .post("/api/auth/login")
      .send({ email: ACCOUNT.email, password: "InneHaslo1" });
    const unknownEmail = await guest()
      .post("/api/auth/login")
      .send({ email: "nikt@example.com", password: ACCOUNT.password });

    // Then
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });

  test("given a blocked account when POST /api/auth/login then 403 ACCOUNT_BLOCKED is returned", async () => {
    // Given
    await register();
    await selectRows("UPDATE users SET is_blocked = true");

    // When
    const response = await guest()
      .post("/api/auth/login")
      .send({ email: ACCOUNT.email, password: ACCOUNT.password });

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("ACCOUNT_BLOCKED");
  });
});

describe("session", () => {
  // Logged in user
  test("given a logged in user when GET /api/auth/me then the user's email and role are returned", async () => {
    // Given
    const { api, email } = await createAccount("employer");

    // When
    const response = await api.get("/api/auth/me");

    // Then
    expect(response.body.user).toMatchObject({ email, role: "employer" });
  });

  test("given a logged in user when POST /api/auth/logout then 204 and a cleared session cookie are returned", async () => {
    // Given
    const { api } = await createAccount("candidate");

    // When
    const response = await api.post("/api/auth/logout");

    // Then
    expect(response.status).toBe(204);
    expect(response.headers["set-cookie"][0]).toMatch(/^cvr_session=;/);
  });

  // Missing or forged session
  test("given no session cookie when GET /api/auth/me then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const cookie = "";
    const code = "AUTH_REQUIRED";

    // When
    const response = await guest().get("/api/auth/me").set("Cookie", cookie);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe(code);
  });

  test("given a forged session cookie when GET /api/auth/me then 401 SESSION_EXPIRED is returned", async () => {
    // Given
    const cookie = "cvr_session=abc.def.ghi";
    const code = "SESSION_EXPIRED";

    // When
    const response = await guest().get("/api/auth/me").set("Cookie", cookie);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe(code);
  });

  // Account changed after login
  test("given an account blocked after login when GET /api/auth/me then 403 ACCOUNT_BLOCKED is returned", async () => {
    // Given
    const { api, id } = await createAccount("candidate");
    await selectRows("UPDATE users SET is_blocked = true WHERE id = $1", [id]);

    // When
    const response = await api.get("/api/auth/me");

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("ACCOUNT_BLOCKED");
  });

  test("given an account deleted after login when GET /api/auth/me then 401 SESSION_EXPIRED is returned", async () => {
    // Given
    const { api, id } = await createAccount("candidate");
    await selectRows("DELETE FROM users WHERE id = $1", [id]);

    // When
    const response = await api.get("/api/auth/me");

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("SESSION_EXPIRED");
  });
});
