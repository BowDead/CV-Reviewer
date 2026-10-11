import { env } from "../config/env.js";

export function getHealth(req, res) {
  res.json({
    status: "ok",
    groqConfigured: Boolean(env.groqApiKey),
  });
}
