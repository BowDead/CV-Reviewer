import {
  addLlmKey,
  getLlmKeys,
  removeLlmKey,
  reorderLlmKeys,
} from "../services/llm-key.service.js";
import { llmKeyView } from "../views/llm-key.view.js";

export async function getKeys(req, res) {
  const { keys, providers } = await getLlmKeys(req.user.id);
  res.json({ keys: keys.map(llmKeyView), providers });
}

export async function postKey(req, res) {
  const key = await addLlmKey(req.user.id, req.body);
  res.status(201).json({ key: llmKeyView(key) });
}

export async function putKeyOrder(req, res) {
  const keys = await reorderLlmKeys(req.user.id, req.body);
  res.json({ keys: keys.map(llmKeyView) });
}

export async function deleteKey(req, res) {
  await removeLlmKey(req.user.id, req.params.id);
  res.status(204).end();
}
