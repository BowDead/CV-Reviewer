import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useNavigate } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import { SidebarNav } from "@/shared/layout/SidebarNav";
import { ApiStatus } from "@/features/health";
import {
  CvUploadPanel,
  useAnonymizationReview,
  useCvUpload,
} from "@/features/cv-upload";
import { CvAnalysisControls, useCvAnalysis } from "@/features/cv-analysis";
import styles from "./WorkspacePage.module.scss";

export function WorkspacePage({ actions }) {
  const { t } = useTranslation();
  const cv = useCvUpload();
  const review = useAnonymizationReview(cv);
  const analysis = useCvAnalysis();
  const navigate = useNavigate();
  const [analyzedCv, setAnalyzedCv] = useState(null);

  const cvText = review.text;
  const isCurrent = cv.status === "done" && analyzedCv === cv.result;
  const currentAnalysis = {
    status: isCurrent ? analysis.status : "idle",
    result: isCurrent ? analysis.result : null,
    error: isCurrent ? analysis.error : null,
  };
  const changedAfterAnalysis =
    currentAnalysis.status === "done" && analysis.analyzedText !== cvText;

  function startAnalysis() {
    if (!cvText) return;
    setAnalyzedCv(cv.result);
    analysis.analyze(cvText);
    navigate("/analysis");
  }

  const rewritesCount = currentAnalysis.result?.analysis.rewrites.length ?? 0;

  const navItems = [
    { to: "/cv", label: t("workspace.nav.preview") },
    { to: "/analysis", label: t("workspace.nav.analysis") },
    {
      to: "/improvements",
      label: t("workspace.nav.improvements"),
      badge: rewritesCount || null,
    },
    { to: "/profile", label: t("workspace.nav.profile") },
    { to: "/keys", label: t("workspace.nav.keys") },
  ];

  return (
    <AppLayout
      sidebar={
        <>
          <section className={styles.block}>
            <h2 className={styles.label}>{t("workspace.yourCv")}</h2>
            <CvUploadPanel cv={cv} />
            <CvAnalysisControls
              status={currentAnalysis.status}
              disabled={!cvText}
              onAnalyze={startAnalysis}
            />
          </section>

          <SidebarNav title={t("workspace.navTitle")} items={navItems} />
        </>
      }
      footer={
        <>
          {actions}
          <ApiStatus />
        </>
      }
    >
      <Outlet
        context={{
          cv,
          review,
          changedAfterAnalysis,
          analysis: currentAnalysis,
          startAnalysis,
        }}
      />
    </AppLayout>
  );
}
