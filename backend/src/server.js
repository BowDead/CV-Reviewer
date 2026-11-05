import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { runMigrations } from "./models/migrate.js";

await runMigrations();

const app = createApp();

app.listen(env.port, () => {
  console.log(`API działa na http://localhost:${env.port}/api`);
});
