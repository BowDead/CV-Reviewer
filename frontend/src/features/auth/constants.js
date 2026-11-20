export const REGISTRABLE_ROLES = ["candidate", "employer"];

export const PASSWORD_MIN_LENGTH = 8;

const HOME_PATHS = { employer: "/employer", admin: "/admin" };

export function homePathFor(role) {
  return HOME_PATHS[role] ?? "/";
}
