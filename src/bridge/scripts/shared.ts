export function sharedScript() {
  return `
const stitchData=window.__STITCH_DATA__||{};
const post=(payload)=>window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(payload));
const textOf=(node)=>((node&&node.textContent)||'').replace(/\\s+/g,' ').trim();
const escapeHtml=(value)=>String(value ?? '').replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const avatarUrl=String(stitchData.avatarUrl||'').trim();
if(avatarUrl){
  document.querySelectorAll('img[alt*="User"], img[alt*="Avatar"], img[alt*="Profile"]').forEach((img)=>{
    img.setAttribute('src',avatarUrl);
    img.style.display='block';
    const parent=img.parentElement;
    if(!parent) return;
    parent.classList.remove('bg-surface-container-high','flex','items-center','justify-center','text-primary');
    parent.querySelectorAll('.material-symbols-outlined').forEach((icon)=>{
      if(icon.textContent==='person'){
        icon.remove();
      }
    });
  });
}
document.querySelectorAll('[data-stitch-event]').forEach((node)=>{
  node.addEventListener('click',(event)=>{
    event.preventDefault();
    event.stopPropagation();
    const eventType=node.getAttribute('data-stitch-event');
    if(eventType){
      post({type:eventType});
    }
  });
});
document.querySelectorAll('[data-stitch-route]').forEach((node)=>{
  node.addEventListener('click',(event)=>{
    event.preventDefault();
    event.stopPropagation();
    const route=node.getAttribute('data-stitch-route');
    if(route){
      post({type:'navigate',route});
    }
  });
});
const legacyNavRoutes={
  home:'dashboard',
  analytics:'analytics',
  add:'addExpense',
  add_circle:'addExpense',
  history:'transactions',
  person:'profile',
};
document.querySelectorAll('nav a[href="#"]:not([data-stitch-route])').forEach((node)=>{
  const iconNode=node.querySelector('.material-symbols-outlined[data-icon]');
  const iconName=(iconNode&&iconNode.getAttribute('data-icon'))||'';
  const route=legacyNavRoutes[iconName];
  if(!route) return;
  node.addEventListener('click',(event)=>{
    event.preventDefault();
    event.stopPropagation();
    post({type:'navigate',route});
  });
});
window.__stitchPost=post;
window.__stitchText=textOf;
window.__stitchEscape=escapeHtml;

// ── Universal Numeric & Currency Input Formatter ──────────────────────────────
function __formatNumberWithCommas(rawStr) {
  if (rawStr === null || rawStr === undefined) return '';
  var clean = String(rawStr).replace(/[^\\d.]/g, '');
  if (!clean) return '';
  var parts = clean.split('.');
  var intPart = parts[0] || '';
  if (/^0\\d+/.test(intPart)) {
    intPart = intPart.replace(/^0+/, '');
    if (!intPart) intPart = '0';
  }
  var formattedInt = intPart ? intPart.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',') : (clean.startsWith('.') ? '0' : '');
  if (parts.length > 1) {
    var decPart = parts.slice(1).join('');
    return (formattedInt || '0') + '.' + decPart;
  }
  if (clean.endsWith('.')) {
    return (formattedInt || '0') + '.';
  }
  return formattedInt;
}

function __parseCleanNumeric(val) {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  var str = String(val).replace(/,/g, '').trim();
  var num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function __setupNumericInput(input) {
  if (!input || input.__numericSetupDone || input.readOnly || input.hasAttribute('readonly')) return;
  input.__numericSetupDone = true;
  try {
    input.type = 'text';
  } catch (e) {}
  input.setAttribute('inputmode', 'decimal');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('autocorrect', 'off');
  input.setAttribute('autocapitalize', 'off');
  input.setAttribute('spellcheck', 'false');

  if (input.value) {
    var initialFormatted = __formatNumberWithCommas(input.value);
    if (input.value !== initialFormatted) {
      input.value = initialFormatted;
    }
  }

  var lastValue = String(input.value || '');

  input.addEventListener('focus', function() {
    if (String(input.value || '') === '0') {
      input.value = '';
    }
    lastValue = String(input.value || '');
  });

  function applyFormatting(el) {
    var rawVal = String(el.value || '');
    if (!rawVal) {
      lastValue = '';
      return;
    }

    var formatted = __formatNumberWithCommas(rawVal);
    if (rawVal === formatted) {
      lastValue = formatted;
      return;
    }

    var origCursor = el.selectionEnd;
    if (origCursor === null || origCursor === undefined) {
      origCursor = rawVal.length;
    }

    var isAtEnd = origCursor >= rawVal.length;
    var nonCommasBefore = rawVal.slice(0, origCursor).replace(/,/g, '').length;

    el.value = formatted;
    lastValue = formatted;

    if (isAtEnd) {
      try {
        el.setSelectionRange(formatted.length, formatted.length);
      } catch (e) {}
      return;
    }

    var newCursor = 0;
    var count = 0;
    for (var i = 0; i < formatted.length; i++) {
      if (count >= nonCommasBefore) break;
      if (formatted[i] !== ',') {
        count++;
      }
      newCursor = i + 1;
    }
    try {
      el.setSelectionRange(newCursor, newCursor);
    } catch (e) {}
  }

  input.addEventListener('input', function(e) {
    if (e && e.isComposing) return;

    var cur = String(input.value || '');
    // If user pressed backspace immediately after a grouping comma, delete the digit before that comma too
    if (lastValue && cur.length === lastValue.length - 1 && cur.replace(/,/g, '') === lastValue.replace(/,/g, '')) {
      var pos = input.selectionStart;
      if (typeof pos === 'number' && pos > 0 && lastValue[pos] === ',') {
        cur = cur.slice(0, pos - 1) + cur.slice(pos);
        input.value = cur;
        try { input.setSelectionRange(pos - 1, pos - 1); } catch (err) {}
      }
    }

    applyFormatting(input);
  });

  input.addEventListener('compositionend', function() {
    applyFormatting(input);
  });
  input.addEventListener('blur', function() {
    applyFormatting(input);
  });
  input.addEventListener('change', function() {
    applyFormatting(input);
  });
}

function __autoInitNumericInputs() {
  var selector = 'input[type="number"], input[data-numeric="true"], input[inputmode="decimal"], #amount-input, #tx-amount, #manual-budget-input, #modal-category-amount, #input-principal, #input-fixed-interest, #input-interest-rate, #input-penalty-rate, #input-penalty-grace, #input-payment-amount, #input-penalty-comp, #input-interest-comp, #input-principal-comp, #p-manual-amount';
  document.querySelectorAll(selector).forEach(function(el) {
    __setupNumericInput(el);
  });
}

__autoInitNumericInputs();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', __autoInitNumericInputs);
}
setTimeout(__autoInitNumericInputs, 150);

window.__stitchFormatCommas = __formatNumberWithCommas;
window.__stitchParseNumeric = __parseCleanNumeric;
window.__stitchSetupNumericInput = __setupNumericInput;
`
}
