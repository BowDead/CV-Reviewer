import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import pl from "./locales/pl.json";

export const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  resources: { pl: { translation: pl } },
  lng: "pl",
  fallbackLng: "pl",
  initAsync: false,
  interpolation: { escapeValue: false },
});
