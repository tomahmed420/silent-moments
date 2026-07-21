import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VideoCard } from "@/components/video-card";
import { CategoryCard } from "@/components/category-card";
import { listCategories, listVideos, listJournal } from "@/lib/public.functions";
import { useSettings } from "@/components/settings-provider";
import heroImg from "@/assets/hero-nature.jpg";

const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});
const featuredQuery = queryOptions({
  queryKey: ["videos", "featured"],
  queryFn: () => listVideos({ data: { featured: true, limit: 6 } }),
});
const latestQuery = queryOptions({
  queryKey: ["videos", "latest"],
  queryFn: () => listVideos({ data: { limit: 8 } }),
});
const journalQuery = queryOptions({
  queryKey: ["journal", "preview"],
  queryFn: () => listJournal({ data: { limit: 3 } }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "নীরবতার ডায়েরি — শান্ত প্রকৃতির ব্যক্তিগত সংগ্রহ" },
      {
        name: "description",
        content:
          "ভোরের কুয়াশা, পাখির ডাক, বৃষ্টি, নদী ও গ্রামীণ জীবনের শান্ত মুহূর্ত — সব এক জায়গায়।",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(featuredQuery);
    context.queryClient.ensureQueryData(latestQuery);
    context.queryClient.ensureQueryData(journalQuery);
  },
  component: Home,
});

function Home() {
  const t = useSettings();
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: featured } = useSuspenseQuery(featuredQuery);
  const { data: latest } = useSuspenseQuery(latestQuery);
  const { data: journal } = useSuspenseQuery(journalQuery);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={t.heroImage || heroImg}
            alt=""
            className="h-full w-full object-cover"
            width={1920}
            height={1280}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-36 md:py-44">
          <div className="fade-in-up">
            <div className="text-xs uppercase tracking-[0.3em] text-primary">
              · Nirobotar Diary ·
            </div>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
              {t.siteName}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              {t.taglineLong}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                {t.cta.explore} <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-6 py-3 text-sm font-medium text-foreground backdrop-blur hover:bg-background"
              >
                <Send className="h-4 w-4" /> {t.cta.telegram}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <Section title={t.sections.featured} viewAllTo="/explore">
        {featured.length === 0 ? (
          <EmptyHint text={t.empty.videos} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </Section>

      {/* Categories */}
      <Section title={t.sections.categories}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <CategoryCard key={c.id} {...c} />
          ))}
        </div>
      </Section>

      {/* Latest */}
      <Section title={t.sections.latest} viewAllTo="/explore">
        {latest.length === 0 ? (
          <EmptyHint text={t.empty.videos} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </Section>

      {/* Journal preview */}
      <Section title={t.sections.journal} viewAllTo="/journal">
        {journal.length === 0 ? (
          <EmptyHint text={t.empty.journal} />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {journal.map((j) => (
              <Link
                key={j.id}
                to="/journal/$slug"
                params={{ slug: j.slug }}
                className="group rounded-2xl border border-border/60 bg-card p-6 transition hover:-translate-y-0.5 hover:border-primary/30 hover:soft-shadow"
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {new Date(j.published_at).toLocaleDateString("bn-BD")}
                </div>
                <h3 className="mt-2 font-display text-lg font-medium text-foreground group-hover:text-primary">
                  {j.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {j.body}
                </p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* About */}
      <section className="border-y border-border/60 bg-muted/30 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="text-xs uppercase tracking-[0.3em] text-primary">{t.sections.about}</div>
          <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
            {t.about.heading}
          </h2>
          <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {t.about.body}
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Section({
  title,
  children,
  viewAllTo,
}: {
  title: string;
  children: React.ReactNode;
  viewAllTo?: string;
}) {
  const t = useSettings();
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
        {viewAllTo ? (
          <Link
            to={viewAllTo}
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t.cta.viewAll} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ text }: { text: string }) {
  const t = useSettings();
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
