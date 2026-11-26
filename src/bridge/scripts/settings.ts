import { sharedScript } from './shared'

export function personalInfoScript() {
  return `
${sharedScript()}
const data = window.__STITCH_DATA__ || {};
const fullNameInput = document.getElementById('full-name-input');
const emailInput = document.getElementById('email-input');
const phoneInput = document.getElementById('phone-input');
const dobDisplay = document.getElementById('dob-display');
const dateTrigger = document.getElementById('date-trigger');
const saveBtn = document.getElementById('btn-save-profile') || [...document.querySelectorAll('button')].find((node) => window.__stitchText(node) === 'Save Changes');

if (fullNameInput) fullNameInput.value = data.fullName || '';
if (emailInput) {
  emailInput.value = data.email || '';
  emailInput.setAttribute('readonly', 'true');
}
if (phoneInput) phoneInput.value = data.phoneNumber || '';

let confirmedDobIso = '';
if (data.dob) {
  const parsed = new Date(data.dob);
  if (!isNaN(parsed.getTime())) {
    const pad = (n) => (n < 10 ? '0' + n : String(n));
    confirmedDobIso = parsed.getFullYear() + '-' + pad(parsed.getMonth() + 1) + '-' + pad(parsed.getDate());
  }
}

const updateDateDisplay = () => {
  if (!dobDisplay) return;
  if (!confirmedDobIso) {
    dobDisplay.value = 'Select Date of Birth';
    return;
  }
  const parts = confirmedDobIso.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  dobDisplay.value = isNaN(d.getTime())
    ? 'Select Date of Birth'
    : d.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

if (dateTrigger) {
  dateTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof window.__stitchDatePicker === 'function') {
      window.__stitchDatePicker({
        title: 'Date of Birth',
        value: confirmedDobIso || '1995-01-01',
        minYear: 1920,
        maxYear: new Date().getFullYear(),
        maxDate: new Date().toISOString().slice(0, 10),
        showPresets: false,
        clearable: true,
        onSelect: (iso) => {
          confirmedDobIso = iso || '';
          updateDateDisplay();
        },
        onClear: () => {
          confirmedDobIso = '';
          updateDateDisplay();
        }
      });
    }
  });
}

let isSaving = false;
if (saveBtn) {
  saveBtn.addEventListener('click', () => {
    if (isSaving) return;
    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (fullName.length < 2) {
      if (typeof window.__stitchToast === 'function') {
        window.__stitchToast('Please enter your full name (at least 2 characters).', 'error');
      }
      if (fullNameInput) fullNameInput.focus();
      return;
    }

    if (phone && !/^[+\\d][\\d\\s()-]{5,20}$/.test(phone)) {
      if (typeof window.__stitchToast === 'function') {
        window.__stitchToast('Please enter a valid mobile number.', 'error');
      }
      if (phoneInput) phoneInput.focus();
      return;
    }

    isSaving = true;
    saveBtn.disabled = true;
    saveBtn.classList.add('opacity-70');
    setTimeout(() => {
      isSaving = false;
      saveBtn.disabled = false;
      saveBtn.classList.remove('opacity-70');
    }, 900);

    window.__stitchPost({
      type: 'settings.profile.save',
      fullName: fullName,
      email: emailInput ? emailInput.value : (data.email || ''),
      phoneNumber: phone,
      dob: confirmedDobIso ? new Date(confirmedDobIso + 'T12:00:00.000Z').toISOString() : ''
    });
  });
}

const deleteBtn = document.querySelector('[data-stitch-event="deleteAccount"]');
if (deleteBtn) {
  deleteBtn.addEventListener('click', () => {
    if (typeof window.__stitchConfirm === 'function') {
      window.__stitchConfirm({
        variant: 'danger',
        title: 'Delete Account?',
        message: 'Deleting your account removes your local ledger, budgets, categories, and loan records from this device. This cannot be undone.',
        confirmLabel: 'Delete Account',
        cancelLabel: 'Keep Account',
        onConfirm: () => window.__stitchPost({ type: 'settings.account.delete' })
      });
    } else {
      window.__stitchPost({ type: 'settings.account.delete' });
    }
  });
}

const back = document.querySelector('header button');
if (back) {
  back.addEventListener('click', () => window.__stitchPost({ type: 'back' }));
}

updateDateDisplay();
`
}

export function budgetScript() {
  return `
${sharedScript()}
const data=window.__STITCH_DATA__||{};
let categoryBudgets = data.categoryBudgets || [];
let selectedCategoryId = null;

function confirmDeleteBudget(id) {
  if (!id) return;
  if (window.__stitchConfirm) {
    window.__stitchConfirm({
      variant: 'danger',
      title: 'Delete Budget',
      message: 'Remove this category budget? This will stop tracking limits for this category.',
      confirmLabel: 'Yes, Delete',
      cancelLabel: 'Cancel',
      onConfirm: () => {
        categoryBudgets = categoryBudgets.filter(cb => cb.categoryId !== id);
        renderCategoryBudgets();
      }
    });
  } else {
    categoryBudgets = categoryBudgets.filter(cb => cb.categoryId !== id);
    renderCategoryBudgets();
  }
}

const range=document.getElementById('budget-slider');
const valueNode=document.getElementById('budget-value');
const manualInput = document.getElementById('manual-budget-input');

const renderBudget=()=>{
  if(valueNode && range){
    const value=Number(range.value||0);
    valueNode.textContent='\KSh '+new Intl.NumberFormat('en-KE').format(value);
  }
};

const updateSliderBackground=()=>{
  if(range){
    const min=Number(range.min||0);
    const max=Number(range.max||1000000);
    const val=Number(range.value);
    const percentage=((val-min)/(max-min))*100;
    range.style.background='linear-gradient(to right, var(--action-primary) 0%, var(--action-primary) ' + percentage + '%, var(--outline-variant) ' + percentage + '%, var(--outline-variant) 100%)';
  }
};

const renderCategoryPicker = () => {
  const grid = document.getElementById('category-picker-grid');
  if (!grid) return;
  const categories = (data.categories || []).filter(c => c.type === 'expense');
  if (categories.length === 0) {
    grid.innerHTML = '<div class="col-span-4 p-8 text-center text-on-surface-variant/60 text-xs italic bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/50">No categories found. Add some in Category Settings first.</div>';
    return;
  }
  
  grid.innerHTML = categories.map(c => {
    const isSelected = selectedCategoryId === c.id;
    return '<button class="category-item flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ' + (isSelected ? 'bg-primary/15 border-primary shadow-sm scale-105' : 'bg-surface-container-low border-transparent hover:bg-surface-container-high active:scale-95') + ' border-2" data-id="' + c.id + '">' +
      '<div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-sm pointer-events-none" style="background-color: ' + c.color + '20; color: ' + c.color + '">' +
        '<span class="material-symbols-outlined font-icon-lg">' + c.icon + '</span>' +
      '</div>' +
      '<span class="text-[11px] font-semibold text-on-surface truncate w-full text-center pointer-events-none">' + c.name + '</span>' +
    '</button>';
  }).join('');

  grid.querySelectorAll('.category-item').forEach(btn => {
    btn.onclick = () => {
      selectedCategoryId = btn.dataset.id;
      renderCategoryPicker();
    };
  });
};

const renderCategoryBudgets = () => {
  const list = document.getElementById('category-budgets-list');
  if (!list) return;
  if (categoryBudgets.length === 0) {
    list.innerHTML = '<div class="bg-surface-container-lowest rounded-xl p-card-padding shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-dashed border-outline-variant text-center py-8">' +
        '<p class="font-body-base text-body-base text-on-surface">No category budgets yet</p>' +
        '<p class="font-label-sm text-label-sm text-on-surface-variant mt-1 px-4">Allocate your overall budget to specific categories for better tracking.</p>' +
      '</div>';
    return;
  }

  list.innerHTML = categoryBudgets.map(cb => {
    const category = data.categories.find(c => c.id === cb.categoryId) || { name: 'Unknown', icon: 'help', color: '#888' };
    return '<div class="relative overflow-hidden rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)]">' +
        '<!-- Actions Layer -->' +
        '<div class="absolute inset-0 bg-indigo-900 flex items-center justify-end rounded-xl z-0">' +
          '<div class="flex h-full">' +
            '<button class="h-full px-5 text-white flex flex-col items-center justify-center gap-1 active:bg-indigo-700 transition-colors edit-cb-trigger relative z-20" data-id="' + cb.categoryId + '" data-amount="' + cb.amount + '">' +
              '<span class="material-symbols-outlined text-lg">edit</span>' +
              '<span class="text-[10px] font-bold">Edit</span>' +
            '</button>' +
            '<button class="h-full px-5 bg-error text-white flex flex-col items-center justify-center gap-1 active:bg-red-700 transition-colors delete-trigger relative z-20" data-id="' + cb.categoryId + '">' +
              '<span class="material-symbols-outlined text-lg">delete</span>' +
              '<span class="text-[10px] font-bold">Delete</span>' +
            '</button>' +
          '</div>' +
        '</div>' +
        '<!-- Card Layer -->' +
        '<div class="relative bg-surface-container-lowest rounded-xl p-card-padding flex items-center gap-4 touch-manipulation transition-transform duration-200 swipe-row z-10 border border-surface-container-highest" data-id="' + cb.categoryId + '" style="transform: translateX(0px);">' +
          '<div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style="background-color: ' + category.color + '20; color: ' + category.color + '">' +
            '<span class="material-symbols-outlined">' + category.icon + '</span>' +
          '</div>' +
          '<div class="flex-1 min-w-0 pointer-events-none">' +
            '<div class="flex justify-between items-baseline mb-0.5">' +
              '<span class="font-body-base text-body-base font-semibold text-on-surface truncate pr-2">' + category.name + '</span>' +
              '<span class="font-label-sm text-label-sm text-on-surface-variant shrink-0">Limit: \KSh ' + new Intl.NumberFormat('en-KE').format(cb.amount) + '</span>' +
            '</div>' +
            '<div class="w-full bg-surface-variant rounded-full h-1"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }).join('');

  // Swipe Logic Initialization
  let startX = 0;
  let currentX = 0;
  let activeRow = null;

  list.querySelectorAll('.swipe-row').forEach(row => {
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
      if(diff < 0 && diff > -180) { // Increased range for 2 buttons
        row.style.transform = 'translateX(' + diff + 'px)';
        currentX = diff;
      }
    });

    row.addEventListener('touchend', () => {
      row.style.transition = 'transform 0.2s ease-out';
      if(currentX < -60) {
        row.style.transform = 'translateX(-140px)'; // Shows both buttons
        activeRow = row;
      } else {
        row.style.transform = 'translateX(0px)';
        activeRow = null;
      }
      currentX = 0;
    });
  });

  list.querySelectorAll('.delete-trigger').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      confirmDeleteBudget(id);
    };
  });

  list.querySelectorAll('.edit-cb-trigger').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const amount = btn.getAttribute('data-amount');
      selectedCategoryId = id;
      const modal = document.getElementById('category-modal');
      const amountInput = document.getElementById('modal-category-amount');
      if (modal && amountInput) {
        amountInput.value = amount;
        renderCategoryPicker();
        modal.classList.remove('hidden');
        // Reset swipe
        if (activeRow) {
          activeRow.style.transform = 'translateX(0px)';
          activeRow = null;
        }
      }
    };
  });
};

if(range){
  range.min='0';
  range.max='1000000';
  range.value=String(data.budgetConfigured ? (data.monthlyBudget || 0) : 0);
  range.addEventListener('input',()=>{
    renderBudget();
    updateSliderBackground();
  });
  renderBudget();
  updateSliderBackground();
}

// Manual Input Logic
const trigger = document.getElementById('manual-budget-trigger');
const sliderView = document.getElementById('slider-view');
const manualView = document.getElementById('manual-view');
const manualCancel = document.getElementById('manual-cancel');
const manualSave = document.getElementById('manual-save');

if (trigger && sliderView && manualView && manualInput) {
  trigger.onclick = () => {
    sliderView.classList.add('hidden');
    manualView.classList.remove('hidden');
    manualInput.value = range.value;
    manualInput.focus();
  };
}

if (manualCancel && sliderView && manualView) {
  manualCancel.onclick = () => {
    manualView.classList.add('hidden');
    sliderView.classList.remove('hidden');
  };
}

if (manualSave && manualInput && range && sliderView && manualView) {
  manualSave.onclick = () => {
    const val = window.__stitchParseNumeric ? window.__stitchParseNumeric(manualInput.value) : Number(String(manualInput.value || 0).replace(/,/g, ''));
    if (!isNaN(val) && val >= 0 && val <= 1000000) {
      range.value = String(val);
      renderBudget();
      updateSliderBackground();
      manualView.classList.add('hidden');
      sliderView.classList.remove('hidden');
    }
  };
}

// Category Modal Logic
const addCategoryBtn = document.getElementById('add-category-budget-btn');
const categoryModal = document.getElementById('category-modal');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalSaveBtn = document.getElementById('modal-save-btn');
const modalAmountInput = document.getElementById('modal-category-amount');

if (addCategoryBtn && categoryModal) {
  addCategoryBtn.onclick = () => {
    selectedCategoryId = null;
    modalAmountInput.value = '';
    renderCategoryPicker();
    categoryModal.classList.remove('hidden');
  };
}

if (modalCancelBtn && categoryModal) {
  modalCancelBtn.onclick = () => {
    categoryModal.classList.add('hidden');
  };
}

if (modalSaveBtn && categoryModal && modalAmountInput) {
  modalSaveBtn.onclick = () => {
    const amount = window.__stitchParseNumeric ? window.__stitchParseNumeric(modalAmountInput.value) : Number(String(modalAmountInput.value || 0).replace(/,/g, ''));
    if (selectedCategoryId && !isNaN(amount) && amount > 0) {
      // Upsert
      const existingIdx = categoryBudgets.findIndex(cb => cb.categoryId === selectedCategoryId);
      if (existingIdx >= 0) {
        categoryBudgets[existingIdx].amount = amount;
      } else {
        categoryBudgets.push({ categoryId: selectedCategoryId, amount });
      }
      renderCategoryBudgets();
      categoryModal.classList.add('hidden');
    }
  };
}

// Initial category budgets render
renderCategoryBudgets();

const mainSave = document.getElementById('main-save-budget-btn');
if (mainSave && range) {
  mainSave.onclick = () => {
    window.__stitchPost({
      type: 'settings.budget.save',
      monthlyBudget: Number(range.value || 0),
      categoryBudgets: categoryBudgets
    });
  };
}

const back=document.querySelector('header button');
if(back){
  back.addEventListener('click', () => {
    window.__stitchPost({
      type: 'settings.budget.save',
      monthlyBudget: Number(range?.value || 0),
      categoryBudgets: categoryBudgets
    });
  });
}
`
}

export function notificationsScript() {
  return `
${sharedScript()}
const data = window.__STITCH_DATA__ || {};
const toggle1 = document.getElementById('toggle1');
const toggle2 = document.getElementById('toggle2');
const toggle3 = document.getElementById('toggle3');
const toggleSms = document.getElementById('toggle-sms-detection');
const notifBadge = document.getElementById('perm-notif-status');
const smsBadge = document.getElementById('perm-sms-status');
const manageBtn = document.getElementById('btn-manage-os-perms');
const manageLabel = document.getElementById('btn-manage-os-label');
const refreshBtn = document.getElementById('btn-refresh-perms');

if (toggle1) toggle1.checked = !!data.billReminders;
if (toggle2) toggle2.checked = !!data.weeklyDigest;
if (toggle3) toggle3.checked = data.loanReminders !== false;
if (toggleSms) {
  toggleSms.checked = Boolean(data.smsTransactionDetection);
  toggleSms.addEventListener('change', () => {
    window.__stitchPost({
      type: 'settings.sms.toggle',
      enabled: toggleSms.checked
    });
  });
}

const renderPermissionPills = (perms) => {
  const os = perms || {};
  const notifGranted = Boolean(os.notificationsGranted);
  const smsGranted = Boolean(os.smsGranted);
  const isAndroid = (os.platform || 'android') === 'android';

  if (notifBadge) {
    notifBadge.textContent = notifGranted ? 'Allowed' : 'Disabled';
    notifBadge.className = notifGranted
      ? 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
      : 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300';
  }
  if (smsBadge) {
    if (!isAndroid) {
      smsBadge.textContent = 'Android Only';
      smsBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-surface-variant';
    } else if (smsGranted) {
      smsBadge.textContent = 'Allowed';
      smsBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    } else {
      smsBadge.textContent = 'Not Granted';
      smsBadge.className = 'px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300';
    }
  }
  if (manageBtn && manageLabel) {
    const missingNotif = !notifGranted;
    const missingSms = isAndroid && !smsGranted;
    if (missingNotif || missingSms) {
      manageBtn.classList.remove('hidden');
      manageLabel.textContent = missingNotif && missingSms
        ? 'Grant Notification & SMS Access'
        : (missingNotif ? 'Enable OS Notifications' : 'Grant SMS Read Access');
    } else {
      manageBtn.classList.add('hidden');
    }
  }
};

window.__stitchUpdateNotificationPerms = renderPermissionPills;
window.__stitchSetSmsToggleState = function(enabled) {
  if (toggleSms) toggleSms.checked = Boolean(enabled);
};
renderPermissionPills(data.osPermissions);

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    window.__stitchPost({ type: 'notifications.permissions.refresh' });
  });
}

if (manageBtn) {
  manageBtn.addEventListener('click', () => {
    window.__stitchPost({ type: 'notifications.permissions.request' });
  });
}

const save = document.getElementById('btn-save-notifications') || [...document.querySelectorAll('button')].find((node) => window.__stitchText(node) === 'Save Preferences');
if (save) {
  save.addEventListener('click', () => {
    save.disabled = true;
    save.classList.add('opacity-70');
    setTimeout(() => {
      save.disabled = false;
      save.classList.remove('opacity-70');
    }, 700);
    window.__stitchPost({
      type: 'settings.notifications.save',
      billReminders: !!(toggle1 && toggle1.checked),
      weeklyDigest: !!(toggle2 && toggle2.checked),
      unusualSpendAlerts: !!data.unusualSpendAlerts,
      loanReminders: !!(toggle3 && toggle3.checked),
      smsTransactionDetection: !!(toggleSms && toggleSms.checked)
    });
  });
}

const back = document.querySelector('header button');
if (back) {
  back.addEventListener('click', () => window.__stitchPost({ type: 'back' }));
}
`
}

export function helpSupportScript() {
  return `
${sharedScript()}
const data = window.__STITCH_DATA__ || {};
const emailNode = document.getElementById('help-user-email');
if (emailNode) {
  emailNode.textContent = data.email || 'your signed-in account';
}

const searchInput = document.getElementById('help-search-input');
const faqCount = document.getElementById('help-faq-count');
const emptyState = document.getElementById('help-search-empty');
const items = [...document.querySelectorAll('[data-help-item]')];

const setAccordionState = (targetItem, open) => {
  const answer = targetItem.querySelector('[data-help-answer]');
  const icon = targetItem.querySelector('[data-help-icon]');
  if (answer) answer.classList.toggle('hidden', !open);
  if (icon) icon.textContent = open ? 'remove' : 'add';
};

items.forEach((item, index) => {
  const toggle = item.querySelector('[data-help-toggle]');
  const answer = item.querySelector('[data-help-answer]');
  if (!toggle || !answer) return;

  if (index === 0) {
    setAccordionState(item, true);
  }

  toggle.addEventListener('click', () => {
    const isOpen = !answer.classList.contains('hidden');
    items.forEach((entry) => setAccordionState(entry, false));
    if (!isOpen) setAccordionState(item, true);
  });
});

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const keywords = (item.getAttribute('data-help-keywords') || '').toLowerCase();
      const text = (item.textContent || '').toLowerCase();
      const matches = !query || keywords.includes(query) || text.includes(query);
      item.style.display = matches ? '' : 'none';
      if (matches) {
        visible++;
        if (query) setAccordionState(item, true);
      }
    });
    if (faqCount) {
      faqCount.textContent = visible + ' ' + (visible === 1 ? 'topic' : 'topics');
    }
    if (emptyState) {
      emptyState.classList.toggle('hidden', visible > 0);
    }
  });
}

const emailBtn = document.getElementById('btn-help-email');
if (emailBtn) {
  emailBtn.addEventListener('click', () => {
    window.__stitchPost({
      type: 'help.email.support',
      email: data.email || ''
    });
  });
}

const copyBtn = document.getElementById('btn-help-copy-email');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const address = 'support@xpensetracker.app';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(address);
      }
      if (typeof window.__stitchToast === 'function') {
        window.__stitchToast('Support email copied: ' + address, 'success');
      }
    } catch {
      window.__stitchPost({ type: 'help.copy.email', value: address });
    }
  });
}

const back = document.querySelector('header button');
if (back) {
  back.addEventListener('click', () => window.__stitchPost({ type: 'back' }));
}
`
}
