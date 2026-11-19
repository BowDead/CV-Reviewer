import { useEffect, useState } from "react";
import {
  fetchProfile,
  saveProfileFields,
  saveProfilePublication,
  saveProfileSkills,
  saveProfileSource,
} from "../api/profileApi";

export function useProfile() {
  const [state, setState] = useState({
    status: "loading",
    profile: null,
    error: null,
  });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfile(controller.signal)
      .then((profile) => setState({ status: "done", profile, error: null }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (error.code === "PROFILE_NOT_FOUND") {
          setState({ status: "none", profile: null, error: null });
          return;
        }
        setState({ status: "error", profile: null, error });
      });
    return () => controller.abort();
  }, []);

  async function run(action) {
    setSaving(true);
    setActionError(null);
    try {
      const profile = await action();
      setState({ status: "done", profile, error: null });
      return true;
    } catch (error) {
      setActionError(error);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    ...state,
    saving,
    actionError,
    chooseAnalysis: (analysisId) => run(() => saveProfileSource(analysisId)),
    updateFields: (fields) => run(() => saveProfileFields(fields)),
    setSkills: (skillIds) => run(() => saveProfileSkills(skillIds)),
    setPublished: (published) => run(() => saveProfilePublication(published)),
  };
}
