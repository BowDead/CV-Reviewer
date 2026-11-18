import { Router } from "express";
import {
  getOfferList,
  postOfferInsight,
} from "../controllers/offer.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

export const offersRouter = Router();

offersRouter.use(requireAuth);

offersRouter.get("/", getOfferList);
offersRouter.post("/:offerKey/insight", postOfferInsight);
