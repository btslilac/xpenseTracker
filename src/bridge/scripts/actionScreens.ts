import { sharedScript } from './shared'

export function addCategoryScript() {
  return `
${sharedScript()}
const data = window.__STITCH_DATA__ || {};
const isEdit = !!data.category;

let currentType = isEdit
  ? (data.category.type === 'income' ? 'income' : 'expense')
  : (data.routeParams?.defaultType === 'income' ? 'income' : 'expense');
let selectedIcon = isEdit ? data.category.icon : (currentType === 'income' ? 'payments' : 'restaurant');
let selectedColor = isEdit ? data.category.color : (currentType === 'income' ? '#1b6d24' : '#ba1a1a');

const showError = (message) => {
  const nameInput = document.getElementById('name-input');
  if (nameInput) {
    nameInput.classList.add('border-error', 'ring-1', 'ring-error');
    nameInput.classList.remove('border-outline-variant/60');
    nameInput.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
    setTimeout(() => { nameInput.style.animation = ''; }, 400);
  }
  if (window.__stitchToast) {
    window.__stitchToast(message, 'error', 3600);
  } else if (window.__stitchAlert) {
    window.__stitchAlert(message, 'Notice', 'error');
  }
};

const submitButton = [...document.querySelectorAll('button')].find(btn => ['Create Category', 'Update Category'].includes(window.__stitchText(btn)));
const nameInput = document.getElementById('name-input');
const typeButtons = [...document.querySelectorAll('button')].filter(btn => ['Expense', 'Income'].includes(window.__stitchText(btn)));
const iconButtons = document.querySelectorAll('button[data-icon]');
const colorButtons = document.querySelectorAll('button[data-color]');

const syncTypeButtons = () => {
  typeButtons.forEach(btn => {
    const text = window.__stitchText(btn).toLowerCase();
    const isActive = text === currentType;
    btn.className = 'flex-1 py-2 px-4 rounded-md font-label-sm text-label-sm transition-all duration-200 flex items-center justify-center';
    
    if (isActive) {
      btn.classList.add('shadow-sm', 'font-bold');
      if (currentType === 'expense') {
        btn.classList.add('bg-error', 'text-white', 'ring-1', 'ring-error');
      } else {
        btn.classList.add('bg-secondary', 'text-white');
      }
    } else {
      btn.classList.add('text-on-surface-variant', 'bg-surface-container', 'hover:bg-surface-container-high');
    }
  });
};

const syncIconSelection = () => {
  iconButtons.forEach(btn => {
    const icon = btn.getAttribute('data-icon');
    const isActive = icon === selectedIcon;
    const span = btn.querySelector('.material-symbols-outlined');
    
    if (isActive) {
      btn.className = 'aspect-square rounded-lg flex items-center justify-center bg-primary-fixed text-on-primary-fixed ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest transition-all shadow-sm';
      if (span) span.style.fontVariationSettings = '"FILL" 1';
      btn.style.borderColor = selectedColor;
    } else {
      btn.className = 'aspect-square rounded-lg flex items-center justify-center bg-surface-container-low text-on-surface hover:bg-surface-container transition-all';
      if (span) span.style.fontVariationSettings = '"FILL" 0';
      btn.style.borderColor = 'transparent';
    }
  });
};

const syncColorSelection = () => {
  colorButtons.forEach(btn => {
    const color = btn.getAttribute('data-color');
    const isActive = color.toLowerCase() === selectedColor.toLowerCase();
    
    btn.innerHTML = isActive ? '<span class="material-symbols-outlined text-white text-[20px]">check</span>' : '';
    btn.className = 'w-[44px] h-[44px] rounded-full shrink-0 flex items-center justify-center snap-center transition-all m-1';
    
    if (isActive) {
      btn.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'ring-offset-surface-container-lowest', 'shadow-md', 'scale-110');
    } else {
      btn.classList.add('shadow-sm', 'hover:scale-105');
    }
    btn.style.backgroundColor = color;
  });
};

// Event Listeners
typeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentType = window.__stitchText(btn).toLowerCase();
    syncTypeButtons();
  });
});

iconButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedIcon = btn.getAttribute('data-icon') || selectedIcon;
    syncIconSelection();
  });
});

colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedColor = btn.getAttribute('data-color') || selectedColor;
    syncColorSelection();
    syncIconSelection(); // Refresh icons if border color depends on it
  });
});

if (submitButton && nameInput) {
  submitButton.addEventListener('click', () => {
    const name = nameInput.value.trim();
    if (!name) {
      showError('Please enter a category name');
      return;
    }
    window.__stitchPost({
      type: isEdit ? 'category.update' : 'category.create',
      id: isEdit ? data.category.id : undefined,
      name,
      icon: selectedIcon,
      color: selectedColor,
      categoryType: currentType
    });
  });
}

const backButton = document.querySelector('header button');
if (backButton) {
  backButton.addEventListener('click', () => window.__stitchPost({ type: 'back' }));
}

// Initialize UI
if(isEdit) {
  const heading = document.querySelector('header h1');
  if(heading) heading.innerText = 'Edit Category';
  if(submitButton) submitButton.innerText = 'Update Category';
  if(nameInput) nameInput.value = data.category.name;
}

syncTypeButtons();
syncIconSelection();
syncColorSelection();
`
}

export function addExpenseScript() {
  return `
${sharedScript()}
const data=window.__STITCH_DATA__||{categories:[]};
const escape=window.__stitchEscape;
let type='expense';
const categoriesByType={
  expense:(data.categories||[]).filter((item)=>item.type==='expense'),
  income:(data.categories||[]).filter((item)=>item.type==='income'),
};
const selectedByType={
  expense:categoriesByType.expense[0]?.name||'',
  income:categoriesByType.income[0]?.name||'',
};

// Calendar Logic
let selectedDate = new Date();
let currentViewDate = new Date(selectedDate);
let confirmedDate = new Date(selectedDate);

const formatDate = (date) => {
  return date.toISOString();
};

const updateDateDisplay = () => {
  const display = document.getElementById('date-display');
  if (display) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    display.innerText = confirmedDate.toLocaleDateString(undefined, options);
  }
};

const typeButtons=[...document.querySelectorAll('button')].filter((node)=>['Expense','Income'].includes(window.__stitchText(node)));
const categoryGrid=document.getElementById('expense-category-grid');
const saveButton=[...document.querySelectorAll('button')].find((node)=>['Save Expense','Save Income'].includes(window.__stitchText(node)));

const syncTypeButtons=()=>{
  typeButtons.forEach((button)=>{
    const btnType=window.__stitchText(button).toLowerCase();
    const active=btnType===type;
    button.className = 'flex-1 py-2 px-4 rounded-md font-label-sm text-label-sm transition-colors';
    if(active){
      button.classList.add('shadow-sm');
      if(btnType==='expense'){
        button.classList.add('bg-tertiary-container','text-on-tertiary');
      }else{
        button.classList.add('bg-secondary','text-on-secondary');
      }
    }else{
      button.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high');
    }
  });
  if(saveButton){
    saveButton.textContent=type==='income' ? 'Save Income' : 'Save Expense';
  }
};

const renderCategories=()=>{
  if(!categoryGrid) return;
  const items=categoriesByType[type]||[];
  if(!selectedByType[type] && items[0]){
    selectedByType[type]=items[0].name;
  }
  if(items.length===0){
    categoryGrid.innerHTML='<div class="col-span-full rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-4 text-center text-sm text-on-surface-variant">No '+escape(type)+' categories yet.</div>';
    return;
  }
  categoryGrid.innerHTML=items.map((item)=>{
    const selected=item.name===selectedByType[type];
    const classes=selected
      ? 'flex min-h-[90px] w-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl border-2 px-2 py-2 shadow-sm transition-colors'
      : 'flex min-h-[90px] w-full min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-xl bg-surface-container-lowest border border-surface-container-high px-2 py-2 hover:bg-surface-container-low transition-colors';
    const style=selected
      ? 'background-color:'+item.background+';border-color:'+item.foreground+';'
      : '';
    const iconStyle=selected
      ? 'font-variation-settings: "FILL" 1;color:'+item.foreground+';'
      : 'color:'+item.foreground+';';
    return \`
      <button class="\${classes}" style="\${style}" data-category-name="\${escape(item.name)}">
        <span class="material-symbols-outlined shrink-0 text-[20px] leading-none" style="\${iconStyle}">\${escape(item.icon)}</span>
        <span class="w-full break-all text-center text-[11px] font-medium leading-4 tracking-normal text-on-surface">\${escape(item.name)}</span>
      </button>\`;
  }).join('');
  categoryGrid.querySelectorAll('[data-category-name]').forEach((button)=>{
    button.addEventListener('click',()=>{
      selectedByType[type]=button.getAttribute('data-category-name')||selectedByType[type];
      renderCategories();
    });
  });
};

typeButtons.forEach((button)=>{
  button.addEventListener('click',()=>{
    type=window.__stitchText(button).toLowerCase();
    syncTypeButtons();
    renderCategories();
  });
});

// Initialize UI
syncTypeButtons();
renderCategories();
updateDateDisplay();

const amountInput=document.getElementById('amount-input') || document.querySelector('input[inputmode="decimal"]') || document.querySelector('input[type="number"]');
if(amountInput){
  const originalPlaceholder=amountInput.placeholder;
  const clearInput=()=>{
    if(amountInput.value==='0') amountInput.value='';
    amountInput.placeholder='';
  };
  amountInput.addEventListener('focus',clearInput);
  amountInput.addEventListener('blur',()=>amountInput.placeholder=originalPlaceholder);
  if(document.activeElement===amountInput) clearInput();
}

const noteInput=document.getElementById('note-input') || [...document.querySelectorAll('input[type="text"]')].pop();

// Prefill support (from SMS detection or budget overrun)
if(stitchData.prefill || stitchData.prefillAmount){
  const prefillAmt = (stitchData.prefill && stitchData.prefill.amount) || stitchData.prefillAmount;
  const prefillNote = (stitchData.prefill && stitchData.prefill.note) || stitchData.prefillNote;
  if(prefillAmt && amountInput){
    amountInput.value = window.__stitchFormatCommas ? window.__stitchFormatCommas(prefillAmt) : String(prefillAmt);
  }
  if(prefillNote && noteInput){
    noteInput.value = prefillNote;
  }
}

// Date Picker Triggers
const dateTrigger = document.getElementById('date-trigger');
if (dateTrigger) {
  dateTrigger.onclick = () => {
    const isoVal = confirmedDate.getFullYear() + '-' + String(confirmedDate.getMonth() + 1).padStart(2, '0') + '-' + String(confirmedDate.getDate()).padStart(2, '0');
    if (window.__stitchDatePicker) {
      window.__stitchDatePicker({
        value: isoVal,
        title: 'Transaction Date',
        showPresets: true,
        onSelect: (iso) => {
          const picked = new Date(iso + 'T12:00:00');
          const now = new Date();
          confirmedDate = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
          updateDateDisplay();
        }
      });
    }
  };
}

if(saveButton){
  saveButton.addEventListener('click',()=>{
    const activeCategory=selectedByType[type] || categoriesByType[type][0]?.name || '';
    const cleanAmount = window.__stitchParseNumeric ? window.__stitchParseNumeric(amountInput && amountInput.value) : Number(String((amountInput && amountInput.value) || 0).replace(/,/g, ''));
    window.__stitchPost({
      type:'transaction.create',
      amount:cleanAmount,
      date:formatDate(confirmedDate),
      note:noteInput&&noteInput.value||'',
      category:activeCategory,
      transactionType:type
    });
  });
}

const backButton=document.querySelector('header button');
if(backButton){
  backButton.addEventListener('click',()=>window.__stitchPost({type:'back'}));
}
`
}
