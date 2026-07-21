import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VideoCard } from "@/components/video-card";
import { getVideo } from "@/lib/public.functions";
import { youtubeEmbed } from "@/lib/youtube";
import { useSettings } from "@/components/settings-provider";

import { TelegramPlayer } from "@/components/telegram-player";

const videoQuery = (id: string) =>
  queryOptions({
    queryKey: ["video", id],
    queryFn: () => getVideo({ data: { id } }),
  });

export const Route = createFileRoute("/video/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(videoQuery(params.id));
    if (!data) throw notFound();
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: "ভিডিও — নীরবতার ডায়েরি" },
      { property: "og:url", content: `/video/${params.id}` },
      { property: "og:type", content: "video.other" },
    ],
    links: [{ rel: "canonical", href: `/video/${params.id}` }],
  }),
  component: VideoPage,
});

function VideoPage() {
  const t = useSettings();
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(videoQuery(id));

  if (!data) return null;
  const { video, related } = data;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t.nav.explore}
        </Link>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-black soft-shadow">
          {video.youtube_id === "TELEGRAM_LINK" || video.youtube_id === "TELEGRAM_AUDIO" ? (
            video.youtube_url.includes("/c/") ? (
              <div className="flex flex-col h-48 w-full items-center justify-center bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  এটি একটি প্রাইভেট টেলিগ্রাম চ্যানেলের লিংক। টেলিগ্রামের নিয়ম অনুযায়ী প্রাইভেট
                  চ্যানেলের পোস্ট ওয়েবসাইটের ভেতরে এম্বেড করে বাজানো সম্ভব নয়।
                </p>
                <a
                  href={video.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0088cc] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  <Send className="h-4 w-4" /> টেলিগ্রাম অ্যাপে খুলুন
                </a>
              </div>
            ) : (
              <TelegramPlayer
                url={video.youtube_url}
                isAudio={video.youtube_id === "TELEGRAM_AUDIO"}
              />
            )
          ) : video.youtube_id === "AUDIO_LINK" ? (
            <div className="flex h-40 w-full items-center justify-center bg-card p-6">
              <audio controls src={video.youtube_url} className="w-full max-w-md" />
            </div>
          ) : (
            <div className="aspect-video">
              <iframe
                src={youtubeEmbed(video.youtube_id)}
                title={video.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          {video.categories ? (
            <Link
              to="/category/$slug"
              params={{ slug: video.categories.slug }}
              className="text-xs uppercase tracking-[0.18em] text-primary hover:underline"
            >
              {video.categories.name_bn}
            </Link>
          ) : null}
          <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{video.title}</h1>
          {video.description ? (
            <div className="mt-6">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t.sections.description}
              </div>
              <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-foreground/90">
                {video.description}
              </p>
            </div>
          ) : null}

          {video.telegram_url ? (
            <a
              href={video.telegram_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Send className="h-4 w-4" /> {t.cta.openTelegram}
            </a>
          ) : null}
        </div>

        {related.length > 0 ? (
          <div className="mt-16">
            <h2 className="font-display text-xl font-semibold">{t.sections.related}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <SiteFooter />
    </div>
  );
}
