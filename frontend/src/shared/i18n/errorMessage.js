import { i18n } from "./i18n";

export function errorMessage(error) {
  return i18n.t(`errors.${error?.code}`, {
    ...error?.params,
    defaultValue: i18n.t("errors.UNKNOWN"),
  });
}
