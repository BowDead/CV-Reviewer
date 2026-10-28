import { PageHeader } from "@/shared/ui/PageHeader";
import { CvImprovements } from "@/features/cv-analysis";
import { useWorkspace } from "./useWorkspace";
import { AnalysisGate } from "./AnalysisGate";

export function ImprovementsTab() {
  const workspace = useWorkspace();

  return (
    <>
      <PageHeader
        title="Poprawki"
        description="Konkretne kroki i propozycje przeredagowania zdań."
      />
      <AnalysisGate {...workspace}>
        {(result) => <CvImprovements analysis={result.analysis} />}
      </AnalysisGate>
    </>
  );
}
