import {
  createPosition,
  editPosition,
  getPosition,
  getPositions,
  removePosition,
  suggestPositionSkills,
} from "../services/position.service.js";
import { positionView, skillSuggestionView } from "../views/position.view.js";

export async function getPositionList(req, res) {
  const positions = await getPositions(req.user.id);
  res.json({ positions: positions.map(positionView) });
}

export async function getPositionItem(req, res) {
  const position = await getPosition(req.user.id, req.params.id);
  res.json(positionView(position));
}

export async function postPosition(req, res) {
  const position = await createPosition(req.user.id, req.body);
  res.status(201).json(positionView(position));
}

export async function putPosition(req, res) {
  const position = await editPosition(req.user.id, req.params.id, req.body);
  res.json(positionView(position));
}

export async function deletePositionItem(req, res) {
  await removePosition(req.user.id, req.params.id);
  res.status(204).end();
}

export async function postSkillSuggestion(req, res) {
  const suggestion = await suggestPositionSkills(req.user.id, req.body);
  res.json(skillSuggestionView(suggestion));
}
