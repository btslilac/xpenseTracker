import { sharedScript } from './shared'

export function transactionsScript() {
  return `
${sharedScript()}
function confirmDeleteTransaction(id) {
  if (!id) return;
  if (window.__stitchConfirm) {
    window.__stitchConfirm({
      variant: 'danger',
      title: 'Delete Transaction',
      message: 'Are you sure you want to delete this transaction record? This action cannot be undone.',
      confirmLabel: 'Yes, Delete',
      cancelLabel: 'Cancel',
      onConfirm: function() {
        window.__stitchPost({ type: 'transaction.delete', id });
      }
    });
  } else {
    window.__stitchPost({ type: 'transaction.delete', id });
  }
}

const data=window.__STITCH_DATA__;
const escape=window.__stitchEscape;
let search='';
let filter='All';
let selectedDate = null; // YYYY-MM-DD

const renderChips=()=>{
  const container=document.getElementById('filter-chips-container');
  if(!container) return;
  
  const chips = [
    { id: 'All', label: 'All' },
    { id: 'Expenses', label: 'Expenses' },
    { id: 'Income', label: 'Income' },
    ...(data.categories || []).map(c => ({ id: c.id, label: c.name }))
  ];

  container.innerHTML = chips.map(chip => {
    const isActive = filter === chip.id;
    const activeClasses = 'bg-primary text-white font-bold shadow-sm';
    const inactiveClasses = 'bg-surface-container text-on-surface-variant font-semibold border border-outline-variant';
    
    return \`
      <button 
        onclick="setFilter('\${chip.id}')"
        class="whitespace-nowrap px-4 py-2 rounded-full transition-all active:scale-95 font-label-sm text-label-sm \${isActive ? activeClasses : inactiveClasses}"
      >
        \${escape(chip.label)}
      </button>
    \`;
  }).join('');
};

window.setFilter = (newFilter) => {
  filter = newFilter;
  renderChips();
  render();
};

const render=()=>{
  const groups=data.groups.map((group)=>({
    ...group,
    items:group.items.filter((item)=>{
      const matchesSearch=(item.title+' '+item.subtitle).toLowerCase().includes(search.toLowerCase());
      const matchesFilter=filter==='All' || item.filter===filter || item.categoryId===filter;
      
      let matchesDate = true;
      if (selectedDate) {
        const itemLocal = new Date(item.date);
        const itemDateStr = itemLocal.getFullYear() + '-' + String(itemLocal.getMonth() + 1).padStart(2, '0') + '-' + String(itemLocal.getDate()).padStart(2, '0');
        matchesDate = itemDateStr === selectedDate;
      }
      
      return matchesSearch && matchesFilter && matchesDate;
    })
  })).filter((group)=>group.items.length>0);
  
  const container=document.getElementById('transactions-list-container');
  if(!container) return;
  
  if (groups.length === 0) {
    container.innerHTML = \`
      <div class="text-center py-20 bg-surface-container-lowest rounded-[24px] border border-dashed border-outline-variant">
          <div class="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-outline text-3xl">receipt_long</span>
          </div>
          <p class="text-on-surface-variant font-medium">No transactions found.</p>
          <p class="text-xs text-outline mt-1">Your spending history will appear here.</p>
      </div>\`;
    return;
  }
  
  container.innerHTML=groups.map((group)=>\`
    <div>
      <h2 class="font-label-sm text-label-sm text-outline mb-3 uppercase tracking-wider">\${group.label}</h2>
      <div class="space-y-3">
        \${group.items.map((item)=>\`
          <div class="relative overflow-hidden rounded-xl mb-3">
            <!-- Delete Layer -->
            <div class="absolute inset-0 bg-error flex items-center justify-end rounded-xl z-0">
              <button class="h-full px-6 text-white flex flex-col items-center justify-center gap-1 active:bg-red-700 transition-colors delete-trigger relative z-20" data-id="\${item.id}">
                <span class="material-symbols-outlined">delete</span>
                <span class="text-[10px] font-bold">Delete</span>
              </button>
            </div>
            <!-- Card Layer -->
            <div class="relative bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex items-center justify-between group touch-manipulation transition-transform duration-200 swipe-row z-10 border border-surface-container-highest" data-id="\${item.id}" style="transform: translateX(0px);">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center" style="background-color:\${item.background};color:\${item.foreground};">
                  <span class="material-symbols-outlined">\${escape(item.icon)}</span>
                </div>
                <div>
                  <h3 class="font-title-lg text-[16px] text-on-surface">\${escape(item.title)}</h3>
                  <p class="font-label-sm text-label-sm text-on-surface-variant">\${escape(item.subtitle)}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="font-title-lg text-[16px] \${item.kind==='expense'?'text-error':'text-secondary'} font-bold">\${escape(item.amount)}</span>
              </div>
            </div>
          </div>\`).join('')}
      </div>
    </div>\`).join('');

  // Swipe Logic Implementation
  let startX = 0;
  let currentX = 0;
  let activeRow = null;

  document.querySelectorAll('.swipe-row').forEach(row => {
    row.addEventListener('touchstart', (e) => {
      if(activeRow && activeRow !== row) {
        activeRow.style.transition = 'transform 0.2s ease-out';
        activeRow.style.transform = 'translateX(0px)';
      }
      startX = e.touches[0].clientX;
      row.style.transition = 'none';
      activeRow = null;
    });

    row.addEventListener('touchmove', (e) => {
      const diff = e.touches[0].clientX - startX;
      if(diff < 0 && diff > -100) {
        row.style.transform = \`translateX(\${diff}px)\`;
        currentX = diff;
      }
    });

    row.addEventListener('touchend', () => {
      row.style.transition = 'transform 0.2s ease-out';
      if(currentX < -50) {
        row.style.transform = 'translateX(-80px)';
        activeRow = row;
      } else {
        row.style.transform = 'translateX(0px)';
        activeRow = null;
      }
      currentX = 0;
    });
  });

  // Delete Action Handlers
  document.querySelectorAll('.delete-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      confirmDeleteTransaction(id);
    });
  });
}

// --- Listeners ---
const searchInput=document.querySelector('input[type="text"]');
if(searchInput){
  searchInput.addEventListener('input',(event)=>{
    search=event.target.value||'';
    render();
  });
}

document.getElementById('date-filter-btn')?.addEventListener('click', () => {
  if (window.__stitchDatePicker) {
    window.__stitchDatePicker({
      value: selectedDate || '',
      title: 'Filter by Date',
      showPresets: true,
      clearable: true,
      onSelect: (iso) => {
        selectedDate = iso;
        const clearDateBtn = document.getElementById('clear-date-btn');
        if (clearDateBtn) clearDateBtn.classList.remove('hidden');
        render();
      },
      onClear: () => {
        selectedDate = null;
        const clearDateBtn = document.getElementById('clear-date-btn');
        if (clearDateBtn) clearDateBtn.classList.add('hidden');
        render();
      }
    });
  }
});

document.getElementById('clear-date-btn')?.addEventListener('click', function() {
  selectedDate = null;
  this.classList.add('hidden');
  render();
});

renderChips();
render();
`;
}
