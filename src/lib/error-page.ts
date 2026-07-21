export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="bn">
  <head>
    <meta charset="utf-8" />
    <title>ত্রুটি — পাতাটি লোড হয়নি</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; font-weight: 600; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>পাতাটি লোড হয়নি</h1>
      <p>কোথাও কোনো সমস্যা হয়েছে। আপনি পেজটি রিলোড করতে পারেন অথবা হোমে ফিরে যেতে পারেন।</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">আবার চেষ্টা করুন</button>
        <a class="secondary" href="/">হোমে ফিরে যান</a>
      </div>
    </div>
  </body>
</html>`;
}
