import {
  getProfile,
  setProfileSkills,
  setProfileSource,
  setPublication,
  updateProfile,
} from "../services/profile.service.js";
import { profileView } from "../views/profile.view.js";

export async function getProfileItem(req, res) {
  const profile = await getProfile(req.user.id);
  res.json(profileView(profile));
}

export async function putProfileSource(req, res) {
  const profile = await setProfileSource(req.user.id, req.body);
  res.json(profileView(profile));
}

export async function patchProfileFields(req, res) {
  const profile = await updateProfile(req.user.id, req.body);
  res.json(profileView(profile));
}

export async function putProfileSkills(req, res) {
  const profile = await setProfileSkills(req.user.id, req.body);
  res.json(profileView(profile));
}

export async function putProfilePublication(req, res) {
  const profile = await setPublication(req.user.id, req.body);
  res.json(profileView(profile));
}
