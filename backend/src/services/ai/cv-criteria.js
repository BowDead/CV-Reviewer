export const CV_CATEGORIES = [
  "Treść",
  "Struktura",
  "Doświadczenie",
  "Umiejętności",
  "Język i styl",
];

export const CV_CRITERIA = [
  {
    id: "summary",
    category: "Treść",
    label: "Krótkie podsumowanie zawodowe na początku CV",
    source: "llm",
    needsEvidence: true,
  },
  {
    id: "contact",
    category: "Treść",
    label: "Dane kontaktowe: e-mail i telefon",
    source: "system",
  },
  {
    id: "profiles",
    category: "Treść",
    label: "Link do profilu GitHub lub LinkedIn",
    source: "system",
  },
  {
    id: "sections",
    category: "Struktura",
    label: "Wyraźne sekcje: doświadczenie, wykształcenie, umiejętności",
    source: "llm",
    needsEvidence: false,
  },
  {
    id: "dates",
    category: "Struktura",
    label: "Daty przy każdym stanowisku i szkole",
    source: "llm",
    needsEvidence: true,
  },
  {
    id: "length",
    category: "Struktura",
    label: "Długość od 250 do 1200 słów",
    source: "system",
  },
  {
    id: "achievements",
    category: "Doświadczenie",
    label: "Opisy stanowisk podają efekty pracy, a nie tylko obowiązki",
    source: "llm",
    needsEvidence: true,
  },
  {
    id: "metrics",
    category: "Doświadczenie",
    label: "Co najmniej jedno osiągnięcie z liczbą lub mierzalnym efektem",
    source: "llm",
    needsEvidence: true,
  },
  {
    id: "projects",
    category: "Doświadczenie",
    label: "Projekty z opisem użytych technologii",
    source: "llm",
    needsEvidence: true,
  },
  {
    id: "skillsSection",
    category: "Umiejętności",
    label: "Osobna lista umiejętności technicznych",
    source: "llm",
    needsEvidence: false,
  },
  {
    id: "skillsCount",
    category: "Umiejętności",
    label: "Co najmniej 8 umiejętności rozpoznanych w słowniku",
    source: "system",
  },
  {
    id: "skillsInContext",
    category: "Umiejętności",
    label: "Umiejętności poparte doświadczeniem lub projektem",
    source: "llm",
    needsEvidence: true,
  },
  {
    id: "actionVerbs",
    category: "Język i styl",
    label: "Punkty zaczynają się od czasowników akcji",
    source: "llm",
    needsEvidence: true,
  },
  {
    id: "consistency",
    category: "Język i styl",
    label: "Jeden język i jednolita forma zapisu",
    source: "llm",
    needsEvidence: false,
  },
  {
    id: "correctness",
    category: "Język i styl",
    label: "Brak literówek i błędów językowych",
    source: "llm",
    needsEvidence: false,
  },
];

export const LLM_CRITERIA = CV_CRITERIA.filter(
  (criterion) => criterion.source === "llm",
);
