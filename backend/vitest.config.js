import { defineConfig } from "vitest/config";

const testEnv = {
  NODE_ENV: "test",
  DOTENV_CONFIG_QUIET: "true",
  JWT_SECRET: "tylko-do-testow-tylko-do-testow-1234",
  MASTER_KEY: Buffer.alloc(32, 1).toString("base64url"),
  GROQ_API_KEY: "",
  GITHUB_TOKEN: "",
  DATABASE_URL:
    "postgres://cvreviewer:cvreviewer@127.0.0.1:5433/cvreviewer_test",
};

export default defineConfig({
  test: {
    env: testEnv,
    silent: "passed-only",
    reporters: ["verbose"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.js"],
      exclude: ["src/server.js", "src/docs/**"],
      reporter: ["text", "html"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.js"],
        },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.js"],
          setupFiles: ["tests/helpers/setup.js"],
          fileParallelism: false,
          testTimeout: 15_000,
          hookTimeout: 30_000,
        },
      },
    ],
  },
});
