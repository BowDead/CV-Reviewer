import { i18n } from "./i18n";

export function formatDateTime(value) {
  return new Intl.DateTimeFormat(i18n.language, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
