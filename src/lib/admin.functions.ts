import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: unknown; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) return { isAdmin: false };
    return { isAdmin: !!data };
  });

const videoInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  youtube_url: z.string().url(),
  youtube_id: z.string().min(5),
  telegram_url: z.string().url().optional().nullable().or(z.literal("")),
  category_id: z.string().uuid().optional().nullable(),
  thumbnail_url: z.string().url().optional().nullable().or(z.literal("")),
  duration: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
});

export const upsertVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => videoInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let fetchedThumbnail = data.thumbnail_url;
    let finalYoutubeId = data.youtube_id;

    let isTelegramUrl = false;
    if (data.youtube_url) {
      try {
        const u = new URL(data.youtube_url);
        isTelegramUrl = u.hostname === "t.me" || u.hostname === "www.t.me";
      } catch (e) {}
    }

    if (isTelegramUrl) {
      try {
        const targetUrl = data.youtube_url.includes("?") 
          ? data.youtube_url.replace(/\?.*/, "?embed=1") 
          : `${data.youtube_url}?embed=1`;
        const res = await fetch(targetUrl);
        if (res.ok) {
          const html = await res.text();

          if (
            html.includes("tgme_widget_message_voice") ||
            html.includes("tgme_widget_message_document_icon_audio") ||
            html.includes("<audio")
          ) {
            finalYoutubeId = "TELEGRAM_AUDIO";
          }

          if (!fetchedThumbnail) {
            const ogMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)">/i);
            if (ogMatch && ogMatch[1]) {
              fetchedThumbnail = ogMatch[1];
            } else {
              const bgMatch = html.match(/background-image:url\('([^']+)'\)/i);
              if (bgMatch && bgMatch[1]) fetchedThumbnail = bgMatch[1];
            }
          }
        }
      } catch (e) {
        // ignore fetch errors
      }
    }

    const row = {
      title: data.title,
      description: data.description || null,
      youtube_url: data.youtube_url,
      youtube_id: finalYoutubeId,
      telegram_url: data.telegram_url || null,
      category_id: data.category_id || null,
      thumbnail_url: fetchedThumbnail || null,
      duration: data.duration || null,
      is_featured: !!data.is_featured,
    };
    if (data.id) {
      const { error } = await context.supabase.from("videos").update(row).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: ins, error } = await context.supabase
      .from("videos")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const deleteVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("videos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const journalInput = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, dashes only"),
  title: z.string().min(1),
  body: z.string().min(1),
  cover_url: z.string().url().optional().nullable().or(z.literal("")),
});

export const upsertJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => journalInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const row = {
      slug: data.slug,
      title: data.title,
      body: data.body,
      cover_url: data.cover_url || null,
    };
    if (data.id) {
      const { error } = await context.supabase
        .from("journal_entries")
        .update(row)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: ins, error } = await context.supabase
      .from("journal_entries")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: ins.id };
  });

export const deleteJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("journal_entries").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
