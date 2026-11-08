import { HttpError } from "../../../errors/HttpError.js";
import { groqProvider } from "./groq.provider.js";

const PROVIDERS = {
  groq: groqProvider,
};

export const PROVIDER_IDS = Object.keys(PROVIDERS);

export function getProvider(id) {
  const provider = PROVIDERS[id];
  if (!provider) {
    throw new HttpError(422, "PROVIDER_UNSUPPORTED", { provider: id });
  }
  return provider;
}

export function listProviders() {
  return PROVIDER_IDS.map((id) => ({
    id,
    label: PROVIDERS[id].label,
    defaultModel: PROVIDERS[id].defaultModel,
    keysUrl: PROVIDERS[id].keysUrl,
  }));
}
