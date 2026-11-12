import { useCallback, useRef, useState } from "react";
import { anonymizeCv, parseCv, saveCvFile } from "../api/cvApi";
import { validateCvFile } from "../utils/validateCvFile";

const initialState = {
  status: "idle", // idle | uploading | done | error
  file: null,
  previewUrl: null,
  result: null,
  error: null,
  savedFileId: null,
  saveStatus: "idle",
  saveError: null,
};

export function useCvUpload() {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef(null);
  const previewUrlRef = useRef(null);

  const replacePreviewUrl = useCallback((file) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = file ? URL.createObjectURL(file) : null;
    return previewUrlRef.current;
  }, []);

  const upload = useCallback(
    async (file, savedFileId = null) => {
      controllerRef.current?.abort();

      const validationError = validateCvFile(file);
      if (validationError) {
        replacePreviewUrl(null);
        setState({
          ...initialState,
          status: "error",
          error: validationError,
        });
        return;
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      const previewUrl = replacePreviewUrl(file);
      setState({
        ...initialState,
        status: "uploading",
        file,
        previewUrl,
        savedFileId,
      });

      try {
        const parsed = await parseCv(file, controller.signal);
        const { segments } = await anonymizeCv(parsed.text, controller.signal);
        setState((prev) => ({
          ...prev,
          status: "done",
          result: { ...parsed, segments },
        }));
      } catch (error) {
        if (error.name === "AbortError") return;
        setState((prev) => ({ ...prev, status: "error", error }));
      }
    },
    [replacePreviewUrl],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    replacePreviewUrl(null);
    setState(initialState);
  }, [replacePreviewUrl]);

  const save = useCallback(async () => {
    const file = state.file;
    if (!file) return;

    setState((prev) => ({ ...prev, saveStatus: "saving", saveError: null }));
    try {
      const { file: saved } = await saveCvFile(file);
      setState((prev) =>
        prev.file === file
          ? { ...prev, savedFileId: saved.id, saveStatus: "idle" }
          : prev,
      );
    } catch (error) {
      setState((prev) =>
        prev.file === file
          ? { ...prev, saveStatus: "error", saveError: error }
          : prev,
      );
    }
  }, [state.file]);

  const forgetSavedFile = useCallback((id) => {
    setState((prev) =>
      prev.savedFileId === id ? { ...prev, savedFileId: null } : prev,
    );
  }, []);

  return { ...state, upload, reset, save, forgetSavedFile };
}
