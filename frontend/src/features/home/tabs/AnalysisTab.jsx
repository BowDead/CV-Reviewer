import { PageHeader } from "@/shared/ui/PageHeader";
import { CvAnalysisResult } from "@/features/cv-analysis";
import { useWorkspace } from "./useWorkspace";
import { AnalysisGate } from "./AnalysisGate";

export function AnalysisTab() {
  const workspace = useWorkspace();

  return (
    <>
      <PageHeader
        title="Analiza AI"
        description="Ocena treści i struktury CV oraz dopasowane stanowiska."
      />
      <AnalysisGate {...workspace}>
        {(result) => <CvAnalysisResult result={result} />}
      </AnalysisGate>
    </>
  );
}
