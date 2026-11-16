import {
  insertPendingSkills,
  listApprovedSkills,
} from "../../models/skill.model.js";
import { createSkillDetector } from "./skill-detector.service.js";

const MAX_NAME_LENGTH = 100;

let detectorPromise = null;

export function getSkillDetector() {
  detectorPromise ??= listApprovedSkills()
    .then(createSkillDetector)
    .catch((err) => {
      detectorPromise = null;
      throw err;
    });
  return detectorPromise;
}

export function getApprovedSkills() {
  return listApprovedSkills();
}

export async function savePendingSkills(names) {
  const valid = names
    .map((name) => name.trim())
    .filter((name) => name && name.length <= MAX_NAME_LENGTH);
  if (valid.length === 0) {
    return;
  }
  try {
    await insertPendingSkills(valid);
  } catch (err) {
    console.error("Nie udało się zapisać nowych umiejętności:", err);
  }
}
