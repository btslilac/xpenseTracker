export const helpSupport = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>XpenseTracker - Help &amp; Support</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface-container-lowest": "#ffffff",
                    "outline-variant": "#c6c5d4",
                    "background": "#f9f9f9",
                    "on-error-container": "#93000a",
                    "primary-fixed": "#e0e0ff",
                    "surface-bright": "#f9f9f9",
                    "on-surface": "#1a1c1c",
                    "on-error": "#ffffff",
                    "tertiary": "#400007",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed": "#000767",
                    "on-secondary-fixed-variant": "#005312",
                    "on-primary-fixed-variant": "#343d96",
                    "on-secondary-container": "#217128",
                    "error": "#ba1a1a",
                    "outline": "#767683",
                    "on-tertiary-fixed-variant": "#80272b",
                    "surface-tint": "#4c56af",
                    "secondary-container": "#a0f399",
                    "on-secondary-fixed": "#002204",
                    "tertiary-fixed-dim": "#ffb3b1",
                    "surface-container": "#eeeeee",
                    "surface-container-low": "#f3f3f3",
                    "on-primary-container": "#8690ee",
                    "inverse-primary": "#bdc2ff",
                    "surface-variant": "#e2e2e2",
                    "secondary-fixed": "#a3f69c",
                    "secondary": "#1b6d24",
                    "on-tertiary": "#ffffff",
                    "tertiary-container": "#610f16",
                    "primary-container": "#1a237e",
                    "inverse-surface": "#2f3131",
                    "on-background": "#1a1c1c",
                    "on-primary": "#ffffff",
                    "primary": "#000666",
                    "on-tertiary-container": "#e87575",
                    "surface-dim": "#dadada",
                    "surface": "#f9f9f9",
                    "secondary-fixed-dim": "#88d982",
                    "error-container": "#ffdad6",
                    "surface-container-high": "#e8e8e8",
                    "surface-container-highest": "#e2e2e2",
                    "on-surface-variant": "#454652",
                    "inverse-on-surface": "#f1f1f1",
                    "primary-fixed-dim": "#bdc2ff",
                    "on-tertiary-fixed": "#410007",
                    "tertiary-fixed": "#ffdad8"
            },
            "spacing": {
                    "touch-target-min": "48px",
                    "container-margin": "20px",
                    "base": "8px",
                    "gutter": "16px",
                    "card-padding": "16px"
            },
            "fontFamily": {
                    "headline-md": ["Inter"],
                    "body-base": ["Inter"],
                    "label-sm": ["Inter"],
                    "display-lg": ["Inter"],
                    "title-lg": ["Inter"]
            }
          }
        }
      }
    </script>
<style>
        body { min-height: max(884px, 100dvh); }
</style>
</head>
<body class="bg-background text-on-background font-body-base min-h-screen pb-24">
<header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center h-16 px-5">
<div class="w-full max-w-2xl md:max-w-4xl mx-auto flex items-center">
<button class="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95 duration-200 p-2 -ml-2 mr-3 flex items-center justify-center text-indigo-900 dark:text-indigo-100" onclick="window.__stitchPost({type:'back'})">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<h1 class="font-['Inter'] text-lg font-semibold text-indigo-900 dark:text-indigo-100 flex-1 truncate">Help &amp; Support</h1>
</div>
</header>

<main class="pt-20 px-container-margin pb-24 space-y-5 max-w-2xl md:max-w-4xl mx-auto">
<section class="overflow-hidden rounded-[28px] xp-hero-surface px-5 py-6 text-white shadow-[0_16px_40px_rgba(26,35,126,0.24)]">
<div class="flex items-start justify-between gap-4">
<div class="max-w-[300px]">
<p class="text-[11px] uppercase tracking-[0.22em] text-white/70">Support Center</p>
<h2 class="mt-2 text-[24px] leading-[30px] font-bold">We are here to help you keep every ledger on track.</h2>
<p class="mt-2 text-sm leading-5 text-white/85">Search answers, check SMS &amp; lending behavior, or reach our support team directly.</p>
</div>
<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
<span class="material-symbols-outlined text-[24px]">support_agent</span>
</div>
</div>
<div class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
<div class="flex items-center gap-3 min-w-0">
<span class="material-symbols-outlined text-[20px] text-white/80">mail</span>
<div class="min-w-0">
<p class="text-[10px] uppercase tracking-[0.18em] text-white/65">Signed in with</p>
<p id="help-user-email" class="text-sm font-semibold text-white truncate">your signed-in account</p>
</div>
</div>
<span class="px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-bold text-white/90">v1.0.2</span>
</div>
</section>

<!-- Live Search Input -->
<section class="relative">
<span class="material-symbols-outlined text-[20px] text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
<input id="help-search-input" type="text" placeholder="Search FAQs (e.g. SMS, Lending, Sync, Budget, Biometric)..." class="w-full h-[48px] pl-11 pr-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"/>
</section>

<!-- FAQ Categories & Accordion -->
<section id="help-faq-list" class="grid gap-3">
<div class="flex items-center justify-between px-1">
<h3 class="text-base font-bold text-on-surface">Frequently Asked Questions</h3>
<span id="help-faq-count" class="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">7 topics</span>
</div>

<article class="rounded-2xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30" data-help-item data-help-keywords="expenses budget overrun borrowing limit">
<button class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left" data-help-toggle>
<span class="text-[14.5px] font-semibold leading-5 text-on-surface">How does the monthly budget &amp; overrun check work?</span>
<span class="material-symbols-outlined text-on-surface-variant shrink-0" data-help-icon>add</span>
</button>
<div class="hidden px-4 pb-4 text-sm leading-6 text-on-surface-variant" data-help-answer>
Set your overall monthly limit and per-category caps in Budget Preferences. When adding an expense pushes monthly spending past your limit, XpenseTracker offers to log a linked Casual or Institutional borrowing record right away if you covered the shortfall on credit.
</div>
</article>

<article class="rounded-2xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30" data-help-item data-help-keywords="lending borrowing casual loan agreements interest penalty">
<button class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left" data-help-toggle>
<span class="text-[14.5px] font-semibold leading-5 text-on-surface">What is the difference between Casual Lending and Loan Agreements?</span>
<span class="material-symbols-outlined text-on-surface-variant shrink-0" data-help-icon>add</span>
</button>
<div class="hidden px-4 pb-4 text-sm leading-6 text-on-surface-variant" data-help-answer>
<strong>Casual</strong> records track personal 0% money lent to or borrowed from friends, family, and peers with relationship labels. <strong>Loan Agreements</strong> track formal loans (to clients or from banks, SACCOs, and digital lenders) supporting fixed or percentage interest rates, grace periods, late penalties, and waterfall repayment allocations.
</div>
</article>

<article class="rounded-2xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30" data-help-item data-help-keywords="sms mpesa bank detection auto capture notification permission">
<button class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left" data-help-toggle>
<span class="text-[14.5px] font-semibold leading-5 text-on-surface">How does Android SMS transaction detection stay safe?</span>
<span class="material-symbols-outlined text-on-surface-variant shrink-0" data-help-icon>add</span>
</button>
<div class="hidden px-4 pb-4 text-sm leading-6 text-on-surface-variant" data-help-answer>
When enabled in Notification Settings, M-PESA and bank SMS/notifications are parsed locally on your device only. Detected outgoing or incoming amounts are queued for your explicit classification (Expense, Income, Lent, Borrowed, or Loan Repayment) and are never uploaded as raw SMS messages or posted silently without your choice.
</div>
</article>

<article class="rounded-2xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30" data-help-item data-help-keywords="personal info profile email readonly edit">
<button class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left" data-help-toggle>
<span class="text-[14.5px] font-semibold leading-5 text-on-surface">Which profile details can I update in Personal Information?</span>
<span class="material-symbols-outlined text-on-surface-variant shrink-0" data-help-icon>add</span>
</button>
<div class="hidden px-4 pb-4 text-sm leading-6 text-on-surface-variant" data-help-answer>
You can edit your display name, phone number, profile avatar, and date of birth at any time under Profile &rarr; Personal Information. Your sign-in email is bound to your authentication account for security and shown as read-only.
</div>
</article>

<article class="rounded-2xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30" data-help-item data-help-keywords="offline sync queue internet backup cloud">
<button class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left" data-help-toggle>
<span class="text-[14.5px] font-semibold leading-5 text-on-surface">Do transactions and loans work while I am offline?</span>
<span class="material-symbols-outlined text-on-surface-variant shrink-0" data-help-icon>add</span>
</button>
<div class="hidden px-4 pb-4 text-sm leading-6 text-on-surface-variant" data-help-answer>
Yes. New transactions, categories, loans, repayments, and settings save immediately to local device storage and join an offline sync queue. When your connection returns, changes synchronize automatically (or manually from Profile &rarr; Sync).
</div>
</article>

<article class="rounded-2xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30" data-help-item data-help-keywords="category wrong type edit delete reassign">
<button class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left" data-help-toggle>
<span class="text-[14.5px] font-semibold leading-5 text-on-surface">Why can't I delete a category with existing transactions?</span>
<span class="material-symbols-outlined text-on-surface-variant shrink-0" data-help-icon>add</span>
</button>
<div class="hidden px-4 pb-4 text-sm leading-6 text-on-surface-variant" data-help-answer>
To protect historical analytics and monthly summaries, categories referenced by existing transactions cannot be removed until those transactions are deleted or reassigned. You can rename or change a category's icon and color anytime.
</div>
</article>

<article class="rounded-2xl bg-surface-container-lowest shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30" data-help-item data-help-keywords="theme liquid glass material expressive dark pure black biometric lock">
<button class="flex w-full items-center justify-between gap-4 px-4 py-4 text-left" data-help-toggle>
<span class="text-[14.5px] font-semibold leading-5 text-on-surface">How do Themes, Pure Black Mode, and Biometric App Lock work?</span>
<span class="material-symbols-outlined text-on-surface-variant shrink-0" data-help-icon>add</span>
</button>
<div class="hidden px-4 pb-4 text-sm leading-6 text-on-surface-variant" data-help-answer>
Switch anytime between Liquid Glass and Material 3 Expressive visual styles, Light/Dark/System themes, Pure Black AMOLED surfaces, and dynamic wallpaper palettes in Profile &rarr; Appearance. Biometric Lock in Profile secures your ledger whenever the app returns from background.
</div>
</article>
</section>

<div id="help-search-empty" class="hidden rounded-2xl border border-dashed border-outline-variant p-8 text-center text-sm text-on-surface-variant">
  No help articles match your search. Try another keyword or contact support below.
</div>

<!-- Direct Contact & Actions Card -->
<section class="rounded-2xl bg-surface-container-lowest p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30 space-y-4">
<div class="flex items-start justify-between gap-3">
<div>
<p class="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant font-bold">Need direct help?</p>
<h3 class="mt-1 text-base font-bold text-on-surface">Contact XpenseTracker Support</h3>
<p class="mt-1 text-xs leading-5 text-on-surface-variant">Include your issue details and we will follow up via <span class="font-semibold text-on-surface">support@xpensetracker.app</span>.</p>
</div>
<span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">Direct</span>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
<button id="btn-help-email" type="button" class="h-11 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm">
  <span class="material-symbols-outlined text-[18px]">forward_to_inbox</span>
  <span>Email Support</span>
</button>
<button id="btn-help-copy-email" type="button" class="h-11 rounded-xl bg-surface-container border border-outline-variant/60 text-on-surface text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
  <span class="material-symbols-outlined text-[18px]">content_copy</span>
  <span>Copy Support Address</span>
</button>
</div>
</section>
</main>
</body></html>`;
