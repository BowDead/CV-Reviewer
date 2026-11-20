import {
  addSkill,
  blockPosition,
  blockUser,
  editSkill,
  getDictionary,
  getUsers,
} from "../services/admin.service.js";
import { adminUserView, dictionarySkillView } from "../views/admin.view.js";
import { positionView } from "../views/position.view.js";

export async function getUserList(req, res) {
  const users = await getUsers(req.query);
  res.json({ users: users.map(adminUserView) });
}

export async function putUserBlock(req, res) {
  const user = await blockUser(req.user.id, req.params.id, req.body);
  res.json(adminUserView(user));
}

export async function putPositionBlock(req, res) {
  const position = await blockPosition(req.params.id, req.body);
  res.json(positionView(position));
}

export async function getSkillList(req, res) {
  const skills = await getDictionary(req.query);
  res.json({ skills: skills.map(dictionarySkillView) });
}

export async function postSkill(req, res) {
  const skill = await addSkill(req.body);
  res.status(201).json(dictionarySkillView(skill));
}

export async function patchSkill(req, res) {
  const skill = await editSkill(req.params.id, req.body);
  res.json(dictionarySkillView(skill));
}
