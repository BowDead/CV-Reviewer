import { describe, expect, test } from "vitest";
import { createAccount, guest } from "../helpers/accounts.js";
import {
  createCandidateWithProfile,
  createPosition,
  saveCv,
} from "../helpers/data.js";

describe("access without login", () => {
  // Routes that require login
  test("given a guest when GET /api/cv/saved then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/cv/saved";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/analyses then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/analyses";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/llm-keys then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/llm-keys";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/skills then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/skills";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/github/repositories then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/github/repositories";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/offers then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/offers";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/profile then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/profile";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/positions then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/positions";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/candidates then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/candidates";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/invitations then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/invitations";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });

  test("given a guest when GET /api/admin/users then 401 AUTH_REQUIRED is returned", async () => {
    // Given
    const path = "/api/admin/users";

    // When
    const response = await guest().get(path);

    // Then
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("AUTH_REQUIRED");
  });
});

describe("access by role", () => {
  // Routes forbidden for a role
  test("given the candidate role when GET /api/positions then 403 FORBIDDEN is returned", async () => {
    // Given
    const role = "candidate";
    const path = "/api/positions";
    const { api } = await createAccount(role);

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  test("given the candidate role when GET /api/candidates then 403 FORBIDDEN is returned", async () => {
    // Given
    const role = "candidate";
    const path = "/api/candidates";
    const { api } = await createAccount(role);

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  test("given the candidate role when GET /api/admin/users then 403 FORBIDDEN is returned", async () => {
    // Given
    const role = "candidate";
    const path = "/api/admin/users";
    const { api } = await createAccount(role);

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  test("given the employer role when GET /api/cv/saved then 403 FORBIDDEN is returned", async () => {
    // Given
    const role = "employer";
    const path = "/api/cv/saved";
    const { api } = await createAccount(role);

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  test("given the employer role when GET /api/analyses then 403 FORBIDDEN is returned", async () => {
    // Given
    const role = "employer";
    const path = "/api/analyses";
    const { api } = await createAccount(role);

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  test("given the employer role when GET /api/profile then 403 FORBIDDEN is returned", async () => {
    // Given
    const role = "employer";
    const path = "/api/profile";
    const { api } = await createAccount(role);

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  test("given the employer role when GET /api/admin/users then 403 FORBIDDEN is returned", async () => {
    // Given
    const role = "employer";
    const path = "/api/admin/users";
    const { api } = await createAccount(role);

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("FORBIDDEN");
  });

  // Routes open for the admin
  test("given the admin role when GET /api/cv/saved then 200 is returned", async () => {
    // Given
    const path = "/api/cv/saved";
    const { api } = await createAccount("admin");

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(200);
  });

  test("given the admin role when GET /api/positions then 200 is returned", async () => {
    // Given
    const path = "/api/positions";
    const { api } = await createAccount("admin");

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(200);
  });

  test("given the admin role when GET /api/admin/users then 200 is returned", async () => {
    // Given
    const path = "/api/admin/users";
    const { api } = await createAccount("admin");

    // When
    const response = await api.get(path);

    // Then
    expect(response.status).toBe(200);
  });
});

describe("access to other users' data", () => {
  test("given another candidate's CV when GET /api/cv/saved/:id then 404 CV_NOT_FOUND is returned", async () => {
    // Given
    const owner = await createAccount("candidate");
    const stranger = await createAccount("candidate");
    const cv = await saveCv(owner);

    // When
    const response = await stranger.api.get(`/api/cv/saved/${cv.id}`);

    // Then
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("CV_NOT_FOUND");
  });

  test("given another candidate's CV when DELETE /api/cv/saved/:id then 404 is returned and the CV stays", async () => {
    // Given
    const owner = await createAccount("candidate");
    const stranger = await createAccount("candidate");
    const cv = await saveCv(owner);

    // When
    const response = await stranger.api.delete(`/api/cv/saved/${cv.id}`);

    // Then
    expect(response.status).toBe(404);
    await owner.api.get(`/api/cv/saved/${cv.id}`).expect(200);
  });

  test("given another candidate's analysis when GET /api/analyses/:id then 404 ANALYSIS_NOT_FOUND is returned", async () => {
    // Given
    const owner = await createCandidateWithProfile();
    const stranger = await createAccount("candidate");

    // When
    const response = await stranger.api.get(
      `/api/analyses/${owner.analysisId}`,
    );

    // Then
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("ANALYSIS_NOT_FOUND");
  });

  test("given another employer's position when PUT /api/positions/:id then 404 is returned and the position stays unchanged", async () => {
    // Given
    const owner = await createAccount("employer");
    const stranger = await createAccount("employer");
    const position = await createPosition(owner);

    // When
    const response = await stranger.api
      .put(`/api/positions/${position.id}`)
      .send({ title: "Zmiana", description: "Zmiana" });

    // Then
    expect(response.status).toBe(404);
    const unchanged = await owner.api.get(`/api/positions/${position.id}`);
    expect(unchanged.body.title).toBe("Frontend");
  });
});
