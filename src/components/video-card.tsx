import { Link } from "@tanstack/react-router";
import { Play, Music, Video } from "lucide-react";
import { youtubeThumb } from "@/lib/youtube";

type VideoLike = {
  id: string;
  title: string;
  youtube_id: string;
  duration?: string | null;
  thumbnail_url?: string | null;
  categories?: { slug: string; name_bn: string; name_en: string } | null;
};

export function VideoCard({ video }: { video: VideoLike }) {
  const isAudio = video.youtube_id === "AUDIO_LINK" || video.youtube_id === "TELEGRAM_AUDIO";
  const isTelegram = video.youtube_id === "TELEGRAM_LINK";
  const isNoThumbType = isAudio || isTelegram;
  const thumb = video.thumbnail_url || (isNoThumbType ? null : youtubeThumb(video.youtube_id));

  return (
    <Link
      to="/video/$id"
      params={{ id: video.id }}
      className="group block overflow-hidden rounded-2xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:soft-shadow"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary/40 transition-transform duration-500 group-hover:scale-105">
            {isAudio ? <Music className="h-10 w-10" /> : <Video className="h-10 w-10" />}
          </div>
        )}
        <div className="absolute inset-0 grid place-items-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
          <div className="grid h-12 w-12 translate-y-2 place-items-center rounded-full bg-background/90 text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Play className="h-5 w-5 fill-current" />
          </div>
        </div>
        {video.duration ? (
          <span className="absolute bottom-2 right-2 rounded-md bg-foreground/80 px-1.5 py-0.5 text-[10px] font-medium text-background">
            {video.duration}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        {video.categories ? (
          <div className="text-[11px] uppercase tracking-[0.14em] text-primary/70">
            {video.categories.name_bn}
          </div>
        ) : null}
        <h3 className="mt-1 line-clamp-2 font-display text-[15px] font-medium leading-snug text-foreground">
          {video.title}
        </h3>
      </div>
    </Link>
  );
}
