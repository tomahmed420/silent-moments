import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getJournalEntry } from "@/lib/public.functions";
import { useSettings } from "@/components/settings-provider";

const q = (slug: string) =>
  queryOptions({
    queryKey: ["journal", slug],
    queryFn: () => getJournalEntry({ data: { slug } }),
  });

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ context, params }) => {
    const e = await context.queryClient.ensureQueryData(q(params.slug));
    if (!e) throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: "ডায়েরি — নীরবতার ডায়েরি" },
      { property: "og:url", content: `/journal/${params.slug}` },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: `/journal/${params.slug}` }],
  }),
  component: JournalEntryPage,
});

function JournalEntryPage() {
  const t = useSettings();
  const { slug } = Route.useParams();
  const { data: entry } = useSuspenseQuery(q(slug));
  if (!entry) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Link
          to="/journal"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t.nav.journal}
        </Link>
        <div className="mt-6 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {new Date(entry.published_at).toLocaleDateString("bn-BD")}
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
          {entry.title}
        </h1>
        {entry.cover_url ? (
          <img
            src={entry.cover_url}
            alt={entry.title}
            loading="lazy"
            className="mt-8 w-full rounded-2xl border border-border object-cover"
          />
        ) : null}
        <div
          className="mt-8 whitespace-pre-line text-base leading-[1.85] text-foreground/90"
          style={{ fontFamily: "var(--font-serif-bn)" }}
        >
          {entry.body}
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
