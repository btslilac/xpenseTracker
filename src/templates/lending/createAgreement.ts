export const createAgreement = `<!DOCTYPE html>
<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>New Agreement - XpenseTracker</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script id="tailwind-config">
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        "primary-dark": "#4338ca",
      }
    }
  }
}
</script>
<style>
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  .pt-safe { padding-top: env(safe-area-inset-top); }
  body { min-height: 100dvh; }
  .direction-btn.active {
    background-color: var(--action-primary);
    color: var(--action-primary-text);
  }
  .mode-btn.active-casual {
    background-color: #0d9488;
    color: #ffffff;
  }
  .mode-btn.active-formal {
    background-color: var(--action-primary);
    color: var(--action-primary-text);
  }
</style>
</head>
<body class="bg-[var(--bg-canvas,#f8fafc)] text-[var(--text-primary,#0f172a)] pb-24 pt-16">
<!-- TopAppBar -->
<header class="fixed top-0 left-0 w-full z-50 px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm flex items-center">
  <div class="w-full max-w-xl md:max-w-4xl mx-auto flex justify-between items-center">
    <button data-stitch-event="back" class="w-10 h-10 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all">
      <span class="material-symbols-outlined text-[24px]">close</span>
    </button>
    <h1 id="screen-title" class="text-lg font-bold text-slate-900 dark:text-slate-100 font-['Inter']">New Record</h1>
    <div class="w-10"></div>
  </div>
</header>

<main class="w-full max-w-xl md:max-w-4xl mx-auto px-4 py-4 flex flex-col gap-5">
  <!-- Mode Selector: Casual vs Loan Agreements -->
  <div id="section-mode" class="flex flex-col gap-1.5 max-w-md mx-auto w-full md:max-w-lg">
    <div class="flex items-center justify-between px-1">
      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Operational Mode</span>
      <span id="mode-badge" class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">0% Interest</span>
    </div>
    <div id="mode-locked-banner" class="hidden py-2.5 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span id="mode-locked-icon" class="material-symbols-outlined text-[18px] text-teal-600">handshake</span>
        <span id="mode-locked-label" class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">Casual Personal Record</span>
      </div>
      <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400">Locked Context</span>
    </div>
    <div id="mode-toggle" class="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
      <button type="button" id="mode-casual" class="mode-btn active-casual py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm">
        <span class="material-symbols-outlined text-[18px]">handshake</span>
        Casual
      </button>
      <button type="button" id="mode-formal" class="mode-btn py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400">
        <span class="material-symbols-outlined text-[18px]">account_balance</span>
        Loan Agreement
      </button>
    </div>
    <p id="mode-desc" class="text-[10px] text-center text-slate-400">Casual: Informal lending/borrowing with friends &amp; peers (0% interest).</p>
  </div>

  <!-- Direction Selector -->
  <div class="grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-md mx-auto w-full md:max-w-lg">
    <button id="dir-lent" type="button" class="direction-btn active py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm">
      <span class="material-symbols-outlined text-[18px]">arrow_outward</span>
      I Lent Money
    </button>
    <button id="dir-borrowed" type="button" class="direction-btn py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400">
      <span class="material-symbols-outlined text-[18px]">call_received</span>
      I Borrowed Money
    </button>
  </div>

  <form id="agreement-form" novalidate class="flex flex-col gap-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <!-- Left Column: Counterparty Information & Financial Terms -->
      <div class="flex flex-col gap-4">
        <!-- Counterparty Info Group -->
        <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
          <h2 id="counterparty-group-title" class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Borrower Information</h2>
          
          <div>
            <label id="counterparty-name-label" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Borrower's Full Name *</label>
            <input id="input-counterparty-name" type="text" required placeholder="e.g. John Kamau" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input id="input-counterparty-phone" type="tel" placeholder="+254 712 345678" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <!-- Email (Formal Loan Agreements Mode Only) -->
            <div id="wrapper-email">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input id="input-counterparty-email" type="email" placeholder="john@example.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <!-- Relationship (Casual Mode Only) -->
            <div id="wrapper-relationship" class="hidden">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Relationship *</label>
              <button id="btn-open-relationship" type="button" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-98 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500">
                <span id="selected-relationship-text" class="flex items-center gap-1.5 truncate">
                  <span class="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">group</span>
                  <span>Friend</span>
                </span>
                <span class="material-symbols-outlined text-[18px] text-slate-400">expand_more</span>
              </button>
              <input type="hidden" id="input-relationship" value="Friend"/>
            </div>
          </div>
        </div>

        <!-- Loan Financial Terms -->
        <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Financial Terms</h2>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Principal Amount *</label>
              <input id="input-principal" type="text" inputmode="decimal" required placeholder="0" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
              <input id="input-currency" type="text" readonly value="KES" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 cursor-not-allowed"/>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Agreement Date *</label>
              <input id="input-agreement-date" type="date" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date (Optional)</label>
              <input id="input-due-date" type="date" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Repayment Schedule</label>
            <select id="select-frequency" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="one_time">One-time Lump Sum</option>
              <option value="weekly">Weekly Installments</option>
              <option value="biweekly">Every Two Weeks</option>
              <option value="monthly">Monthly Installments</option>
              <option value="custom">Custom Schedule</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Right Column: Interest Terms, Penalty Settings & Notes -->
      <div class="flex flex-col gap-4">
        <!-- Interest & Charges (Formal Mode Only) -->
        <div id="card-interest-terms" class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 hidden">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Interest Terms</h2>

          <div class="grid grid-cols-3 gap-2">
            <label class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 cursor-pointer bg-slate-50 dark:bg-slate-900/40 text-center">
              <input type="radio" name="interestType" value="none" checked class="text-indigo-600 focus:ring-indigo-500"/>
              <span class="text-[11px] font-semibold text-slate-800 dark:text-slate-200">No Interest</span>
            </label>
            <label class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 cursor-pointer bg-slate-50 dark:bg-slate-900/40 text-center">
              <input type="radio" name="interestType" value="fixed" class="text-indigo-600 focus:ring-indigo-500"/>
              <span class="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Fixed Amount</span>
            </label>
            <label class="p-2 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1 cursor-pointer bg-slate-50 dark:bg-slate-900/40 text-center">
              <input type="radio" name="interestType" value="simple" class="text-indigo-600 focus:ring-indigo-500"/>
              <span class="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Rate (%)</span>
            </label>
          </div>

          <div id="field-fixed-interest" class="hidden">
            <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Agreed Total Interest Amount</label>
            <input id="input-fixed-interest" type="text" inputmode="decimal" placeholder="0" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div id="field-simple-interest" class="hidden grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Interest Rate (%)</label>
              <input id="input-interest-rate" type="text" inputmode="decimal" placeholder="5" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Period</label>
              <select id="select-interest-period" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="per_month">Per Month</option>
                <option value="per_year">Per Year</option>
                <option value="total">Total Agreed</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Late Payment Penalty Settings (Formal Mode Only) -->
        <div id="card-penalty-terms" class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 hidden">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Late Payment Penalty</h2>
            <span class="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Waterfall Priority #1</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <label class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900/40">
              <input type="radio" name="penaltyType" value="none" checked class="text-indigo-600 focus:ring-indigo-500"/>
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">No Penalty</span>
            </label>
            <label class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900/40">
              <input type="radio" name="penaltyType" value="fixed" class="text-indigo-600 focus:ring-indigo-500"/>
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Fixed Late Fee</span>
            </label>
            <label class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900/40">
              <input type="radio" name="penaltyType" value="percentage" class="text-indigo-600 focus:ring-indigo-500"/>
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">% of Principal</span>
            </label>
            <label class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-900/40">
              <input type="radio" name="penaltyType" value="daily" class="text-indigo-600 focus:ring-indigo-500"/>
              <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">Daily Late Fee</span>
            </label>
          </div>

          <div id="field-penalty-config" class="hidden flex flex-col gap-3 pt-1">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label id="label-penalty-rate" class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Fee / Rate *</label>
                <input id="input-penalty-rate" type="text" inputmode="decimal" placeholder="0" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Grace Period (Days)</label>
                <input id="input-penalty-grace" type="text" inputmode="decimal" value="0" placeholder="0" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            </div>
            <p class="text-[10px] text-slate-400">Grace period allows days after due date before the penalty starts calculating.</p>
          </div>
        </div>

        <!-- Notes & Reference -->
        <div class="theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
          <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Additional Notes</h2>
          <textarea id="input-notes" rows="3" placeholder="Purpose of loan, collateral details, or repayment agreement terms..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="w-full max-w-md mx-auto pt-2">
      <button type="submit" class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-[18px]">save</span>
        <span id="btn-submit-label">Save Agreement</span>
      </button>
    </div>
  </form>
</main>
</body></html>`
