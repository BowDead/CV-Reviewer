import { useCallback, useRef, useState } from "react";
import { anonymizeCv, parseCv, saveCv } from "../api/cvApi";
import { validateCvFile } from "../utils/validateCvFile";

const initialState = {
  status: "idle",
  name: null,
  previewUrl: null,
  result: null,
  error: null,
  savedCvId: null,
  saveStatus: "idle",
  saveError: null,
};

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

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

  const start = useCallback((nextState) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ ...initialState, status: "uploading", ...nextState });
    return controller.signal;
  }, []);

  const finish = useCallback(async (signal, readText) => {
    try {
      const parsed = await readText();
      const { segments } = await anonymizeCv(parsed.text, signal);
      setState((prev) => ({
        ...prev,
        status: "done",
        result: { ...parsed, segments },
      }));
    } catch (error) {
      if (error.name === "AbortError") return;
      setState((prev) => ({ ...prev, status: "error", error }));
    }
  }, []);

  const upload = useCallback(
    async (file) => {
      const validationError = validateCvFile(file);
      if (validationError) {
        controllerRef.current?.abort();
        replacePreviewUrl(null);
        setState({ ...initialState, status: "error", error: validationError });
        return;
      }

      const previewUrl = replacePreviewUrl(file);
      const signal = start({ name: file.name, previewUrl });
      await finish(signal, () => parseCv(file, signal));
    },
    [replacePreviewUrl, start, finish],
  );

  const loadSaved = useCallback(
    async (saved) => {
      replacePreviewUrl(null);
      const signal = start({ name: saved.name, savedCvId: saved.id });
      await finish(signal, async () => ({
        kind: "saved",
        text: saved.content,
        pageCount: null,
        stats: {
          characters: saved.content.length,
          words: countWords(saved.content),
        },
      }));
    },
    [replacePreviewUrl, start, finish],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    replacePreviewUrl(null);
    setState(initialState);
  }, [replacePreviewUrl]);

  const save = useCallback(async () => {
    const { result, name } = state;
    if (!result) return;

    setState((prev) => ({ ...prev, saveStatus: "saving", saveError: null }));
    try {
      const { cv } = await saveCv({ name, content: result.text });
      setState((prev) =>
        prev.result === result
          ? { ...prev, savedCvId: cv.id, saveStatus: "idle" }
          : prev,
      );
    } catch (error) {
      setState((prev) =>
        prev.result === result
          ? { ...prev, saveStatus: "error", saveError: error }
          : prev,
      );
    }
  }, [state]);

  const forgetSavedCv = useCallback((id) => {
    setState((prev) =>
      prev.savedCvId === id ? { ...prev, savedCvId: null } : prev,
    );
  }, []);

  return { ...state, upload, loadSaved, reset, save, forgetSavedCv };
}
