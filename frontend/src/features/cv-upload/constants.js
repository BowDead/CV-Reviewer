export const MAX_FILE_SIZE_MB = 10;

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];

export const ACCEPT_ATTRIBUTE = [
  ...ACCEPTED_EXTENSIONS,
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
].join(",");

export const MANUAL_LABEL = "[UKRYTE]";

export const ANONYMIZED_LABELS = {
  fullName: "imię i nazwisko",
  email: "e-mail",
  phone: "telefon",
  pesel: "PESEL",
  githubLink: "link do GitHuba",
  linkedinLink: "link do LinkedIn",
  link: "inne linki",
  address: "adres",
  postalCode: "kod pocztowy",
  birthDate: "data urodzenia",
  manual: "ukryte ręcznie",
};
