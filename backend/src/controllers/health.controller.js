import { env } from "../config/env.js";
import { isDatabaseReachable } from "../models/db.js";

export async function getHealth(req, res) {
  res.json({
    status: "ok",
    groqConfigured: Boolean(env.groqApiKey),
    databaseConnected: await isDatabaseReachable(),
  });
}
