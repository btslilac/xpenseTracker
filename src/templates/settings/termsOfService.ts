import {
  TERMS_OF_SERVICE_SECTIONS,
  TERMS_OF_SERVICE_VERSION,
} from '../../lib/legal/complianceDocuments'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const sectionsHtml = TERMS_OF_SERVICE_SECTIONS.map((sec) => {
  const paras = sec.paragraphs
    .map((p) => `<p class="text-sm text-on-surface-variant leading-relaxed">${escapeHtml(p)}</p>`)
    .join('')
  return `<section class="theme-card rounded-2xl p-4 border border-outline-variant/25 space-y-2.5">
    <h2 class="text-sm font-bold text-on-surface">${escapeHtml(sec.title)}</h2>
    ${paras}
  </section>`
}).join('')

export const termsOfService = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Terms of Service — XpenseTracker</title>
  <script src="https://cdn.tailwindcss.com?plugins=forms"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
</head>
<body class="bg-background text-on-surface font-['Inter',sans-serif] pb-12">
  <header class="fixed top-0 left-0 right-0 z-40 h-16 px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-outline-variant/25 flex items-center justify-between">
    <button type="button" data-stitch-event="back" class="w-11 h-11 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div class="text-center">
      <h1 class="text-base font-bold text-on-surface">Terms of Service</h1>
      <p class="text-[11px] text-on-surface-variant">Republic of Kenya • v${TERMS_OF_SERVICE_VERSION}</p>
    </div>
    <div class="w-11"></div>
  </header>

  <main class="pt-20 px-4 max-w-2xl mx-auto space-y-4">
    <div class="rounded-2xl p-4 bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3">
      <span class="material-symbols-outlined text-primary shrink-0 mt-0.5">gavel</span>
      <div class="text-xs text-on-surface-variant leading-relaxed">
        <strong class="text-on-surface block mb-0.5">Independent Personal Finance Software</strong>
        XpenseTracker is not affiliated with Safaricom PLC, M-PESA, Fuliza M-PESA, PesaLink, or any financial institution. Verify parsed figures before saving.
      </div>
    </div>

    ${sectionsHtml}
  </main>
</body>
</html>`
