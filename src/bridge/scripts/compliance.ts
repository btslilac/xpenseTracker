import { sharedScript } from './shared'

export function legalDocScript() {
  return `
${sharedScript()}
`
}

export function privacyDataCenterScript() {
  return `
${sharedScript()}
(function() {
  var data = window.__STITCH_DATA__ || {};
  var comp = data.compliance || {};
  var emailEl = document.getElementById('pdc-account-email');
  var statusEl = document.getElementById('pdc-status-badge');
  var legalVerEl = document.getElementById('pdc-legal-ver');
  var smsStateEl = document.getElementById('pdc-sms-state');
  var minorAlertEl = document.getElementById('pdc-minor-alert');
  var exportSummaryEl = document.getElementById('pdc-export-summary');

  if (emailEl) emailEl.textContent = data.email || 'Signed-in account';
  if (legalVerEl) legalVerEl.textContent = 'ToS ' + (data.termsVersion || '2026.11.1') + ' / Privacy ' + (data.privacyVersion || '2026.11.1');
  if (smsStateEl) {
    smsStateEl.textContent = data.smsTransactionDetection ? 'Enabled (On-Device)' : 'Disabled / Withdrawn';
  }

  if (comp.isMinor && comp.guardianConsentStatus !== 'verified') {
    if (statusEl) {
      statusEl.textContent = 'Pending Guardian Consent';
      statusEl.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300';
    }
    if (minorAlertEl) minorAlertEl.classList.remove('hidden');
  } else if (statusEl) {
    statusEl.textContent = 'Active';
  }

  var counts = data.counts || {};
  if (exportSummaryEl && typeof counts.transactions === 'number') {
    exportSummaryEl.textContent =
      'Includes ' + counts.transactions + ' transaction(s), ' +
      (counts.categories || 0) + ' category definitions, ' +
      (counts.loanAgreements || 0) + ' lending agreement(s), and ' +
      (counts.loanPayments || 0) + ' repayment record(s).';
  }

  var tooltipBtn = document.getElementById('btn-toggle-tooltips');
  if (tooltipBtn) {
    var tooltipsOff = Boolean(data.helpTooltipsDisabled);
    tooltipBtn.setAttribute('aria-checked', tooltipsOff ? 'true' : 'false');
    tooltipBtn.addEventListener('click', function() {
      tooltipsOff = !tooltipsOff;
      tooltipBtn.setAttribute('aria-checked', tooltipsOff ? 'true' : 'false');
      if (window.__stitchSetTooltipsDisabled) window.__stitchSetTooltipsDisabled(tooltipsOff);
      window.__stitchPost({ type: 'settings.tooltips.toggle', disabled: tooltipsOff });
    });
  }

  var btnJson = document.getElementById('btn-export-json');
  btnJson && btnJson.addEventListener('click', function() {
    window.__stitchPost({ type: 'privacy.export', format: 'json' });
  });
  var btnCsv = document.getElementById('btn-export-csv');
  btnCsv && btnCsv.addEventListener('click', function() {
    window.__stitchPost({ type: 'privacy.export', format: 'csv' });
  });

  var btnWithdraw = document.getElementById('btn-withdraw-sms');
  btnWithdraw && btnWithdraw.addEventListener('click', function() {
    window.__stitchPost({ type: 'privacy.sms.withdraw' });
  });

  var btnReq = document.getElementById('btn-submit-dpa-request');
  btnReq && btnReq.addEventListener('click', function() {
    var reqType = document.getElementById('pdc-request-type')?.value || 'rectification';
    var details = (document.getElementById('pdc-request-details')?.value || '').trim();
    if (!details) {
      window.__stitchToast && window.__stitchToast('Please describe what needs correction or restriction.', 'warning');
      return;
    }
    window.__stitchPost({ type: 'privacy.request.submit', requestType: reqType, details: details });
  });

  var delInput = document.getElementById('pdc-delete-confirm-input');
  var delBtn = document.getElementById('btn-pdc-delete-account');
  if (delInput && delBtn) {
    delInput.addEventListener('input', function() {
      delBtn.disabled = delInput.value.trim().toUpperCase() !== 'DELETE';
    });
    delBtn.addEventListener('click', function() {
      if (delInput.value.trim().toUpperCase() !== 'DELETE') return;
      window.__stitchPost({ type: 'settings.account.delete' });
    });
  }
})();
`
}

export function parentalConsentScript() {
  return `
${sharedScript()}
(function() {
  var data = window.__STITCH_DATA__ || {};
  var comp = data.compliance || {};
  var pill = document.getElementById('gc-status-pill');
  var desc = document.getElementById('gc-status-desc');
  var box = document.getElementById('gc-token-box');
  var val = document.getElementById('gc-token-value');
  var em = document.getElementById('gc-email-value');

  var status = comp.guardianConsentStatus || 'not_required';
  if (pill) {
    if (status === 'verified') {
      pill.textContent = 'Verified by Guardian';
      pill.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    } else if (status === 'pending') {
      pill.textContent = 'Pending Guardian Approval';
      pill.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300';
    } else if (status === 'revoked') {
      pill.textContent = 'Consent Revoked';
      pill.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-300';
    } else {
      pill.textContent = 'Adult Account (18+)';
      pill.className = 'px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/15 text-primary';
    }
  }

  if (desc) {
    if (status === 'pending') {
      desc.textContent = 'Under Kenyan privacy law (Kenya DPA Section 33), automated SMS reading and full cloud financial tracking remain paused until your parent or guardian verifies consent.';
    } else if (status === 'verified') {
      desc.textContent = 'Guardian consent has been verified. A parent or guardian may revoke consent at any time below.';
    } else if (status === 'revoked') {
      desc.textContent = 'Guardian consent was revoked. Automated transaction features remain disabled.';
    } else {
      desc.textContent = 'This account is registered as 18 or older and does not require parental verification.';
    }
  }

  if (comp.isMinor && comp.guardianConsentToken && box && val && em) {
    box.classList.remove('hidden');
    val.textContent = comp.guardianConsentToken;
    em.textContent = 'Designated Guardian Email: ' + (comp.guardianEmail || 'Not set');
  }

  var inputEmail = document.getElementById('gc-input-email');
  var inputToken = document.getElementById('gc-input-token');
  if (inputEmail && comp.guardianEmail) inputEmail.value = comp.guardianEmail;

  var btnVerify = document.getElementById('btn-gc-verify');
  var btnRevoke = document.getElementById('btn-gc-revoke');
  btnVerify && btnVerify.addEventListener('click', function() {
    window.__stitchPost({
      type: 'privacy.guardian.verify',
      decision: 'verified',
      guardianEmail: (inputEmail && inputEmail.value || '').trim(),
      token: (inputToken && inputToken.value || '').trim(),
    });
  });
  btnRevoke && btnRevoke.addEventListener('click', function() {
    window.__stitchPost({
      type: 'privacy.guardian.verify',
      decision: 'revoked',
      guardianEmail: (inputEmail && inputEmail.value || '').trim(),
      token: (inputToken && inputToken.value || '').trim(),
    });
  });
})();
`
}
