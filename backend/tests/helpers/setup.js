import { afterAll, beforeAll, beforeEach } from "vitest";
import { clearData, closeDatabase, createSchema } from "./database.js";
import { blockNetwork } from "./network.js";

beforeAll(createSchema);

beforeEach(async () => {
  blockNetwork();
  await clearData();
});

afterAll(closeDatabase);
