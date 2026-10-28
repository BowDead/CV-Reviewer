import { PageHeader } from "@/shared/ui/PageHeader";
import { ProfileSummary } from "@/features/cv-analysis";
import { useWorkspace } from "./useWorkspace";
import { AnalysisGate } from "./AnalysisGate";

export function ProfileTab() {
  const workspace = useWorkspace();

  return (
    <>
      <PageHeader title="Profil" description="Dane, które AI odczytało z CV." />
      <AnalysisGate {...workspace}>
        {(result) => <ProfileSummary profile={result.analysis.profile} />}
      </AnalysisGate>
    </>
  );
}
