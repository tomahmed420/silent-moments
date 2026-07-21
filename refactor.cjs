const fs = require("fs");

const files = [
  "src/components/site-header.tsx",
  "src/components/site-footer.tsx",
  "src/routes/_authenticated.tsx",
  "src/routes/auth.tsx",
  "src/routes/journal.tsx",
  "src/routes/video.$id.tsx",
  "src/routes/_authenticated.admin.index.tsx",
  "src/routes/category.$slug.tsx",
  "src/routes/explore.tsx",
  "src/routes/_authenticated.admin.journal.tsx",
  "src/routes/about.tsx",
  "src/routes/index.tsx",
  "src/routes/journal.$slug.tsx",
];

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");

  // Replace import
  content = content.replace(
    'import { t } from "@/lib/i18n";',
    'import { useSettings } from "@/components/settings-provider";',
  );

  // Now, find the main component function and insert `const t = useSettings();`
  // This is a bit tricky, let's just do it manually for safety or with a regex that finds `function [A-Z][a-zA-Z0-9]*\([^)]*\) {`

  // We can just find all functions starting with capital letter
  content = content.replace(
    /(function\s+[A-Z][a-zA-Z0-9_]*\s*\([^)]*\)\s*\{)/g,
    "$1\n  const t = useSettings();",
  );
  // Also arrow functions exported as components (if any)
  content = content.replace(
    /(const\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{)/g,
    "$1\n  const t = useSettings();",
  );

  // There are some components like Section and EmptyHint in index.tsx
  // We can just rely on the regex above.
  fs.writeFileSync(file, content);
}
console.log("Done");
