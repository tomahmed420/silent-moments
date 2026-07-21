import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listJournal } from "@/lib/public.functions";
import { upsertJournal, deleteJournal } from "@/lib/admin.functions";
import { useSettings } from "@/components/settings-provider";

export const Route = createFileRoute("/_authenticated/admin/journal")({
  component: AdminJournal,
});

type Editing = {
  id?: string;
  slug: string;
  title: string;
  body: string;
  cover_url: string;
};
const empty: Editing = { slug: "", title: "", body: "", cover_url: "" };

function AdminJournal() {
  const t = useSettings();
  const qc = useQueryClient();
  const { data: entries = [] } = useQuery({
    queryKey: ["admin", "journal"],
    queryFn: () => listJournal({ data: {} }),
  });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Editing>(empty);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const upsert = useServerFn(upsertJournal);
  const del = useServerFn(deleteJournal);

  const saveMut = useMutation({
    mutationFn: (data: Editing) =>
      upsert({
        data: {
          id: data.id,
          slug: data.slug,
          title: data.title,
          body: data.body,
          cover_url: data.cover_url || null,
        },
      }),
    onSuccess: () => {
      toast.success("সংরক্ষিত");
      setOpen(false);
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["admin", "journal"] });
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: (e: Error) => toast.error(e?.message || "সমস্যা"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("মুছে ফেলা হয়েছে");
      qc.invalidateQueries({ queryKey: ["admin", "journal"] });
      qc.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  function startEdit(j: typeof empty) {
    setForm({
      id: j.id,
      slug: j.slug,
      title: j.title,
      body: j.body,
      cover_url: j.cover_url ?? "",
    });
    setOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{t.admin.journal}</h1>
        <button
          onClick={() => {
            setForm(empty);
            setOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {t.admin.addJournal}
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        {entries.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            {t.empty.journal}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((j) => (
              <li key={j.id} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{j.title}</div>
                  <div className="text-xs text-muted-foreground">/{j.slug}</div>
                </div>
                <button
                  onClick={() => startEdit(j)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(j.id)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
              {form.id ? t.admin.edit : t.admin.addJournal}
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
              <Field label={t.admin.slug}>
                <input
                  required
                  pattern="[a-z0-9-]+"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="amar-lekha"
                  className={inputCls}
                />
                <p className="mt-1 text-[10px] text-muted-foreground">
                  এটি হবে ডায়েরির URL (যেমন: amar-lekha)। এখানে শুধু ছোট হাতের ইংরেজি অক্ষর, সংখ্যা
                  এবং ড্যাশ (-) ব্যবহার করা যাবে। কোনো স্পেস বা পুরো ওয়েবসাইটের লিংক (https://...)
                  দেওয়া যাবে না।
                </p>
              </Field>
              <Field label={`${t.admin.coverImage} (URL)`}>
                <input
                  value={form.cover_url}
                  onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label={t.admin.body}>
                <textarea
                  required
                  rows={10}
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className={inputCls}
                />
              </Field>
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
