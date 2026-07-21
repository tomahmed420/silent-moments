# নীরবতার ডায়েরি — Plan

A peaceful, Bengali-first nature archive that embeds YouTube videos and links to Telegram. Backed by Lovable Cloud so you can add content from a real admin panel later.

## Design direction

- **Palette**: Forest Green `#2F5D3A`, Sage `#A8C5A3`, Sky Blue `#BCD9EA`, Warm White `#FAF8F3`, Soft Gray `#E8E6E1`, Ink `#1F2A24`. Full dark mode with deep forest/charcoal surfaces.
- **Typography**: Bengali headings in **Hind Siliguri** (or Noto Serif Bengali for hero), body in **Tiro Bangla**; English fallback **Inter**. Generous line-height, large white space.
- **Feel**: minimal, slow, mindful. Soft fade-ins on scroll, gentle hover lifts, smooth page transitions. No loud gradients.
- **Hero**: AI-generated misty forest/dawn still image as background + a softly looping muted YouTube embed slot (placeholder until you add a URL). Bengali title overlay with subtitle.

## Pages & routes

```
/                        Home (hero, featured, categories, latest, journal preview, about, footer)
/explore                 All videos with search + category filter
/category/$slug          Filtered listing per nature category
/video/$id               Video page: large YouTube embed, description, Telegram link, related
/journal                 Nature Journal list
/journal/$slug           Single journal entry
/about                   Purpose & copyright
/auth                    Sign-in (email/password + Google) — admin only
/_authenticated/admin    Admin dashboard
  ├ /videos              List, add, edit, delete videos
  └ /journal             List, add, edit, delete journal entries
```

Each route gets its own SEO `head()` with Bengali title/description and og tags.

## Backend (Lovable Cloud)

Tables (with GRANTs + RLS):

- `categories` — slug, name_bn, name_en, icon, sort_order. Public read.
- `videos` — title, description, youtube_url, youtube_id, telegram_url, category_id, thumbnail_url, duration, published_at. Public read; admin write.
- `journal_entries` — slug, title, body, cover_url, published_at. Public read; admin write.
- `user_roles` (separate table, `app_role` enum: admin, user) + `has_role()` SECURITY DEFINER function — per platform rules.

Seed the 8 nature categories (Dawn & Morning, Birds & Wildlife, Rain & Storm, Sky & Clouds, Rivers & Water, Village Life, Wind & Trees, Sunset & Evening) via migration with Bengali names.

Auth: email/password + Google sign-in. First signed-up user can be granted admin via SQL; later admins added from the admin panel.

## Features

- Bengali UI throughout (nav, buttons, labels, empty states).
- Dark/light toggle persisted in localStorage, system default.
- Search (title + description) and category filter on `/explore`.
- Lazy-loaded YouTube thumbnails (use `https://i.ytimg.com/vi/{id}/hqdefault.jpg`), `loading="lazy"` on all images.
- Smooth scroll, fade-in-on-scroll via IntersectionObserver, page transitions.
- SEO: per-route meta, canonical, JSON-LD (WebSite + VideoObject on video pages), sitemap-friendly structure.
- Footer with Telegram + YouTube links (placeholders until you supply URLs) and the copyright notice verbatim.

## Admin panel

Behind `_authenticated/` gate + `has_role(admin)` check in server functions. Forms to add/edit:
- Video: title, description, YouTube URL (auto-extract ID + thumbnail), Telegram URL, category, optional custom thumbnail upload.
- Journal entry: title, slug, body (textarea), cover image.

Non-admins visiting `/admin` get redirected home.

## Technical notes

- TanStack Start + TanStack Query loaders for all public reads via a server publishable client (anon-safe SELECT policies on `videos`, `journal_entries`, `categories`).
- Mutations via `createServerFn` + `requireSupabaseAuth` + admin role check; `supabaseAdmin` only loaded inside handlers when needed.
- Thumbnail uploads via Lovable Cloud Storage bucket `thumbnails` (public read).
- All copy in Bengali; placeholder content is minimal so empty states read gracefully until you add real entries.

Ready to build on approval.
