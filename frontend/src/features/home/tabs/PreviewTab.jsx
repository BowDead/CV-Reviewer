import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { CvPreview, CvExtractedText } from "@/features/cv-upload";
import { useWorkspace } from "./useWorkspace";
import styles from "./tabs.module.scss";

export function PreviewTab() {
  const { cv } = useWorkspace();

  return (
    <>
      <PageHeader
        title="Podgląd CV"
        description="Oryginalny plik i tekst, który trafia do analizy."
      />

      {cv.status === "done" && (
        <div className={styles.split}>
          <CvPreview
            kind={cv.result.kind}
            previewUrl={cv.previewUrl}
            text={cv.result.text}
            fileName={cv.file.name}
          />
          <CvExtractedText text={cv.result.text} />
        </div>
      )}

      {cv.status === "uploading" && (
        <EmptyState busy title="Odczytywanie pliku…">
          {cv.file.name}
        </EmptyState>
      )}

      {(cv.status === "idle" || cv.status === "error") && (
        <EmptyState title="Nie wgrano jeszcze CV">
          Wgraj plik w panelu po lewej. Podgląd pojawi się tutaj, a w zakładkach
          Analiza, Poprawki i Profil zobaczysz wyniki po kliknięciu „Analizuj
          CV”.
        </EmptyState>
      )}
    </>
  );
}
