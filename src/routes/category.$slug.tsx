import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VideoCard } from "@/components/video-card";
import { listCategories, listVideos } from "@/lib/public.functions";
import { useSettings } from "@/components/settings-provider";

const catsQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — নীরবতার ডায়েরি` },
      { property: "og:url", content: `/category/${params.slug}` },
    ],
    links: [{ rel: "canonical", href: `/category/${params.slug}` }],
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(catsQuery);
    await context.queryClient.ensureQueryData({
      queryKey: ["videos", "category", params.slug],
      queryFn: () => listVideos({ data: { categorySlug: params.slug } }),
    });
  },
  component: CategoryPage,
});

function CategoryPage() {
  const t = useSettings();
  const { slug } = Route.useParams();
  const { data: categories } = useSuspenseQuery(catsQuery);
  const { data: videos } = useSuspenseQuery({
    queryKey: ["videos", "category", slug],
    queryFn: () => listVideos({ data: { categorySlug: slug } }),
  });
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) throw notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t.nav.explore}
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{cat.name_bn}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{cat.name_en}</p>

        <div className="mt-10">
          {videos.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
              {t.empty.videos}
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
