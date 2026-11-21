import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CvCreator } from "@/features/cv-creator";
import { useWorkspace } from "./useWorkspace";

export function CreatorTab() {
  const { t } = useTranslation();
  const { cv } = useWorkspace();
  const navigate = useNavigate();

  function handleSaved(saved) {
    cv.loadSaved(saved);
    navigate("/cv");
  }

  return (
    <>
      <PageHeader title={t("workspace.creator.title")} />
      <CvCreator onSaved={handleSaved} />
    </>
  );
}
