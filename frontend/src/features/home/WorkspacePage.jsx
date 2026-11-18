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
import { GithubAnalysisToggle, GithubProvider } from "@/features/github";
import styles from "./WorkspacePage.module.scss";

export function WorkspacePage({ actions }) {
  const { t } = useTranslation();
  const cv = useCvUpload();
  const review = useAnonymizationReview(cv);
  const analysis = useCvAnalysis();
  const navigate = useNavigate();
  const [analyzedCv, setAnalyzedCv] = useState(null);
  const [includeGithub, setIncludeGithub] = useState(true);

  const cvText = review.text;
  const isCurrent = cv.status === "done" && analyzedCv === cv.result;
  const savedAnalysis = cv.savedAnalysis;
  const currentAnalysis = isCurrent
    ? {
        status: analysis.status,
        result: analysis.result,
        error: analysis.error,
      }
    : {
        status: savedAnalysis ? "done" : "idle",
        result: savedAnalysis,
        error: null,
      };
  const changedAfterAnalysis = isCurrent
    ? currentAnalysis.status === "done" && analysis.analyzedText !== cvText
    : savedAnalysis !== null && review.edited;

  function startAnalysis() {
    if (!cvText) return;
    setAnalyzedCv(cv.result);
    analysis.analyze(cvText, {
      cvId: cv.savedCvId,
      useGithub: includeGithub,
    });

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
    { to: "/offers", label: t("workspace.nav.offers") },
    { to: "/files", label: t("workspace.nav.files") },
    { to: "/keys", label: t("workspace.nav.keys") },
    { to: "/github", label: t("workspace.nav.github") },
  ];

  return (
    <GithubProvider>
      <AppLayout
        sidebar={
          <>
            <section className={styles.block}>
              <h2 className={styles.label}>{t("workspace.yourCv")}</h2>
              <CvUploadPanel cv={cv} />
              <GithubAnalysisToggle
                enabled={includeGithub}
                onChange={setIncludeGithub}
              />
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
    </GithubProvider>
  );
}
