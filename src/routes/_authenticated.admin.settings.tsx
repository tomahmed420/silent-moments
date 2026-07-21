import { createFileRoute } from "@tanstack/react-router";
import { useSettings } from "@/components/settings-provider";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateSiteSettings } from "@/lib/settings.functions";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { t as defaultT } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettings();
  // Strip out properties we don't want them to accidentally corrupt
  // But wait, it's easier to just let them edit what we want.
  const [form, setForm] = useState(() => JSON.parse(JSON.stringify(settings)));
  const updateFn = useServerFn(updateSiteSettings);
  const [isPending, setIsPending] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    try {
      await updateFn({ data: { settings: form } });
      toast.success("Settings saved successfully! Reload to see changes.");
    } catch (err: Error) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsPending(false);
    }
  }

  const updateNested = (path: string[], value: string) => {
    setForm((prev: unknown) => {
      const next = { ...prev };
      let curr = next;
      for (let i = 0; i < path.length - 1; i++) {
        if (!curr[path[i]]) curr[path[i]] = {};
        curr[path[i]] = { ...curr[path[i]] };
        curr = curr[path[i]];
      }
      curr[path[path.length - 1]] = value;
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">{settings.admin.settings}</h1>
      </div>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Banner Section */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium">হিরো ব্যানার (Home Page Banner)</h2>
          <Field label="Banner Image URL">
            <input
              type="text"
              value={form.heroImage || ""}
              onChange={(e) => updateNested(["heroImage"], e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
            <p className="mt-1 text-xs text-muted-foreground">লিংক না থাকলে ডিফল্ট ছবি দেখাবে।</p>
          </Field>
          <Field label="সাইটের নাম (Site Name)">
            <input
              required
              value={form.siteName}
              onChange={(e) => updateNested(["siteName"], e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="ট্যাগলাইন (Tagline)">
            <textarea
              rows={2}
              required
              value={form.taglineLong}
              onChange={(e) => updateNested(["taglineLong"], e.target.value)}
              className={inputCls}
            />
          </Field>
        </section>

        {/* About Page Section */}
        <section className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-medium">আমাদের কথা (About Page)</h2>
          <Field label="শিরোনাম (Heading)">
            <input
              required
              value={form.about?.heading || ""}
              onChange={(e) => updateNested(["about", "heading"], e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="বিস্তারিত (Body)">
            <textarea
              rows={8}
              required
              value={form.about?.body || ""}
              onChange={(e) => updateNested(["about", "body"], e.target.value)}
              className={inputCls}
            />
          </Field>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> সংরক্ষণ করুন (Save)
          </button>
        </div>
      </form>
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
