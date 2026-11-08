import { isDatabaseReachable } from "../models/db.js";

export async function getHealth(req, res) {
  res.json({
    status: "ok",
    databaseConnected: await isDatabaseReachable(),
  });
}
