import { i18n } from "@/shared/i18n/i18n";

export function formatScore(score) {
  if (score === null || score === undefined) {
    return "–";
  }
  return new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
}
