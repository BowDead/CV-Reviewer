import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";

export function AnalysisGate({ cv, analysis, startAnalysis, children }) {
  if (cv.status !== "done") {
    return (
      <EmptyState title="Najpierw wgraj CV">
        Wgraj plik PDF lub DOCX w panelu po lewej.
      </EmptyState>
    );
  }

  if (analysis.status === "loading") {
    return (
      <EmptyState busy title="AI analizuje CV…">
        Zwykle trwa to 5–20 sekund.
      </EmptyState>
    );
  }

  if (analysis.status === "error") {
    return (
      <EmptyState
        tone="error"
        title="Analiza się nie udała"
        action={<Button onClick={startAnalysis}>Spróbuj ponownie</Button>}
      >
        {analysis.error.message}
      </EmptyState>
    );
  }

  if (analysis.status !== "done") {
    return (
      <EmptyState
        title="CV nie jest jeszcze przeanalizowane"
        action={<Button onClick={startAnalysis}>Analizuj CV</Button>}
      >
        Kliknij, aby AI oceniło treść i strukturę CV.
      </EmptyState>
    );
  }

  return children(analysis.result);
}
