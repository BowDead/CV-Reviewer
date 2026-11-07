import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { CvPreview, CvAnonymizedText } from "@/features/cv-upload";
import { useWorkspace } from "./useWorkspace";
import styles from "./tabs.module.scss";

export function PreviewTab() {
  const { cv, review, changedAfterAnalysis } = useWorkspace();

  return (
    <>
      <PageHeader
        title="Podgląd CV"
        description="Oryginalny plik i tekst po anonimizacji, który trafi do analizy."
      />

      {cv.status === "done" && (
        <div className={styles.split}>
          <CvPreview
            kind={cv.result.kind}
            previewUrl={cv.previewUrl}
            text={cv.result.text}
            fileName={cv.file.name}
          />
          <CvAnonymizedText
            review={review}
            changedAfterAnalysis={changedAfterAnalysis}
          />
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
