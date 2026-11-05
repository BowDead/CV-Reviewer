export const ROLE_LABELS = {
  candidate: "Kandydat",
  employer: "Pracodawca",
  admin: "Administrator",
};

export const REGISTRABLE_ROLES = ["candidate", "employer"];

export const PASSWORD_MIN_LENGTH = 8;

export function homePathFor(role) {
  return role === "employer" ? "/employer" : "/";
}
