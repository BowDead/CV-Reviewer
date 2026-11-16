import { getApprovedSkills } from "../services/skills/skill-dictionary.service.js";
import { skillView } from "../views/skill.view.js";

export async function getSkills(req, res) {
  const skills = await getApprovedSkills();
  res.json({ skills: skills.map(skillView) });
}
