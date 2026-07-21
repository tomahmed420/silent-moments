import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";
import { useSettings } from "@/components/settings-provider";
import { cn } from "@/lib/utils";
import { LogOut, Film, BookText, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const t = useSettings();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const check = useServerFn(checkIsAdmin);
  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => check(),
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        লোড হচ্ছে…
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl font-semibold">{t.admin.noAccess}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            অ্যাডমিন হিসেবে অ্যাক্সেস পেতে প্রজেক্টের মালিকের সাথে যোগাযোগ করুন।
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <Link
              to="/"
              className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
            >
              হোম
            </Link>
            <button
              onClick={signOut}
              className="rounded-full border border-border px-5 py-2 text-sm"
            >
              {t.nav.signOut}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/admin", label: t.admin.videos, icon: Film, exact: true },
    { to: "/admin/journal", label: t.admin.journal, icon: BookText, exact: false },
    { to: "/admin/settings", label: t.admin.settings, icon: SettingsIcon, exact: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="font-display text-lg font-semibold">
            {t.siteName} <span className="text-xs text-muted-foreground">· admin</span>
          </Link>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted"
          >
            <LogOut className="h-3.5 w-3.5" /> {t.nav.signOut}
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
          {tabs.map((tab) => {
            const active = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={cn(
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm transition",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
              </Link>
            );
          })}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
