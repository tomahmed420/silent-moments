import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useSettings } from "@/components/settings-provider";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "আমাদের কথা — নীরবতার ডায়েরি" },
      {
        name: "description",
        content:
          "নীরবতার ডায়েরি কী, কেন এবং কীভাবে — প্রকৃতির শান্ত মুহূর্ত সংরক্ষণের একটি ব্যক্তিগত উদ্যোগ।",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const t = useSettings();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">About</div>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            {t.about.heading}
          </h1>
        </div>
        <div
          className="mt-10 whitespace-pre-line text-base leading-[1.85] text-foreground/90"
          style={{ fontFamily: "var(--font-serif-bn)" }}
        >
          {t.about.body}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-muted/30 p-6">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            কপিরাইট
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">{t.footer.copyright}</p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
