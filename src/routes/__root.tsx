import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/500.css";
import "@fontsource/hind-siliguri/600.css";
import "@fontsource/hind-siliguri/700.css";
import "@fontsource/tiro-bangla/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { GlobalToaster } from "@/components/global-toaster";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl">🍃</div>
        <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">
          পাতা খুঁজে পাওয়া যায়নি
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে নেওয়া হয়েছে।
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-xl font-semibold text-foreground">পেজটি লোড হয়নি</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            আবার চেষ্টা
          </button>
          <a
            href="/"
            className="rounded-full border border-input bg-background px-5 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            হোম
          </a>
        </div>
      </div>
    </div>
  );
}

import { SettingsProvider } from "@/components/settings-provider";
import { getSiteSettings } from "@/lib/settings.functions";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ["site-settings"],
      queryFn: () => getSiteSettings(),
    });
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "নীরবতার ডায়েরি — শান্ত প্রকৃতির মুহূর্তগুলোর সংগ্রহ" },
      {
        name: "description",
        content:
          "নীরবতার ডায়েরি — ভোরের কুয়াশা, পাখির ডাক, বৃষ্টি, নদী ও গ্রামীণ জীবনের শান্ত মুহূর্তগুলোর একটি ব্যক্তিগত প্রকৃতি আর্কাইভ।",
      },
      { name: "theme-color", content: "#2f5d3a" },
      { property: "og:site_name", content: "নীরবতার ডায়েরি" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "নীরবতার ডায়েরি" },
      {
        property: "og:description",
        content: "শান্ত প্রকৃতির মুহূর্তগুলোর ব্যক্তিগত সংগ্রহ।",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "নীরবতার ডায়েরি",
          alternateName: "Nirobotar Diary",
          description: "A personal collection of peaceful nature moments.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <Outlet />
      </SettingsProvider>
      <GlobalToaster />
    </QueryClientProvider>
  );
}
