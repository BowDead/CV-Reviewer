import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/Button";
import { ACCEPT_ATTRIBUTE, MAX_FILE_SIZE_MB } from "../constants";
import styles from "./CvDropzone.module.scss";

export function CvDropzone({
  onFileSelected,
  onChooseSaved,
  disabled = false,
}) {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function selectFirstFile(fileList) {
    const file = fileList?.[0];
    if (file) {
      onFileSelected(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      selectFirstFile(event.dataTransfer.files);
    }
  }

  function handleInputChange(event) {
    selectFirstFile(event.target.files);
    event.target.value = "";
  }

  const className = [
    styles.dropzone,
    isDragging && styles.dragging,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <p className={styles.title}>{t("cvUpload.dropTitle")}</p>
      <p className={styles.hint}>
        {t("cvUpload.dropHint", { maxMb: MAX_FILE_SIZE_MB })}
      </p>

      <div className={styles.actions}>
        <Button
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {t("cvUpload.chooseFile")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onChooseSaved}
          disabled={disabled}
        >
          {t("cvUpload.fromSaved")}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleInputChange}
        hidden
      />
    </div>
  );
}
