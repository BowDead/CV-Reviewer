import {
  getOfferDetails,
  getOfferInsight,
  getOfferRepositories,
  getOffers,
} from "../services/offer.service.js";
import {
  offerDetailsView,
  offerInsightView,
  offerRepositoryView,
  offerView,
} from "../views/offer.view.js";

export async function getOfferList(req, res) {
  const offers = await getOffers(req.user.id);
  res.json({ offers: offers.map(offerView) });
}

export async function getOfferItem(req, res) {
  const offer = await getOfferDetails(req.user.id, req.params.offerKey);
  res.json(offerDetailsView(offer));
}

export async function postOfferInsight(req, res) {
  const insight = await getOfferInsight(req.user.id, req.params.offerKey);
  res.json(offerInsightView(insight));
}

export async function getOfferRepositoryList(req, res) {
  const repositories = await getOfferRepositories(
    req.user.id,
    req.params.offerKey,
  );
  res.json({ repositories: repositories.map(offerRepositoryView) });
}
