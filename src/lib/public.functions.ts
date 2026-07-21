import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export function publicClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("categories")
    .select("id, slug, name_bn, name_en, icon, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
});

const videoSelect =
  "id, title, description, youtube_id, youtube_url, telegram_url, thumbnail_url, duration, is_featured, published_at, category_id, categories(slug, name_bn, name_en)";

export const listVideos = createServerFn({ method: "GET" })
  .validator((d: unknown) =>
    z
      .object({
        categorySlug: z.string().optional(),
        search: z.string().optional(),
        featured: z.boolean().optional(),
        limit: z.number().int().min(1).max(60).optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("videos").select(videoSelect).order("published_at", { ascending: false });
    if (data.featured) q = q.eq("is_featured", true);
    if (data.limit) q = q.limit(data.limit);
    if (data.search) {
      const cleanSearch = data.search.replace(/[%,.()"\\]/g, "").trim();
      if (cleanSearch) {
        q = q.or(`title.ilike.%${cleanSearch}%,description.ilike.%${cleanSearch}%`);
      }
    }
    if (data.categorySlug) {
      const { data: cat } = await sb
        .from("categories")
        .select("id")
        .eq("slug", data.categorySlug)
        .maybeSingle();
      if (cat) q = q.eq("category_id", cat.id);
      else return [];
    }
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getVideo = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("videos")
      .select(videoSelect)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;

    let related: (typeof row)[] = [];
    if (row.category_id) {
      const { data: rel } = await sb
        .from("videos")
        .select(videoSelect)
        .eq("category_id", row.category_id)
        .neq("id", row.id)
        .order("published_at", { ascending: false })
        .limit(4);
      related = rel ?? [];
    }
    return { video: row, related };
  });

export const listJournal = createServerFn({ method: "GET" })
  .validator((d: unknown) =>
    z.object({ limit: z.number().int().min(1).max(60).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("journal_entries")
      .select("id, slug, title, body, cover_url, published_at")
      .neq("slug", "_site_settings")
      .order("published_at", { ascending: false });
    if (data.limit) q = q.limit(data.limit);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getTelegramMediaUrl = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ url: z.string() }).parse(d))
  .handler(async ({ data }) => {
    try {
      const urlObj = new URL(data.url);
      if (urlObj.hostname !== "t.me" && urlObj.hostname !== "www.t.me") {
        return null;
      }
      
      const targetUrl = data.url.includes("?")
        ? data.url.replace(/\?.*/, "?embed=1")
        : `${data.url}?embed=1`;
      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      const html = await res.text();
      // Look for MP4 or OGG audio in the telegram embed HTML
      const match = html.match(/src="([^"]*\.mp4[^"]*)"/) || html.match(/src="([^"]*\.ogg[^"]*)"/);
      if (match) return match[1];
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  });

export const getJournalEntry = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("journal_entries")
      .select("id, slug, title, body, cover_url, published_at")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });
