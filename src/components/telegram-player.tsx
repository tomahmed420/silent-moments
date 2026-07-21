import { useQuery } from "@tanstack/react-query";
import { getTelegramMediaUrl } from "@/lib/public.functions";

export function TelegramPlayer({ url, isAudio }: { url: string; isAudio?: boolean }) {
  const { data: mediaUrl, isLoading } = useQuery({
    queryKey: ["telegram-media", url],
    queryFn: () => getTelegramMediaUrl({ data: { url } }),
  });

  if (isLoading) {
    return (
      <div
        className={`w-full flex items-center justify-center bg-black/5 animate-pulse ${isAudio ? "h-[120px]" : "aspect-video"}`}
      >
        <span className="text-muted-foreground text-sm">লোড হচ্ছে...</span>
      </div>
    );
  }

  if (!mediaUrl) {
    return (
      <div
        className={`w-full flex items-center justify-center bg-black/5 ${isAudio ? "h-[120px]" : "aspect-video"}`}
      >
        <span className="text-muted-foreground text-sm">মিডিয়া লোড করা সম্ভব হয়নি</span>
      </div>
    );
  }

  if (isAudio || mediaUrl.includes(".ogg")) {
    return (
      <div className="flex h-40 w-full items-center justify-center bg-card p-6">
        <audio controls src={mediaUrl} className="w-full max-w-md" />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden">
      <video
        src={mediaUrl}
        controls
        className="w-full h-full object-contain"
        autoPlay
        playsInline
      />
    </div>
  );
}
