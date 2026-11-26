export const personalInfo = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>XpenseTracker - Personal Information</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "surface-container-lowest": "#ffffff",
                        "on-secondary": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "tertiary-container": "#610f16",
                        "secondary-container": "#a0f399",
                        "on-surface": "#1a1c1c",
                        "inverse-on-surface": "#f1f1f1",
                        "on-surface-variant": "#454652",
                        "on-primary-fixed-variant": "#343d96",
                        "surface-dim": "#dadada",
                        "on-tertiary-container": "#e87575",
                        "surface-container": "#eeeeee",
                        "surface-tint": "#4c56af",
                        "outline": "#767683",
                        "on-tertiary-fixed-variant": "#80272b",
                        "tertiary-fixed": "#ffdad8",
                        "surface-variant": "#e2e2e2",
                        "secondary-fixed": "#a3f69c",
                        "on-primary-container": "#8690ee",
                        "on-secondary-fixed-variant": "#005312",
                        "surface-container-low": "#f3f3f3",
                        "background": "#f9f9f9",
                        "secondary": "#1b6d24",
                        "on-primary": "#ffffff",
                        "surface": "#f9f9f9",
                        "tertiary": "#400007",
                        "on-secondary-fixed": "#002204",
                        "on-primary-fixed": "#000767",
                        "on-error": "#ffffff",
                        "on-tertiary-fixed": "#410007",
                        "primary-fixed-dim": "#bdc2ff",
                        "on-background": "#1a1c1c",
                        "surface-container-highest": "#e2e2e2",
                        "surface-bright": "#f9f9f9",
                        "inverse-primary": "#bdc2ff",
                        "tertiary-fixed-dim": "#ffb3b1",
                        "secondary-fixed-dim": "#88d982",
                        "outline-variant": "#c6c5d4",
                        "error-container": "#ffdad6",
                        "on-secondary-container": "#217128",
                        "inverse-surface": "#2f3131",
                        "error": "#ba1a1a",
                        "primary-fixed": "#e0e0ff",
                        "primary": "#000666",
                        "surface-container-high": "#e8e8e8",
                        "primary-container": "#1a237e",
                        "on-error-container": "#93000a"
                    },
                    spacing: {
                        "card-padding": "16px",
                        "container-margin": "20px",
                        "base": "8px",
                        "touch-target-min": "48px",
                        "gutter": "16px"
                    },
                    fontFamily: {
                        "display-lg": ["Inter"],
                        "body-base": ["Inter"],
                        "headline-md": ["Inter"],
                        "title-lg": ["Inter"],
                        "label-sm": ["Inter"]
                    }
                }
            }
        }
    </script>
<style>
    body { min-height: max(884px, 100dvh); }
</style>
</head>
<body class="bg-background text-on-surface font-body-base min-h-screen pb-24 flex flex-col items-center">
<div class="w-full max-w-xl md:max-w-2xl bg-background min-h-screen relative overflow-hidden mx-auto">
<header class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md docked full-width top-0 sticky z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm flex items-center px-5 h-16 w-full">
<button class="text-indigo-900 dark:text-indigo-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors active:opacity-70 p-2 -ml-2 rounded-full mr-3 flex items-center justify-center">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<h1 class="font-sans antialiased text-base font-semibold text-indigo-900 dark:text-indigo-300">Personal Information</h1>
</header>

<main class="px-container-margin py-6 flex flex-col gap-5">
<section class="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-[0_4px_12px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-5">
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="flex flex-col gap-1.5">
<label for="full-name-input" class="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Full Name *</label>
<div class="flex items-center bg-surface-container-low rounded-xl px-4 h-touch-target-min border border-transparent focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
<span class="material-symbols-outlined text-outline mr-3">person</span>
<input id="full-name-input" class="w-full bg-transparent border-none p-0 font-body-base text-body-base text-on-surface focus:ring-0" type="text" placeholder="Enter your name" value=""/>
</div>
</div>

<div class="flex flex-col gap-1.5">
<div class="flex items-center justify-between px-1">
<label for="email-input" class="font-label-sm text-label-sm text-on-surface-variant font-semibold">Account Email</label>
<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">Auth Linked</span>
</div>
<div class="flex items-center bg-surface-container rounded-xl px-4 h-touch-target-min opacity-80 border border-outline-variant/30">
<span class="material-symbols-outlined text-outline mr-3">lock</span>
<input id="email-input" readonly class="w-full bg-transparent border-none p-0 font-body-base text-body-base text-on-surface-variant focus:ring-0 cursor-not-allowed" type="email" value=""/>
</div>
<p class="text-[11px] text-outline ml-1">Managed by your sign-in account and used for cloud sync.</p>
</div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
<div class="flex flex-col gap-1.5">
<label for="phone-input" class="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Mobile Number (Optional)</label>
<div class="flex items-center bg-surface-container-low rounded-xl px-4 h-touch-target-min border border-transparent focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15 transition-all">
<span class="material-symbols-outlined text-outline mr-3">phone_iphone</span>
<input id="phone-input" class="w-full bg-transparent border-none p-0 font-body-base text-body-base text-on-surface focus:ring-0" type="tel" placeholder="+254 700 000 000" value=""/>
</div>
</div>

<div class="flex flex-col gap-1.5">
<label class="font-label-sm text-label-sm text-on-surface-variant ml-1 font-semibold">Date of Birth (Optional)</label>
<div id="date-trigger" class="flex items-center justify-between bg-surface-container-low rounded-xl px-4 h-touch-target-min border border-transparent hover:border-outline-variant/50 transition-all cursor-pointer">
<div class="flex items-center min-w-0 flex-1">
<span class="material-symbols-outlined text-outline mr-3">calendar_month</span>
<input id="dob-display" class="w-full bg-transparent border-none p-0 font-body-base text-body-base text-on-surface font-medium focus:ring-0 pointer-events-none" readonly type="text" value="Select Date"/>
</div>
<span class="material-symbols-outlined text-outline text-[18px]">expand_more</span>
</div>
</div>
</div>
</section>

<div class="w-full max-w-md mx-auto flex flex-col gap-3">
<button id="btn-save-profile" type="button" class="w-full h-[54px] mt-1 bg-primary text-on-primary rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all">
  <span class="material-symbols-outlined text-[20px]">check_circle</span>
  <span>Save Changes</span>
</button>
<button data-stitch-event="deleteAccount" type="button" class="w-full h-[52px] bg-transparent border border-error/70 text-error rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-error/10 active:scale-[0.98] transition-all">
  <span class="material-symbols-outlined text-[18px]">delete_forever</span>
  <span>Delete Account</span>
</button>
</div>
</main>
</div>
</body></html>`;
