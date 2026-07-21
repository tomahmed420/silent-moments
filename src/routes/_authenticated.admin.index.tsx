import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Pencil, Trash2, Star, Music, Video } from "lucide-react";
import { toast } from "sonner";
import { listVideos, listCategories } from "@/lib/public.functions";
import { upsertVideo, deleteVideo } from "@/lib/admin.functions";
import { extractYoutubeId, youtubeThumb } from "@/lib/youtube";
import { useSettings } from "@/components/settings-provider";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminVideos,
});

type Editing = {
  id?: string;
  title: string;
  description: string;
  youtube_url: string;
  telegram_url: string;
  category_id: string;
  thumbnail_url: string;
  duration: string;
  is_featured: boolean;
};

const empty: Editing = {
  title: "",
  description: "",
  youtube_url: "",
  telegram_url: "",
  category_id: "",
  thumbnail_url: "",
  duration: "",
  is_featured: false,
};

function AdminVideos() {
  const t = useSettings();
  const qc = useQueryClient();
  const { data: videos = [] } = useQuery({
    queryKey: ["admin", "videos"],
    queryFn: () => listVideos({ data: {} }),
  });
  const { data: cats = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => listCategories(),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Editing>(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const upsert = useServerFn(upsertVideo);
  const del = useServerFn(deleteVideo);

  const saveMut = useMutation({
    mutationFn: async (data: Editing) => {
      let yid = extractYoutubeId(data.youtube_url);
      if (!yid) {
        if (data.youtube_url.includes("t.me/")) {
          yid = "TELEGRAM_LINK";
        } else if (data.youtube_url.match(/\.(mp3|m4a|ogg|wav)$/i)) {
          yid = "AUDIO_LINK";
        } else {
          throw new Error("সঠিক ইউটিউব, টেলিগ্রাম বা অডিও লিংক দিন");
        }
      }
      return upsert({
        data: {
          id: data.id,
          title: data.title,
          description: data.description || null,
          youtube_url: data.youtube_url,
          youtube_id: yid,
          telegram_url: data.telegram_url || null,
          category_id: data.category_id || null,
          thumbnail_url: data.thumbnail_url || null,
          duration: data.duration || null,
          is_featured: data.is_featured,
        },
      });
    },
    onSuccess: () => {
      toast.success("সংরক্ষিত");
      setOpen(false);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (e: Error) => toast.error(e?.message || "সমস্যা হয়েছে"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      qc.invalidateQueries({ queryKey: ["admin", "videos"] });
      qc.invalidateQueries({ queryKey: ["videos"] });
    },
    onError: (e: Error) => toast.error(e?.message || "সমস্যা হয়েছে"),
  });

  function startEdit(v: typeof empty) {
    setForm({
      id: v.id,
      title: v.title,
      description: v.description ?? "",
      youtube_url: v.youtube_url,
      telegram_url: v.telegram_url ?? "",
      category_id: v.category_id ?? "",
      thumbnail_url: v.thumbnail_url ?? "",
      duration: v.duration ?? "",
      is_featured: !!v.is_featured,
    });
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t.admin.videos}</h1>
        <button
          onClick={() => {
            setForm(empty);
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {t.admin.addVideo}
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {videos.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            {t.empty.videos}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {videos.map((v) => (
              <li key={v.id} className="flex items-center gap-4 px-4 py-3">
                {v.thumbnail_url ||
                (v.youtube_id !== "TELEGRAM_LINK" &&
                  v.youtube_id !== "TELEGRAM_AUDIO" &&
                  v.youtube_id !== "AUDIO_LINK") ? (
                  <img
                    src={v.thumbnail_url || youtubeThumb(v.youtube_id)}
                    alt=""
                    className="h-14 w-24 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    {v.youtube_id === "AUDIO_LINK" || v.youtube_id === "TELEGRAM_AUDIO" ? (
                      <Music className="h-5 w-5" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="truncate font-medium">{v.title}</div>
                    {v.is_featured ? <Star className="h-3.5 w-3.5 text-primary" /> : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {v.categories?.name_bn ?? "—"}
                  </div>
                </div>
                <button
                  onClick={() => startEdit(v)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(v.id)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setOpen(false)}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              saveMut.mutate(form);
            }}
            className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6"
          >
            <h2 className="font-display text-lg font-semibold">
              {form.id ? t.admin.edit : t.admin.addVideo}
            </h2>
            <div className="mt-4 grid gap-3">
              <Field label={t.admin.title}>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label={`${t.admin.youtubeUrl} / Telegram / Audio`}>
                <input
                  required
                  value={form.youtube_url}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/... বা https://t.me/..."
                  className={inputCls}
                />
              </Field>
              <Field label={t.admin.description}>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <div className="grid gap-3">
                <Field label={t.admin.category}>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">—</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name_bn}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label={t.admin.telegramUrl}>
                <input
                  value={form.telegram_url}
                  onChange={(e) => setForm({ ...form, telegram_url: e.target.value })}
                  placeholder="https://t.me/..."
                  className={inputCls}
                />
              </Field>
              <Field label={`${t.admin.thumbnail} (optional URL)`}>
                <input
                  value={form.thumbnail_url}
                  onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                />
                {t.admin.featured}
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-border px-4 py-2 text-sm"
              >
                {t.admin.cancel}
              </button>
              <button
                type="submit"
                disabled={saveMut.isPending}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {t.admin.save}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center soft-shadow"
          >
            <h3 className="mb-2 text-lg font-semibold">নিশ্চিত করুন</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              আপনি কি নিশ্চিত যে আপনি এটি মুছে ফেলতে চান? এই কাজটি বাতিল করা যাবে না।
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  deleteMut.mutate(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
              >
                মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useSettings();
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
