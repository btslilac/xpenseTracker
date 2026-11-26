import { sharedScript } from './shared'

export function analyticsScript() {
  return `
${sharedScript()}
const data = window.__STITCH_DATA__ || {};
const escape = window.__stitchEscape || ((v) => String(v == null ? '' : v));
const views = data.views || {};

const headerRangePill = document.getElementById('header-range-pill');
const expenseNode = document.getElementById('total-expense');
const comparisonNode = document.getElementById('comparison-text');
const summaryCaptionNode = document.getElementById('summary-caption');
const periodChip = document.getElementById('period-chip');
const periodRangeLabel = document.getElementById('period-range-label');
const heroNetNode = document.getElementById('hero-net');
const heroBudgetLabel = document.getElementById('hero-budget-label');
const heroBudgetNode = document.getElementById('hero-budget');

const metricIncomeNode = document.getElementById('metric-income');
const metricIncomeCaptionNode = document.getElementById('metric-income-caption');
const metricNetNode = document.getElementById('metric-net');
const metricNetCaptionNode = document.getElementById('metric-net-caption');
const metricBudgetNode = document.getElementById('metric-budget');
const metricBudgetCaptionNode = document.getElementById('metric-budget-caption');
const metricAverageLabelNode = document.getElementById('metric-average-label');
const metricAverageNode = document.getElementById('metric-average');
const metricAverageCaptionNode = document.getElementById('metric-average-caption');

const trendTitleNode = document.getElementById('trend-section-title');
const trendSubtitleNode = document.getElementById('trend-section-subtitle');
const monthlyTrendModeWrap = document.getElementById('monthly-trend-mode-wrap');
const trendSelectedLabel = document.getElementById('trend-selected-label');
const trendSelectedExpense = document.getElementById('trend-selected-expense');
const trendSelectedIncome = document.getElementById('trend-selected-income');
const trendBarsContainer = document.getElementById('trend-bars-container');
const trendModeButtons = [...document.querySelectorAll('.trend-mode-btn')];

const analyticsCategoryList = document.getElementById('analytics-category-list');
const analyticsCategorySubtitle = document.getElementById('analytics-category-subtitle');
const analyticsCategoryScope = document.getElementById('analytics-category-scope');

const budgetScopeBadge = document.getElementById('budget-scope-badge');
const categoryBudgetStatusSection = document.getElementById('category-budget-status-section');
const categoryBudgetStatusList = document.getElementById('category-budget-status-list');

const signalTopNameNode = document.getElementById('signal-top-name');
const signalTopAmountNode = document.getElementById('signal-top-amount');
const signalTopCaptionNode = document.getElementById('signal-top-caption');
const signalLargestNameNode = document.getElementById('signal-largest-name');
const signalLargestAmountNode = document.getElementById('signal-largest-amount');
const signalLargestCaptionNode = document.getElementById('signal-largest-caption');
const insightList = document.getElementById('insight-list');
const toggleButtons = [...document.querySelectorAll('.analytics-toggle')];

let currentViewName = data.defaultView || 'monthly';
let currentMonthlyTrendMode = 'weekly';
let selectedTrendIdx = null;

function getAdaptiveColors(hexColor, fallbackBg, fallbackFg) {
  const isDark = document.documentElement.classList.contains('dark');
  const clean = String(hexColor || '').replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    if (!isDark) return { bg: fallbackBg || '#f1f5f9', fg: fallbackFg || '#1e293b', bar: fallbackFg || '#4c56af' };
    return { bg: 'rgba(148, 163, 184, 0.2)', fg: '#cbd5e1', bar: 'var(--action-primary, #93c5fd)' };
  }
  let r = parseInt(clean.slice(0, 2), 16);
  let g = parseInt(clean.slice(2, 4), 16);
  let b = parseInt(clean.slice(4, 6), 16);
  if (!isDark) {
    return {
      bg: \`rgba(\${r}, \${g}, \${b}, 0.14)\`,
      fg: \`#\${clean}\`,
      bar: \`#\${clean}\`
    };
  }
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (lum < 0.56) {
    const lift = Math.min(0.74, Math.max(0.42, 0.72 - lum));
    r = Math.round(r + (255 - r) * lift);
    g = Math.round(g + (255 - g) * lift);
    b = Math.round(b + (255 - b) * lift);
  }
  const brightHex = '#' + [r, g, b].map((v) => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
  return {
    bg: \`rgba(\${r}, \${g}, \${b}, 0.22)\`,
    fg: brightHex,
    bar: brightHex
  };
}

const setActiveToggle = (viewName) => {
  toggleButtons.forEach((button) => {
    const active = button.getAttribute('data-view') === viewName;
    button.className = 'analytics-toggle flex-1 text-center py-2 rounded-full font-label-sm text-label-sm font-bold transition-all';
    if (active) {
      button.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
    } else {
      button.classList.add('text-on-surface-variant');
    }
  });
};

const syncTrendModeButtons = () => {
  trendModeButtons.forEach((btn) => {
    const active = btn.getAttribute('data-mode') === currentMonthlyTrendMode;
    btn.className = 'trend-mode-btn no-min-touch px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ' +
      (active ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant');
  });
};

const findPeakItem = (items) => {
  return (items || []).reduce((best, current) => {
    if (!best) return current;
    return Number(current.rawAmount || 0) > Number(best.rawAmount || 0) ? current : best;
  }, null);
};

const findLatestActiveItem = (items) => {
  const activeItems = (items || []).filter((item) => Number(item.rawAmount || 0) > 0);
  return activeItems[activeItems.length - 1] || null;
};

const updateSelectedBanner = (item) => {
  if (!item) {
    if (trendSelectedLabel) trendSelectedLabel.textContent = 'No transactions in this period yet';
    if (trendSelectedExpense) trendSelectedExpense.textContent = '';
    if (trendSelectedIncome) trendSelectedIncome.textContent = '';
    return;
  }
  if (trendSelectedLabel) trendSelectedLabel.textContent = item.detailLabel || item.label || '';
  if (trendSelectedExpense) trendSelectedExpense.textContent = '-' + (item.amount || 'KSh 0');
  if (trendSelectedIncome) trendSelectedIncome.textContent = '+' + (item.incomeAmount || 'KSh 0');
};

const renderTrendChart = (view, viewName) => {
  if (!trendBarsContainer) return;
  const hasModes = viewName === 'monthly' && view.trendModes;
  if (monthlyTrendModeWrap) {
    monthlyTrendModeWrap.classList.toggle('hidden', !hasModes);
    if (hasModes) {
      monthlyTrendModeWrap.classList.add('inline-flex');
      syncTrendModeButtons();
    }
  }

  const items = hasModes
    ? (view.trendModes[currentMonthlyTrendMode] || view.trend || [])
    : (view.trend || []);

  if (items.length === 0) {
    trendBarsContainer.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-on-surface-variant">No trend periods available.</div>';
    updateSelectedBanner(null);
    return;
  }

  if (selectedTrendIdx === null || selectedTrendIdx >= items.length) {
    let bestIdx = 0;
    let bestVal = -1;
    items.forEach((it, idx) => {
      const score = Number(it.rawAmount || 0) + Number(it.rawIncome || 0);
      if (score > bestVal) {
        bestVal = score;
        bestIdx = idx;
      }
    });
    selectedTrendIdx = bestIdx;
  }

  const isCompact = items.length > 14;
  const colWidthClass = isCompact
    ? 'min-w-[20px] flex-1'
    : items.length > 8
      ? 'min-w-[26px] flex-1'
      : 'flex-1 min-w-[34px]';

  trendBarsContainer.innerHTML = items.map((item, idx) => {
    const isSelected = idx === selectedTrendIdx;
    const hasExpense = Number(item.rawAmount || 0) > 0;
    const hasIncome = Number(item.rawIncome || 0) > 0;
    return \`
      <button type="button" data-trend-idx="\${idx}" class="no-min-touch \${colWidthClass} h-full flex flex-col items-center justify-end gap-1.5 py-1 px-0.5 rounded-xl transition-colors \${isSelected ? 'bg-surface-container-low ring-1 ring-[var(--action-primary)]' : ''}">
        <div class="w-full flex-1 flex items-end justify-center gap-0.5 px-0.5">
          <div class="w-2.5 sm:w-3 rounded-t-md transition-all duration-300" style="height:\${escape(item.height)}; background-color:\${hasExpense ? 'var(--action-primary)' : 'var(--surface-container-high)'}; opacity:\${hasExpense ? (isSelected ? '1' : '0.85') : '0.5'};"></div>
          \${hasIncome ? \`<div class="w-2 sm:w-2.5 rounded-t-md transition-all duration-300" style="height:\${escape(item.incomeHeight)}; background-color:var(--fin-income); opacity:\${isSelected ? '1' : '0.8'};"></div>\` : ''}
        </div>
        <span class="text-[9px] sm:text-[10px] font-bold truncate max-w-full \${isSelected ? 'text-[var(--action-primary)]' : 'text-on-surface-variant'}">\${escape(item.label)}</span>
      </button>
    \`;
  }).join('');

  updateSelectedBanner(items[selectedTrendIdx]);

  trendBarsContainer.querySelectorAll('[data-trend-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-trend-idx'));
      if (!isNaN(idx)) {
        selectedTrendIdx = idx;
        renderTrendChart(view, viewName);
      }
    });
  });
};

const renderAnalyticsCategories = (view, viewName) => {
  if (!analyticsCategoryList) return;
  const items = view.categories || [];
  const scopeWord = viewName === 'weekly' ? 'Weekly' : viewName === 'yearly' ? 'Yearly' : 'Monthly';
  if (analyticsCategoryScope) analyticsCategoryScope.textContent = scopeWord;
  if (analyticsCategorySubtitle) {
    analyticsCategorySubtitle.textContent = items.length > 0
      ? \`\${items.length} active spending categor\${items.length === 1 ? 'y' : 'ies'} in this report\`
      : \`Spending breakdown for \${view.periodTitle || scopeWord}\`;
  }

  if (items.length === 0) {
    analyticsCategoryList.innerHTML = \`
      <div class="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-5 text-center">
        <span class="material-symbols-outlined text-2xl text-outline mb-1 opacity-75">pie_chart</span>
        <p class="text-sm font-semibold text-on-surface">No category spending yet</p>
        <p class="mt-1 text-[11px] leading-4 text-on-surface-variant">Expenses logged during \${escape((view.periodTitle || 'this period').toLowerCase())} will break down here.</p>
      </div>\`;
    return;
  }

  analyticsCategoryList.innerHTML = items.map((item) => {
    const palette = getAdaptiveColors(item.color || item.foreground, item.background, item.foreground);
    const txMeta = item.txCount
      ? \`\${item.txCount} \${item.txCount === 1 ? 'txn' : 'txns'} · avg \${escape(item.avgAmount || '')}\`
      : \`\${item.percent}% of period spend\`;
    return \`
      <div class="rounded-2xl bg-surface-container-low border border-outline-variant p-3.5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border" style="background-color:\${palette.bg}; color:\${palette.fg}; border-color:\${palette.fg}26;">
              <span class="material-symbols-outlined text-[18px]">\${escape(item.icon)}</span>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-bold text-on-surface truncate">\${escape(item.name)}</p>
              <p class="text-[10px] sm:text-[11px] text-on-surface-variant truncate">\${txMeta}</p>
            </div>
          </div>
          <div class="text-right shrink-0">
            <p class="text-xs sm:text-sm font-extrabold text-on-surface">\${escape(item.amount)}</p>
            <span class="text-[10px] font-bold" style="color:\${palette.fg};">\${item.percent}%</span>
          </div>
        </div>
        <div class="w-full h-1.5 rounded-full overflow-hidden mt-2.5" style="background-color: var(--surface-container-high, #e2e8e2);">
          <div class="h-full rounded-full transition-all duration-500" style="width:\${Math.max(item.percent, 3)}%; background-color:\${palette.bar};"></div>
        </div>
      </div>\`;
  }).join('');
};

const renderCategoryBudgetStatuses = (view, viewName) => {
  if (!categoryBudgetStatusSection || !categoryBudgetStatusList) return;
  categoryBudgetStatusSection.classList.remove('hidden');
  if (budgetScopeBadge) {
    budgetScopeBadge.textContent = viewName === 'weekly' ? 'Weekly Pace' : viewName === 'yearly' ? 'Annualized' : 'Monthly';
  }

  const items = view.categoryBudgetStatuses || [];
  if (items.length === 0) {
    categoryBudgetStatusList.innerHTML = '<div class="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-4 text-center"><p class="text-sm font-semibold text-on-surface">No category budgets yet</p><p class="mt-1 text-[11px] leading-4 text-on-surface-variant">Set category budgets from Budget Settings to track limits across periods.</p></div>';
    return;
  }

  const toneStyles = {
    good: 'background-color: var(--fin-income-bg); color: var(--fin-income);',
    warning: 'background-color: var(--fin-warning-bg); color: var(--fin-warning);',
    over: 'background-color: var(--fin-expense-bg); color: var(--fin-expense);',
  };

  categoryBudgetStatusList.innerHTML = items.map((item) => {
    const palette = getAdaptiveColors(item.color || item.foreground, item.background, item.foreground);
    const barBg = item.statusKey === 'over' ? 'var(--fin-expense)' : palette.bar;
    return \`
      <div class="rounded-2xl bg-surface-container-low border border-outline-variant p-3.5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background-color:\${palette.bg};color:\${palette.fg};">
              <span class="material-symbols-outlined text-[18px]">\${escape(item.icon)}</span>
            </div>
            <div class="min-w-0">
              <p class="text-xs sm:text-sm font-semibold text-on-surface truncate">\${escape(item.categoryName)}</p>
              <p class="text-[11px] leading-4 text-on-surface-variant truncate">\${escape(item.spent)} of \${escape(item.budget)}</p>
            </div>
          </div>
          <span class="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]" style="\${toneStyles[item.statusKey] || toneStyles.good}">\${escape(item.statusLabel)}</span>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <div class="w-full rounded-full h-2 overflow-hidden" style="background-color: var(--surface-container-high);">
            <div class="h-2 rounded-full" style="width:\${item.progress}%;background-color:\${barBg};"></div>
          </div>
          <span class="text-[11px] font-semibold text-on-surface-variant shrink-0">\${escape(item.progressText)}</span>
        </div>
      </div>\`;
  }).join('');
};

const renderInsights = (view, viewName) => {
  if (!insightList) return;
  const items = view.trend || [];
  const activeItems = items.filter((item) => Number(item.rawAmount || 0) > 0);
  if (activeItems.length === 0) {
    insightList.innerHTML = '<div class="rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-4 text-center"><p class="text-sm font-semibold text-on-surface">No insights yet</p><p class="mt-1 text-[11px] leading-4 text-on-surface-variant">Add expenses in this timeframe to summarize peaks, averages, and savings rate.</p></div>';
    return;
  }

  const peakItem = findPeakItem(activeItems);
  const latestItem = findLatestActiveItem(items);
  const activeLabel = viewName === 'weekly' ? 'Days' : viewName === 'yearly' ? 'Months' : 'Weeks';
  const savingsRate = view.summary?.savingsRatePercent ?? 0;

  const insightCards = [
    {
      icon: 'local_fire_department',
      label: 'Peak Spend',
      value: peakItem?.amount || 'KSh 0',
      caption: peakItem?.detailLabel || peakItem?.label || 'No peak yet',
    },
    {
      icon: 'insights',
      label: 'Active ' + activeLabel,
      value: String(activeItems.length) + ' / ' + String(items.length),
      caption: 'Tracked slots with spending in ' + (view.periodTitle || 'period'),
    },
    {
      icon: 'savings',
      label: 'Savings Rate',
      value: (view.summary?.rawIncome || 0) > 0 ? String(savingsRate) + '%' : '—',
      caption: (view.summary?.rawIncome || 0) > 0
        ? (savingsRate >= 20 ? 'Healthy cash retention' : savingsRate >= 0 ? 'Positive net balance' : 'Expenses exceed income')
        : 'Log income to measure savings rate',
    },
    {
      icon: 'schedule',
      label: 'Latest Activity',
      value: latestItem?.amount || 'KSh 0',
      caption: latestItem?.detailLabel || latestItem?.label || 'No recent activity',
    },
  ];

  insightList.innerHTML = insightCards.map((item) => \`
    <div class="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-low border border-outline-variant px-4 py-3">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-9 h-9 rounded-xl bg-[var(--primary-container)] text-[var(--on-primary-container)] flex items-center justify-center shrink-0">
          <span class="material-symbols-outlined text-[18px]">\${escape(item.icon)}</span>
        </div>
        <div class="min-w-0">
          <p class="text-xs sm:text-sm font-semibold text-on-surface">\${escape(item.label)}</p>
          <p class="text-[11px] leading-4 text-on-surface-variant truncate">\${escape(item.caption)}</p>
        </div>
      </div>
      <p class="text-sm sm:text-base font-bold text-on-surface text-right shrink-0">\${escape(item.value)}</p>
    </div>\`).join('');
};

const renderView = (viewName) => {
  currentViewName = views[viewName] ? viewName : (views.monthly ? 'monthly' : 'weekly');
  selectedTrendIdx = null;
  const view = views[currentViewName] || views.monthly || views.weekly || {};

  setActiveToggle(currentViewName);
  if (headerRangePill) {
    headerRangePill.textContent = currentViewName === 'weekly' ? 'Weekly' : currentViewName === 'yearly' ? 'Yearly' : 'Monthly';
  }
  if (expenseNode) expenseNode.textContent = view.summary?.expenses || 'KSh 0';
  if (comparisonNode) comparisonNode.textContent = view.comparisonText || '';
  if (summaryCaptionNode) summaryCaptionNode.textContent = view.summaryCaption || '';
  if (periodChip) periodChip.textContent = view.periodTitle || (currentViewName === 'weekly' ? 'This Week' : currentViewName === 'yearly' ? 'This Year' : 'This Month');
  if (periodRangeLabel) periodRangeLabel.textContent = view.dateRangeLabel || '';
  if (heroNetNode) heroNetNode.textContent = view.metrics?.net || 'KSh 0';
  if (heroBudgetLabel) heroBudgetLabel.textContent = view.budgetScopeLabel || 'Budget';
  if (heroBudgetNode) heroBudgetNode.textContent = view.metrics?.budgetTarget || view.metrics?.budget || 'Not set';

  if (metricIncomeNode) metricIncomeNode.textContent = view.metrics?.income || 'KSh 0';
  if (metricIncomeCaptionNode) metricIncomeCaptionNode.textContent = view.metrics?.incomeCaption || '';
  if (metricNetNode) metricNetNode.textContent = view.metrics?.net || 'KSh 0';
  if (metricNetCaptionNode) metricNetCaptionNode.textContent = view.metrics?.netCaption || '';
  if (metricBudgetNode) metricBudgetNode.textContent = view.metrics?.budget || 'Not set';
  if (metricBudgetCaptionNode) metricBudgetCaptionNode.textContent = view.metrics?.budgetCaption || '';
  if (metricAverageLabelNode) metricAverageLabelNode.textContent = view.metrics?.averageLabel || 'Avg Spend';
  if (metricAverageNode) metricAverageNode.textContent = view.metrics?.average || 'KSh 0';
  if (metricAverageCaptionNode) metricAverageCaptionNode.textContent = view.metrics?.averageCaption || '';

  if (trendTitleNode) trendTitleNode.textContent = view.trendTitle || 'Spending & Income Trend';
  if (trendSubtitleNode) trendSubtitleNode.textContent = view.trendSubtitle || '';

  if (signalTopNameNode) signalTopNameNode.textContent = view.signals?.topCategoryName || 'No category data';
  if (signalTopAmountNode) signalTopAmountNode.textContent = view.signals?.topCategoryAmount || 'KSh 0';
  if (signalTopCaptionNode) signalTopCaptionNode.textContent = view.signals?.topCategoryCaption || '';
  if (signalLargestNameNode) signalLargestNameNode.textContent = view.signals?.largestExpenseName || 'No expense recorded';
  if (signalLargestAmountNode) signalLargestAmountNode.textContent = view.signals?.largestExpenseAmount || 'KSh 0';
  if (signalLargestCaptionNode) signalLargestCaptionNode.textContent = view.signals?.largestExpenseCaption || '';

  renderTrendChart(view, currentViewName);
  renderAnalyticsCategories(view, currentViewName);
  renderCategoryBudgetStatuses(view, currentViewName);
  renderInsights(view, currentViewName);
};

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    renderView(button.getAttribute('data-view') || 'monthly');
  });
});

trendModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentMonthlyTrendMode = button.getAttribute('data-mode') || 'weekly';
    selectedTrendIdx = null;
    renderTrendChart(views[currentViewName] || {}, currentViewName);
  });
});

document.addEventListener('xpense:theme-changed', () => {
  const view = views[currentViewName] || views.monthly || {};
  renderTrendChart(view, currentViewName);
  renderAnalyticsCategories(view, currentViewName);
  renderCategoryBudgetStatuses(view, currentViewName);
});

renderView(data.defaultView || 'monthly');
`;
}
