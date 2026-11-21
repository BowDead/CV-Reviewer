export const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const LIMITS = {
  experience: 20,
  education: 10,
  skills: 50,
  languages: 10,
};

function withKey(item) {
  return { key: crypto.randomUUID(), ...item };
}

export function createJob() {
  return withKey({
    title: "",
    company: "",
    start: "",
    end: "",
    highlights: "",
  });
}

export function createSchool() {
  return withKey({ degree: "", school: "", start: "", end: "" });
}

export function createLanguage() {
  return withKey({ name: "", level: "" });
}

export function createForm() {
  return {
    name: "",
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
    languages: [],
  };
}

function withoutKey(item) {
  const copy = { ...item };
  delete copy.key;
  return copy;
}

export function toCreatorInput(form) {
  return {
    ...form,
    experience: form.experience.map((job) => ({
      ...withoutKey(job),
      highlights: job.highlights.split("\n"),
    })),
    education: form.education.map(withoutKey),
    languages: form.languages.map(withoutKey),
  };
}
