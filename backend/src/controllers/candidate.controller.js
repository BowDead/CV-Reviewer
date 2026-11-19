import { findCandidates, getCandidate } from "../services/candidate.service.js";
import { candidateView } from "../views/candidate.view.js";

export async function getCandidateList(req, res) {
  const candidates = await findCandidates(req.user.id, req.query);
  res.json({ candidates: candidates.map(candidateView) });
}

export async function getCandidateItem(req, res) {
  const candidate = await getCandidate(req.params.id);
  res.json(candidateView(candidate));
}
