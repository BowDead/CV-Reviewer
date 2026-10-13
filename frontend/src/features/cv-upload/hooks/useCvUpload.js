import { useCallback, useRef, useState } from "react";
import { parseCv } from "../api/cvApi";
import { validateCvFile } from "../utils/validateCvFile";

const initialState = {
  status: "idle", // idle | uploading | done | error
  file: null,
  previewUrl: null,
  result: null,
  error: null,
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
    async (file) => {
      controllerRef.current?.abort();

      const validationError = validateCvFile(file);
      if (validationError) {
        replacePreviewUrl(null);
        setState({
          ...initialState,
          status: "error",
          error: new Error(validationError),
        });
        return;
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      const previewUrl = replacePreviewUrl(file);
      setState({
        status: "uploading",
        file,
        previewUrl,
        result: null,
        error: null,
      });

      try {
        const result = await parseCv(file, controller.signal);
        setState((prev) => ({ ...prev, status: "done", result }));
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

  return { ...state, upload, reset };
}
