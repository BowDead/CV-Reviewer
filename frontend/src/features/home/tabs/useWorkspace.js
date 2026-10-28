import { useOutletContext } from "react-router";

export function useWorkspace() {
  return useOutletContext();
}
