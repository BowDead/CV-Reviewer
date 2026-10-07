import { ApiStatus } from "@/features/health";

export function HomePage() {
  return (
    <section>
      <h1>AI Assisted CV Reviewer</h1>
      <p>
        Wgraj CV, aby otrzymać ocenę AI, kontrolę ATS i dopasowane oferty pracy.
      </p>
      <ApiStatus />
    </section>
  );
}
