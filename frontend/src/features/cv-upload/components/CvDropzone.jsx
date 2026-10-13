import { useRef, useState } from "react";
import { ACCEPT_ATTRIBUTE } from "../constants";
import styles from ".CvDropzone.module.scss";

export function CvDropzone({ onFileSelected, disabled = false }) {
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
      <p className={styles.title}>Przeciągnij tutaj plik CV</p>
      <p className={styles.hint}>PDF lub DOCX, maks. {MAX_FILE_SIZE_MB} MB</p>

      <button
        type="button"
        className={styles.button}
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        Wybierz plik
      </button>

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
