import { useTranslation } from "react-i18next";
import { formatDateTime } from "@/shared/i18n/formatDateTime";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ItemList, ListItem } from "@/shared/ui/ItemList";
import styles from "./CvFiles.module.scss";

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

export function CvFileList({ cvs, activeFileId, loadingId, onLoad, onRemove }) {
  const { t } = useTranslation();

  if (!cvs.length) {
    return (
      <EmptyState title={t("cvFiles.emptyTitle")}>
        {t("cvFiles.emptyText")}
      </EmptyState>
    );
  }

  return (
    <ItemList>
      {cvs.map((cv) => (
        <ListItem
          key={cv.id}
          leading={<FileIcon />}
          title={cv.name}
          badge={cv.id === activeFileId ? t("cvFiles.active") : null}
          meta={t("cvFiles.savedAt", { date: formatDateTime(cv.createdAt) })}
          actions={
            <>
              <Button
                size="sm"
                disabled={loadingId !== null}
                onClick={() => onLoad(cv)}
              >
                {loadingId === cv.id
                  ? t("cvFiles.loadingFile")
                  : t("cvFiles.load")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onRemove(cv)}>
                {t("cvFiles.remove")}
              </Button>
            </>
          }
        />
      ))}
    </ItemList>
  );
}
