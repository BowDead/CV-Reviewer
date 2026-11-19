import { useEffect, useState } from "react";
import { fetchSkills } from "../api/profileApi";

export function useSkillDictionary() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSkills(controller.signal)
      .then((data) => setSkills(data.skills))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return skills;
}
