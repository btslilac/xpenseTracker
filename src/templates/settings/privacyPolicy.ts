import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_VERSION,
} from '../../lib/legal/complianceDocuments'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const sectionsHtml = PRIVACY_POLICY_SECTIONS.map((sec) => {
  const paras = sec.paragraphs
    .map((p) => `<p class="text-sm text-on-surface-variant leading-relaxed">${escapeHtml(p)}</p>`)
    .join('')
  const bullets = sec.bullets
    ? `<ul class="space-y-2 mt-2">${sec.bullets
        .map(
          (b) =>
            `<li class="flex items-start gap-2 text-xs text-on-surface-variant leading-relaxed"><span class="material-symbols-outlined text-[15px] text-primary mt-0.5 shrink-0">check_circle</span><span>${escapeHtml(b)}</span></li>`
        )
        .join('')}</ul>`
    : ''
  return `<section class="theme-card rounded-2xl p-4 border border-outline-variant/25 space-y-2.5">
    <h2 class="text-sm font-bold text-on-surface">${escapeHtml(sec.title)}</h2>
    ${paras}
    ${bullets}
  </section>`
}).join('')

export const privacyPolicy = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Privacy Policy — XpenseTracker</title>
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
      <h1 class="text-base font-bold text-on-surface">Privacy Policy</h1>
      <p class="text-[11px] text-on-surface-variant">Kenya DPA (2019) • v${PRIVACY_POLICY_VERSION}</p>
    </div>
    <div class="w-11"></div>
  </header>

  <main class="pt-20 px-4 max-w-2xl mx-auto space-y-4">
    <div class="rounded-2xl p-4 bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
      <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">shield_lock</span>
      <div class="text-xs text-on-surface-variant leading-relaxed">
        <strong class="text-on-surface block mb-0.5">On-Device SMS Privacy Guarantee</strong>
        Optional M-PESA and bank SMS parsing runs exclusively inside your phone. Raw SMS inbox text is never uploaded to our backend or shared with ad networks.
      </div>
    </div>

    ${sectionsHtml}
  </main>
</body>
</html>`
