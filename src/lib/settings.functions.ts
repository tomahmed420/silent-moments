import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { publicClient } from "@/lib/public.functions";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SITE_SETTINGS_SLUG = "_site_settings";

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("journal_entries")
    .select("body")
    .eq("slug", SITE_SETTINGS_SLUG)
    .maybeSingle();

  if (data?.body) {
    try {
      return JSON.parse(data.body);
    } catch (e) {
      return null;
    }
  }
  return null;
});

export const updateSiteSettings = createServerFn({ method: "POST" })
  .validator((d: unknown) => z.object({ settings: z.any() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Check admin
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      throw new Error("Forbidden: admin only");
    }

    const jsonString = JSON.stringify(data.settings);

    // Check if entry exists
    const { data: existing } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("slug", SITE_SETTINGS_SLUG)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("journal_entries")
        .update({ body: jsonString, updated_at: new Date().toISOString() })
        .eq("slug", SITE_SETTINGS_SLUG);
    } else {
      await supabase.from("journal_entries").insert({
        slug: SITE_SETTINGS_SLUG,
        title: "Site Settings (System)",
        body: jsonString,
      });
    }

    return { success: true };
  });
