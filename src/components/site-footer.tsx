import { Link } from "@tanstack/react-router";
import { Send, Youtube } from "lucide-react";
import { useSettings } from "@/components/settings-provider";

export function SiteFooter() {
  const t = useSettings();
  return (
    <footer className="mt-20 border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="font-display text-lg font-semibold">{t.siteName}</div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t.tagline}</p>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t.nav.categories}
          </div>
          <div className="mt-3 grid gap-2 text-sm">
            <Link to="/explore" className="text-foreground hover:text-primary">
              {t.nav.explore}
            </Link>
            <Link to="/journal" className="text-foreground hover:text-primary">
              {t.nav.journal}
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary">
              {t.nav.about}
            </Link>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            যুক্ত হোন
          </div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <a
              href="https://t.me/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Send className="h-4 w-4" /> {t.footer.telegram}
            </a>
            <a
              href="https://youtube.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary"
            >
              <Youtube className="h-4 w-4" /> {t.footer.youtube}
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-xs leading-relaxed text-muted-foreground">{t.footer.copyright}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t.footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
