import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { listJournal } from "@/lib/public.functions";
import { useSettings } from "@/components/settings-provider";

const q = queryOptions({
  queryKey: ["journal", "all"],
  queryFn: () => listJournal({ data: {} }),
});

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "ডায়েরি — নীরবতার ডায়েরি" },
      { name: "description", content: "প্রকৃতি নিয়ে ব্যক্তিগত নোট ও পর্যবেক্ষণ।" },
      { property: "og:url", content: "/journal" },
    ],
    links: [{ rel: "canonical", href: "/journal" }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(q),
  component: JournalPage,
});

function JournalPage() {
  const t = useSettings();
  const { data: entries } = useSuspenseQuery(q);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">Journal</div>
          <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            {t.sections.journal}
          </h1>
          <p className="mt-3 text-muted-foreground">প্রকৃতি নিয়ে ব্যক্তিগত নোট ও পর্যবেক্ষণ।</p>
        </div>

        <div className="mt-12 space-y-6">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
              {t.empty.journal}
            </div>
          ) : (
            entries.map((j) => (
              <Link
                key={j.id}
                to="/journal/$slug"
                params={{ slug: j.slug }}
                className="block rounded-2xl border border-border/60 bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:soft-shadow"
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {new Date(j.published_at).toLocaleDateString("bn-BD")}
                </div>
                <h2 className="mt-2 font-display text-xl font-medium text-foreground">{j.title}</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {j.body}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
