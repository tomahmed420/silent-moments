import { useEffect, useRef } from "react";

export function TelegramEmbed({ url, isAudio }: { url: string; isAudio?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const match = url.match(/t\.me\/(.+)$/);
    if (!match) return;
    const postId = match[1].replace(/\?.*$/, "");

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-post", postId);
    script.setAttribute("data-width", "100%");
    script.setAttribute("data-dark", "1");

    // Watch for the iframe being added so we can add allowFullScreen to it
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === "IFRAME") {
            const iframe = node as HTMLIFrameElement;
            iframe.setAttribute(
              "allow",
              "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
            );
            iframe.setAttribute("allowfullscreen", "true");
          }
        });
      });
    });

    observer.observe(containerRef.current, { childList: true });

    containerRef.current.appendChild(script);

    return () => observer.disconnect();
  }, [url]);

  return (
    <div className={`w-full bg-black flex justify-center ${isAudio ? "py-8 px-4" : ""}`}>
      <div
        ref={containerRef}
        className="w-full max-w-3xl min-h-[150px] flex justify-center telegram-widget-container"
      />
    </div>
  );
}
