import { GithubContext } from "../hooks/useGithub";
import { useGithubRepositories } from "../hooks/useGithubRepositories";

export function GithubProvider({ children }) {
  const github = useGithubRepositories();

  return (
    <GithubContext.Provider value={github}>{children}</GithubContext.Provider>
  );
}
