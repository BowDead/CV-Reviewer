import { Outlet, useNavigate } from "react-router";
import { AppLayout } from "@/shared/layout/AppLayout";
import { SidebarNav } from "@/shared/layout/SidebarNav";
import { ApiStatus } from "@/features/health";
import { CvUploadPanel, useCvUpload } from "@/features/cv-upload";
import { CvAnalysisControls, useCvAnalysis } from "@/features/cv-analysis";
import styles from "./WorkspacePage.module.scss";

export function WorkspacePage() {
  const cv = useCvUpload();
  const analysis = useCvAnalysis();
  const navigate = useNavigate();

  const cvText = cv.status === "done" ? cv.result.text : null;
  const isCurrent = cvText !== null && analysis.analyzedText === cvText;
  const currentAnalysis = {
    status: isCurrent ? analysis.status : "idle",
    result: isCurrent ? analysis.result : null,
    error: isCurrent ? analysis.error : null,
  };

  function startAnalysis() {
    if (!cvText) return;
    analysis.analyze(cvText);
    navigate("/analysis");
  }

  const rewritesCount = currentAnalysis.result?.analysis.rewrites.length ?? 0;

  const navItems = [
    { to: "/cv", label: "Podgląd CV" },
    { to: "/analysis", label: "Analiza" },
    { to: "/improvements", label: "Poprawki", badge: rewritesCount || null },
    { to: "/profile", label: "Profil" },
  ];

  return (
    <AppLayout
      sidebar={
        <>
          <section className={styles.block}>
            <h2 className={styles.label}>Twoje CV</h2>
            <CvUploadPanel cv={cv} />
            <CvAnalysisControls
              status={currentAnalysis.status}
              disabled={!cvText}
              onAnalyze={startAnalysis}
            />
          </section>

          <SidebarNav title="Widok" items={navItems} />
        </>
      }
      footer={<ApiStatus />}
    >
      <Outlet context={{ cv, analysis: currentAnalysis, startAnalysis }} />
    </AppLayout>
  );
}
