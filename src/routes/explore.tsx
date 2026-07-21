import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VideoCard } from "@/components/video-card";
import { listCategories, listVideos } from "@/lib/public.functions";
import { useSettings } from "@/components/settings-provider";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "প্রকৃতি দেখুন — নীরবতার ডায়েরি" },
      { name: "description", content: "সব প্রকৃতির ভিডিও খুঁজুন এবং বিভাগ অনুযায়ী দেখুন।" },
      { property: "og:url", content: "/explore" },
    ],
    links: [{ rel: "canonical", href: "/explore" }],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const t = useSettings();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });
  const { data: videos = [], isLoading } = useQuery({
    queryKey: ["videos", "explore", search, cat],
    queryFn: () =>
      listVideos({
        data: {
          search: search || undefined,
          categorySlug: cat || undefined,
        },
      }),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{t.nav.explore}</h1>
          <p className="mt-3 text-muted-foreground">{t.tagline}</p>
        </div>

        <div className="mx-auto mt-8 max-w-xl">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search.placeholder}
              className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setCat(null)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition",
              cat === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {t.search.filterAll}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.slug)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs transition",
                cat === c.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {c.name_bn}
            </button>
          ))}
        </div>

        <div className="mt-12">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-video animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
              {search || cat ? t.search.noResults : t.empty.videos}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
