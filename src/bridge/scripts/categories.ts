import { sharedScript } from './shared'

export function categoriesScript() {
  return `
${sharedScript()}
const data = window.__STITCH_DATA__ || {};
const escape = window.__stitchEscape || ((v) => String(v == null ? '' : v));

let filterType = 'all'; // 'all' | 'expense' | 'income'
let sortMode = 'custom'; // 'custom' | 'az' | 'za'
let searchQuery = '';

const cards = document.getElementById('categories-list-container');
const countBadge = document.getElementById('categories-count-badge');
const tabAll = document.getElementById('cat-tab-all');
const tabExpense = document.getElementById('cat-tab-expense');
const tabIncome = document.getElementById('cat-tab-income');
const searchInput = document.getElementById('cat-search-input');
const sortSelect = document.getElementById('cat-sort-select');
const reorderHint = document.getElementById('cat-reorder-hint');

function confirmDeleteCategory(id, name) {
  if (!id) return;
  if (window.__stitchConfirm) {
    window.__stitchConfirm({
      variant: 'danger',
      title: 'Delete Category',
      message: 'Delete "' + (name || 'this category') + '"? Categories linked to existing transactions are protected until those transactions are removed or reassigned.',
      confirmLabel: 'Yes, Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        window.__stitchPost({ type: 'category.delete', id });
      }
    });
  } else {
    window.__stitchPost({ type: 'category.delete', id });
  }
}

function syncTabUI() {
  const activeCls = 'py-2 px-3 rounded-xl text-xs font-bold transition-all bg-primary text-on-primary shadow-sm';
  const inactiveCls = 'py-2 px-3 rounded-xl text-xs font-bold transition-all text-on-surface-variant';
  if (tabAll) tabAll.className = filterType === 'all' ? activeCls : inactiveCls;
  if (tabExpense) tabExpense.className = filterType === 'expense' ? activeCls : inactiveCls;
  if (tabIncome) tabIncome.className = filterType === 'income' ? activeCls : inactiveCls;
}

let sortableInstance = null;

function renderCategories() {
  if (!cards) return;
  const raw = Array.isArray(data.categories) ? data.categories.slice() : [];
  const q = searchQuery.trim().toLowerCase();

  let filtered = raw.filter((item) => {
    const itemType = String(item.type || '').toLowerCase() === 'income' ? 'income' : 'expense';
    if (filterType !== 'all' && itemType !== filterType) return false;
    if (q && String(item.name || '').toLowerCase().indexOf(q) === -1) return false;
    return true;
  });

  if (sortMode === 'az') {
    filtered.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  } else if (sortMode === 'za') {
    filtered.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
  }

  const canReorder = filterType === 'all' && sortMode === 'custom' && !q;
  if (reorderHint) {
    reorderHint.textContent = canReorder
      ? 'Drag the handle to reorder, tap edit to update, or swipe left to delete.'
      : 'Clear filters and switch to Custom Order to drag-reorder categories.';
  }
  if (countBadge) {
    countBadge.textContent = filtered.length + (filtered.length === 1 ? ' category' : ' categories');
  }

  if (sortableInstance) {
    try { sortableInstance.destroy(); } catch (e) {}
    sortableInstance = null;
  }

  if (filtered.length === 0) {
    cards.innerHTML = \`
      <div class="md:col-span-2 bg-surface-container-lowest rounded-2xl p-8 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-dashed border-outline-variant text-center">
        <div class="w-14 h-14 mx-auto rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
          <span class="material-symbols-outlined">category</span>
        </div>
        <h3 class="font-title-lg text-base font-bold text-on-surface">\${raw.length === 0 ? 'No categories yet' : 'No matching categories'}</h3>
        <p class="text-xs text-on-surface-variant mt-1">\${raw.length === 0 ? 'Create your first category to start classifying your expenses and income.' : 'Try adjusting your search or selected category type tab.'}</p>
      </div>\`;
    return;
  }

  cards.innerHTML = filtered.map((item) => {
    const isIncome = String(item.type || '').toLowerCase() === 'income';
    const typeBadgeCls = isIncome
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
      : 'bg-rose-500/12 text-rose-700 dark:text-rose-300';
    return \`
      <div class="relative overflow-hidden rounded-xl">
        <div class="absolute inset-0 bg-error flex items-center justify-end rounded-xl z-0">
          <button class="h-full px-5 text-white flex flex-col items-center justify-center gap-1 active:bg-red-700 transition-colors delete-trigger relative z-20" data-id="\${escape(item.id)}" data-name="\${escape(item.name)}">
            <span class="material-symbols-outlined text-[20px]">delete</span>
            <span class="text-[10px] font-bold">Delete</span>
          </button>
        </div>
        <div class="relative bg-surface-container-lowest rounded-xl p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-outline-variant/30 flex items-center justify-between gap-3 group touch-manipulation transition-transform duration-200 swipe-row z-10" data-id="\${escape(item.id)}" style="transform: translateX(0px);">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            \${canReorder ? '<button type="button" class="text-outline hover:text-on-background cursor-grab active:cursor-grabbing p-1 drag-handle shrink-0"><span class="material-symbols-outlined text-[20px]">drag_indicator</span></button>' : ''}
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background-color:\${escape(item.background)};color:\${escape(item.foreground)};">
              <span class="material-symbols-outlined">\${escape(item.icon)}</span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="text-[15px] font-bold text-on-surface truncate">\${escape(item.name)}</h3>
              <span class="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold \${typeBadgeCls}">\${escape(isIncome ? 'Income' : 'Expense')}</span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button type="button" class="text-outline-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container edit-trigger" data-id="\${escape(item.id)}" aria-label="Edit Category">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
          </div>
        </div>
      </div>\`;
  }).join('');

  let startX = 0;
  let currentX = 0;
  let activeRow = null;

  document.querySelectorAll('.swipe-row').forEach((row) => {
    row.addEventListener('touchstart', (e) => {
      if (activeRow && activeRow !== row) activeRow.style.transform = 'translateX(0px)';
      startX = e.touches[0].clientX;
      row.style.transition = 'none';
    });

    row.addEventListener('touchmove', (e) => {
      const diff = e.touches[0].clientX - startX;
      if (diff < 0 && diff > -100) {
        row.style.transform = \`translateX(\${diff}px)\`;
        currentX = diff;
      }
    });

    row.addEventListener('touchend', () => {
      row.style.transition = 'transform 0.2s ease-out';
      if (currentX < -50) {
        row.style.transform = 'translateX(-80px)';
        activeRow = row;
      } else {
        row.style.transform = 'translateX(0px)';
        activeRow = null;
      }
      currentX = 0;
    });
  });

  document.querySelectorAll('.edit-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      window.__stitchPost({ type: 'navigate', route: 'editCategory', id });
    });
  });

  document.querySelectorAll('.delete-trigger').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteCategory(btn.getAttribute('data-id'), btn.getAttribute('data-name'));
    });
  });

  if (canReorder && window.Sortable) {
    sortableInstance = new window.Sortable(cards, {
      handle: '.drag-handle',
      animation: 150,
      ghostClass: 'opacity-50',
      onEnd: function() {
        const ids = [...cards.querySelectorAll('.swipe-row')].map((el) => el.getAttribute('data-id')).filter(Boolean);
        window.__stitchPost({ type: 'category.reorder', ids });
      }
    });
  }
}

if (tabAll) tabAll.addEventListener('click', () => { filterType = 'all'; syncTabUI(); renderCategories(); });
if (tabExpense) tabExpense.addEventListener('click', () => { filterType = 'expense'; syncTabUI(); renderCategories(); });
if (tabIncome) tabIncome.addEventListener('click', () => { filterType = 'income'; syncTabUI(); renderCategories(); });
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value || '';
    renderCategories();
  });
}
if (sortSelect) {
  sortSelect.addEventListener('change', (e) => {
    sortMode = e.target.value || 'custom';
    renderCategories();
  });
}

function openAddCategoryForTab() {
  const defaultType = filterType === 'income' ? 'income' : 'expense';
  window.__stitchPost({ type: 'navigate', route: 'addCategory', defaultType });
}

document.getElementById('btn-add-new-category')?.addEventListener('click', openAddCategoryForTab);
document.getElementById('header-add-category-btn')?.addEventListener('click', openAddCategoryForTab);

syncTabUI();
renderCategories();
`;
}
