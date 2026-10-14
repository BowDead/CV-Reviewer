import { ApiStatus } from "@/features/health";
import { CvUploadPanel, useCvUpload } from "@/features/cv-upload";

export function HomePage() {
  const cv = useCvUpload();

  return (
    <section>
      <h1>AI Assisted CV Reviewer</h1>
      <p>
        Wgraj CV, aby otrzymać ocenę AI, kontrolę ATS i dopasowane oferty pracy.
      </p>
      <ApiStatus />

      <CvUploadPanel cv={cv} />
    </section>
  );
}
