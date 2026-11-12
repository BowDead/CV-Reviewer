import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ItemList, ListItem } from "@/shared/ui/ItemList";
import styles from "./CvFiles.module.scss";

const KIND_LABELS = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
};

function FileIcon() {
  return (
    <svg
      className={styles.icon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function CvFileList({
  files,
  activeFileId,
  loadingId,
  onLoad,
  onRemove,
}) {
  const { t } = useTranslation();

  if (!files.length) {
    return (
      <EmptyState title={t("cvFiles.emptyTitle")}>
        {t("cvFiles.emptyText")}
      </EmptyState>
    );
  }

  return (
    <ItemList>
      {files.map((file) => (
        <ListItem
          key={file.id}
          leading={<FileIcon />}
          title={file.fileName}
          badge={file.id === activeFileId ? t("cvFiles.active") : null}
          meta={`${KIND_LABELS[file.mimeType]} · ${t("cvFiles.savedAt", {
            date: formatDateTime(file.createdAt),
          })}`}
          actions={
            <>
              <Button
                size="sm"
                disabled={loadingId !== null}
                onClick={() => onLoad(file)}
              >
                {loadingId === file.id
                  ? t("cvFiles.loadingFile")
                  : t("cvFiles.load")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRemove(file)}>
                {t("cvFiles.remove")}
              </Button>
            </>
          }
        />
      ))}
    </ItemList>
  );
}
