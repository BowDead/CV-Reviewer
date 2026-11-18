import { createContext, useContext } from "react";

export const GithubContext = createContext(null);

export function useGithub() {
  const github = useContext(GithubContext);
  if (!github) {
    throw new Error("useGithub musi być użyte wewnątrz GithubProvider");
  }
  return github;
}
