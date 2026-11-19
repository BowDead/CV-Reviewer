import { Router } from "express";
import {
  getOfferItem,
  getOfferList,
  getOfferRepositoryList,
  postOfferInsight,
} from "../controllers/offer.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const offersRouter = Router();

offersRouter.use(requireAuth);

offersRouter.get("/", getOfferList);
offersRouter.get("/:offerKey", getOfferItem);
offersRouter.post("/:offerKey/insight", postOfferInsight);
offersRouter.get("/:offerKey/repositories", getOfferRepositoryList);
