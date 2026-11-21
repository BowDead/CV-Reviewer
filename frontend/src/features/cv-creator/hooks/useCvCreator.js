import { useCallback, useMemo, useState } from "react";
import { fetchSavedCv, saveCreatorCv } from "../api/cvCreatorApi";
import { createForm, toCreatorInput } from "../utils/creatorForm";
import { buildCvMarkdown, normalizeCreatorCv } from "../utils/cvMarkdown";

export function useCvCreator() {
  const [form, setForm] = useState(createForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const update = useCallback((changes) => {
    setForm((current) => ({ ...current, ...changes }));
  }, []);

  const preview = useMemo(() => {
    const cv = normalizeCreatorCv(toCreatorInput(form));
    return cv.fullName || cv.headline ? buildCvMarkdown(cv) : "";
  }, [form]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const { cv } = await saveCreatorCv(toCreatorInput(form));
      return await fetchSavedCv(cv.id);
    } catch (err) {
      setError(err);
      setSaving(false);
      return null;
    }
  }

  return { form, update, preview, save, saving, error };
}
