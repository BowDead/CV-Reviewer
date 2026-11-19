import { useCallback, useState } from "react";
import { suggestSkills } from "../api/positionsApi";

export function useSkillSuggestion() {
  const [state, setState] = useState({
    status: "idle",
    unknownSkills: [],
    error: null,
  });

  const suggest = useCallback(async (title, description) => {
    setState({ status: "loading", unknownSkills: [], error: null });
    try {
      const result = await suggestSkills({ title, description });
      setState({
        status: "done",
        unknownSkills: result.unknownSkills,
        error: null,
      });
      return result.skills;
    } catch (error) {
      setState({ status: "error", unknownSkills: [], error });
      return null;
    }
  }, []);

  return { ...state, suggest };
}
