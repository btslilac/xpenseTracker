import { sharedScript } from './shared'

export function lendingDashboardScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};
      var summary = data.summary || {};
      var casualSummary = summary.casual || {};
      var formalSummary = summary.formal || {};

      var statCasualLentRem = document.getElementById('stat-casual-lent-rem');
      var statCasualLentPrin = document.getElementById('stat-casual-lent-prin');
      var statCasualBorrowRem = document.getElementById('stat-casual-borrow-rem');
      var statCasualBorrowPrin = document.getElementById('stat-casual-borrow-prin');

      var statFormalLentRem = document.getElementById('stat-formal-lent-rem');
      var statFormalLentPrin = document.getElementById('stat-formal-lent-prin');
      var statFormalBorrowRem = document.getElementById('stat-formal-borrow-rem');
      var statFormalBorrowPrin = document.getElementById('stat-formal-borrow-prin');

      var statRecvMonth = document.getElementById('stat-received-month');
      var statRepaidMonth = document.getElementById('stat-repaid-month');
      var overdueBanner = document.getElementById('overdue-banner');
      var overdueText = document.getElementById('overdue-text');

      var sectionCasual = document.getElementById('section-casual');
      var sectionFormal = document.getElementById('section-formal');
      var btnModeAll = document.getElementById('btn-mode-all');
      var btnModeCasual = document.getElementById('btn-mode-casual');
      var btnModeFormal = document.getElementById('btn-mode-formal');

      var listCasualEl = document.getElementById('agreements-casual-list');
      var listFormalEl = document.getElementById('agreements-formal-list');
      var emptyCasualEl = document.getElementById('casual-empty');
      var emptyFormalEl = document.getElementById('formal-empty');

      var btnNotifs = document.getElementById('btn-check-loan-notifs');
      if (btnNotifs) {
        btnNotifs.addEventListener('click', function() {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'lending.notifications.check'
            }));
          }
        });
      }

      // Populate Casual Stats
      if (statCasualLentRem) statCasualLentRem.textContent = casualSummary.lentRemaining || 'KSh 0';
      if (statCasualLentPrin) statCasualLentPrin.textContent = casualSummary.lentPrincipal || 'KSh 0';
      if (statCasualBorrowRem) statCasualBorrowRem.textContent = casualSummary.borrowedRemaining || 'KSh 0';
      if (statCasualBorrowPrin) statCasualBorrowPrin.textContent = casualSummary.borrowedPrincipal || 'KSh 0';

      // Populate Formal Stats
      if (statFormalLentRem) statFormalLentRem.textContent = formalSummary.lentRemaining || 'KSh 0';
      if (statFormalLentPrin) statFormalLentPrin.textContent = formalSummary.lentPrincipal || 'KSh 0';
      if (statFormalBorrowRem) statFormalBorrowRem.textContent = formalSummary.borrowedRemaining || 'KSh 0';
      if (statFormalBorrowPrin) statFormalBorrowPrin.textContent = formalSummary.borrowedPrincipal || 'KSh 0';

      // Populate Movement & Overdue
      if (statRecvMonth) statRecvMonth.textContent = '+' + (summary.receivedMonth || 'KSh 0');
      if (statRepaidMonth) statRepaidMonth.textContent = '-' + (summary.repaidMonth || 'KSh 0');

      if (summary.overdueCount > 0 && overdueBanner && overdueText) {
        overdueBanner.classList.remove('hidden');
        overdueText.textContent = summary.overdueCount + ' Overdue ' + (summary.overdueCount === 1 ? 'Obligation' : 'Obligations');
      }

      // Mode Switcher Filter Logic
      function setModeFilter(mode) {
        if (btnModeAll) btnModeAll.className = 'mode-pill flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all' + (mode === 'all' ? ' active' : ' text-slate-600 dark:text-[var(--text-secondary)]');
        if (btnModeCasual) btnModeCasual.className = 'mode-pill flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1' + (mode === 'casual' ? ' active' : ' text-slate-600 dark:text-[var(--text-secondary)]');
        if (btnModeFormal) btnModeFormal.className = 'mode-pill flex-1 py-2 px-3 rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1' + (mode === 'formal' ? ' active' : ' text-slate-600 dark:text-[var(--text-secondary)]');

        if (sectionCasual) {
          if (mode === 'formal') sectionCasual.classList.add('hidden');
          else sectionCasual.classList.remove('hidden');
        }
        if (sectionFormal) {
          if (mode === 'casual') sectionFormal.classList.add('hidden');
          else sectionFormal.classList.remove('hidden');
        }
      }

      if (btnModeAll) btnModeAll.addEventListener('click', function() { setModeFilter('all'); });
      if (btnModeCasual) btnModeCasual.addEventListener('click', function() { setModeFilter('casual'); });
      if (btnModeFormal) btnModeFormal.addEventListener('click', function() { setModeFilter('formal'); });

      // Action Handlers
      function navigate(route, params) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({
            type: 'navigate',
            route: route
          }, params || {})));
        }
      }

      var btnCasualLend = document.getElementById('btn-casual-lend');
      var btnCasualBorrow = document.getElementById('btn-casual-borrow');
      var btnFormalLend = document.getElementById('btn-formal-lend');
      var btnFormalBorrow = document.getElementById('btn-formal-borrow');
      var btnViewAllCasual = document.getElementById('btn-view-all-casual');
      var btnViewAllFormal = document.getElementById('btn-view-all-formal');

      if (btnCasualLend) btnCasualLend.addEventListener('click', function() { navigate('createAgreement', { mode: 'casual', origin: 'casual', direction: 'lent' }); });
      if (btnCasualBorrow) btnCasualBorrow.addEventListener('click', function() { navigate('createAgreement', { mode: 'casual', origin: 'casual', direction: 'borrowed' }); });
      if (btnFormalLend) btnFormalLend.addEventListener('click', function() { navigate('createAgreement', { mode: 'formal', origin: 'formal', direction: 'lent' }); });
      if (btnFormalBorrow) btnFormalBorrow.addEventListener('click', function() { navigate('createAgreement', { mode: 'formal', origin: 'formal', direction: 'borrowed' }); });
      if (btnViewAllCasual) btnViewAllCasual.addEventListener('click', function() { navigate('lendingAgreements', { category: 'casual' }); });
      if (btnViewAllFormal) btnViewAllFormal.addEventListener('click', function() { navigate('lendingAgreements', { category: 'formal' }); });

      // Card Creation Helper
      function createAgreementCard(item) {
        var card = document.createElement('div');
        card.className = 'p-3 rounded-xl bg-slate-50 dark:bg-[var(--surface-container)] border border-slate-200 dark:border-[var(--outline-variant)] shadow-2xs flex flex-col gap-2.5 cursor-pointer active:scale-98 transition-all';
        var isCasual = item.agreementCategory === 'casual';
        var badgeLabel = isCasual ? (item.relationship || 'Casual') : 'Formal';
        var badgeClass = isCasual ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300' : 'bg-[var(--primary-container)] text-[var(--on-primary-container)]';
        card.innerHTML = 
          '<div class="flex items-center justify-between">' +
            '<div class="flex items-center gap-2">' +
              '<div class="w-7 h-7 rounded-lg flex items-center justify-center ' + (item.direction === 'lent' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400') + '">' +
                '<span class="material-symbols-outlined text-[15px]">' + (item.direction === 'lent' ? 'arrow_outward' : 'call_received') + '</span>' +
              '</div>' +
              '<div class="min-w-0">' +
                '<div class="flex items-center gap-1.5">' +
                  '<h4 class="text-xs font-bold text-slate-900 dark:text-[var(--text-primary)] truncate">' + item.counterparty + '</h4>' +
                  '<span class="px-1.5 py-0.2 rounded text-[8px] font-bold ' + badgeClass + '">' + badgeLabel + '</span>' +
                '</div>' +
                '<span class="text-[9px] text-slate-400 dark:text-[var(--text-muted)]">' + item.reference + ' • Due ' + item.dueDateFormatted + '</span>' +
              '</div>' +
            '</div>' +
            '<span class="px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ' + item.statusBg + ' ' + item.statusText + '">' + item.statusLabel + '</span>' +
          '</div>' +
          '<div class="flex items-center justify-between pt-1.5 border-t border-slate-200/70 dark:border-[var(--outline-variant)] text-[11px]">' +
            '<span class="text-slate-500 dark:text-[var(--text-secondary)]">Remaining</span>' +
            '<span class="font-bold text-slate-900 dark:text-[var(--text-primary)]">' + item.remainingFormatted + '</span>' +
          '</div>';

        card.addEventListener('click', function() {
          navigate('agreementDetails', { id: item.id });
        });
        return card;
      }

      // Populate Lists Grouped by Category
      var activeList = data.activeAgreements || [];
      var casualItems = activeList.filter(function(a) { return a.agreementCategory === 'casual'; });
      var formalItems = activeList.filter(function(a) { return a.agreementCategory === 'formal'; });

      if (casualItems.length > 0 && listCasualEl) {
        if (emptyCasualEl) emptyCasualEl.remove();
        listCasualEl.innerHTML = '';
        casualItems.forEach(function(item) {
          listCasualEl.appendChild(createAgreementCard(item));
        });
      }

      if (formalItems.length > 0 && listFormalEl) {
        if (emptyFormalEl) emptyFormalEl.remove();
        listFormalEl.innerHTML = '';
        formalItems.forEach(function(item) {
          listFormalEl.appendChild(createAgreementCard(item));
        });
      }
    })();
  `
}

export function lendingAgreementsScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};
      var allAgreements = data.agreements || [];
      var activeDirection = data.initialDirection || 'lent';
      var activeCategory = data.initialCategory || 'all';
      var activeFilter = data.initialFilter || 'all';
      var searchQuery = '';

      var tabLent = document.getElementById('tab-lent');
      var tabBorrowed = document.getElementById('tab-borrowed');
      var catAll = document.getElementById('cat-all');
      var catCasual = document.getElementById('cat-casual');
      var catFormal = document.getElementById('cat-formal');
      var searchInput = document.getElementById('search-input');
      var container = document.getElementById('agreements-container');
      var filterPills = document.querySelectorAll('.filter-pill');

      function updateCategoryUI() {
        if (catAll) catAll.className = 'cat-pill py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1' + (activeCategory === 'all' ? ' active shadow-sm' : ' text-slate-600 dark:text-slate-400');
        if (catCasual) catCasual.className = 'cat-pill py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1' + (activeCategory === 'casual' ? ' active shadow-sm' : ' text-slate-600 dark:text-slate-400');
        if (catFormal) catFormal.className = 'cat-pill py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1' + (activeCategory === 'formal' ? ' active shadow-sm' : ' text-slate-600 dark:text-slate-400');
      }

      function renderList() {
        if (!container) return;
        var filtered = allAgreements.filter(function(item) {
          if (item.direction !== activeDirection) return false;
          if (activeCategory !== 'all' && item.agreementCategory !== activeCategory) return false;
          if (activeFilter !== 'all' && item.status !== activeFilter) return false;
          if (searchQuery) {
            var q = searchQuery.toLowerCase();
            var nameMatch = item.counterparty.toLowerCase().indexOf(q) !== -1;
            var refMatch = item.reference.toLowerCase().indexOf(q) !== -1;
            if (!nameMatch && !refMatch) return false;
          }
          return true;
        });

        container.innerHTML = '';
        if (filtered.length === 0) {
          container.innerHTML = 
            '<div class="col-span-full p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center gap-2">' +
              '<span class="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600">search_off</span>' +
              '<p class="text-xs text-slate-400">No matching agreements found.</p>' +
            '</div>';
          return;
        }

        filtered.forEach(function(item) {
          var card = document.createElement('div');
          card.className = 'theme-card p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 cursor-pointer active:scale-98 transition-all';
          var isCasual = item.agreementCategory === 'casual';
          var badgeLabel = isCasual ? (item.relationship || 'Casual') : 'Formal';
          var badgeClass = isCasual ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300' : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300';
          card.innerHTML = 
            '<div class="flex items-center justify-between">' +
              '<div class="flex items-center gap-3">' +
                '<div class="w-10 h-10 rounded-xl flex items-center justify-center ' + (item.direction === 'lent' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400') + '">' +
                  '<span class="material-symbols-outlined text-[20px]">' + (item.direction === 'lent' ? 'arrow_outward' : 'call_received') + '</span>' +
                '</div>' +
                '<div>' +
                  '<div class="flex items-center gap-1.5">' +
                    '<h4 class="text-sm font-bold text-slate-900 dark:text-slate-100">' + item.counterparty + '</h4>' +
                    '<span class="px-1.5 py-0.2 rounded text-[9px] font-bold ' + badgeClass + '">' + badgeLabel + '</span>' +
                  '</div>' +
                  '<span class="text-[10px] text-slate-400">' + item.reference + ' • ' + item.agreementDateFormatted + '</span>' +
                '</div>' +
              '</div>' +
              '<span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ' + item.statusBg + ' ' + item.statusText + '">' + item.statusLabel + '</span>' +
            '</div>' +
            '<div class="flex justify-between items-center text-xs pt-2 border-t border-slate-100 dark:border-slate-700/60">' +
              '<div>' +
                '<span class="text-[10px] text-slate-400 block">Remaining</span>' +
                '<span class="font-bold text-slate-900 dark:text-slate-100">' + item.remainingFormatted + '</span>' +
              '</div>' +
              '<div class="text-right">' +
                '<span class="text-[10px] text-slate-400 block">Principal</span>' +
                '<span class="font-semibold text-slate-600 dark:text-slate-400">' + item.principalFormatted + '</span>' +
              '</div>' +
            '</div>';

          card.addEventListener('click', function() {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'navigate',
                route: 'agreementDetails',
                id: item.id
              }));
            }
          });
          container.appendChild(card);
        });
      }

      if (catAll) catAll.addEventListener('click', function() { activeCategory = 'all'; updateCategoryUI(); renderList(); });
      if (catCasual) catCasual.addEventListener('click', function() { activeCategory = 'casual'; updateCategoryUI(); renderList(); });
      if (catFormal) catFormal.addEventListener('click', function() { activeCategory = 'formal'; updateCategoryUI(); renderList(); });
      updateCategoryUI();

      var btnAddAgreement = document.getElementById('btn-add-agreement');
      if (btnAddAgreement) {
        btnAddAgreement.addEventListener('click', function() {
          if (activeCategory === 'casual') {
            navigate('createAgreement', { mode: 'casual', origin: 'casual', direction: activeDirection });
          } else if (activeCategory === 'formal') {
            navigate('createAgreement', { mode: 'formal', origin: 'formal', direction: activeDirection });
          } else if (window.__stitchActionSheet) {
            window.__stitchActionSheet({
              title: activeDirection === 'lent' ? 'New Lend Record' : 'New Borrow Record',
              subtitle: 'Choose Casual personal tracking or Institutional Loan Agreement',
              actions: [
                {
                  id: 'casual',
                  label: 'Casual (' + (activeDirection === 'lent' ? 'Money Lent' : 'Money Borrowed') + ')',
                  subtitle: 'Informal 0% personal tracking with friends & family',
                  icon: 'handshake',
                  tone: 'success',
                  onSelect: function() {
                    navigate('createAgreement', { mode: 'casual', origin: 'casual', direction: activeDirection });
                  }
                },
                {
                  id: 'formal',
                  label: 'Loan Agreement (' + (activeDirection === 'lent' ? 'Lend' : 'Borrow') + ')',
                  subtitle: 'Formal terms with interest & late penalty controls',
                  icon: 'account_balance',
                  tone: 'primary',
                  onSelect: function() {
                    navigate('createAgreement', { mode: 'formal', origin: 'formal', direction: activeDirection });
                  }
                }
              ]
            });
          } else {
            navigate('createAgreement', { mode: 'casual', origin: 'casual', direction: activeDirection });
          }
        });
      }

      if (tabLent) {
        tabLent.addEventListener('click', function() {
          activeDirection = 'lent';
          tabLent.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm';
          tabBorrowed.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400';
          renderList();
        });
      }

      if (tabBorrowed) {
        tabBorrowed.addEventListener('click', function() {
          activeDirection = 'borrowed';
          tabBorrowed.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm';
          tabLent.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400';
          renderList();
        });
      }

      filterPills.forEach(function(pill) {
        pill.addEventListener('click', function() {
          filterPills.forEach(function(p) { p.classList.remove('active'); });
          pill.classList.add('active');
          activeFilter = pill.getAttribute('data-status') || 'all';
          renderList();
        });
      });

      if (searchInput) {
        searchInput.addEventListener('input', function(e) {
          searchQuery = e.target.value.trim();
          renderList();
        });
      }

      renderList();
    })();
  `
}

export function createAgreementScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};
      var prefill = data.prefill || {};
      var editAgr = data.editAgreement || null;
      var isEdit = Boolean(editAgr && editAgr.id);
      var modeLocked = Boolean(isEdit || data.modeLocked);
      var currentMode = isEdit
        ? (editAgr.agreementCategory === 'formal' ? 'formal' : 'casual')
        : (data.initialMode || prefill.origin || prefill.mode || 'casual');
      var direction = isEdit
        ? (editAgr.direction || 'lent')
        : (data.initialDirection || prefill.direction || 'lent');

      var screenTitle = document.getElementById('screen-title');
      var modeToggleEl = document.getElementById('mode-toggle');
      var modeLockedBanner = document.getElementById('mode-locked-banner');
      var modeLockedIcon = document.getElementById('mode-locked-icon');
      var modeLockedLabel = document.getElementById('mode-locked-label');
      var modeCasual = document.getElementById('mode-casual');
      var modeFormal = document.getElementById('mode-formal');
      var modeBadge = document.getElementById('mode-badge');
      var modeDesc = document.getElementById('mode-desc');
      var cardInterestTerms = document.getElementById('card-interest-terms');
      var cardPenaltyTerms = document.getElementById('card-penalty-terms');

      var dirLent = document.getElementById('dir-lent');
      var dirBorrowed = document.getElementById('dir-borrowed');
      var groupTitle = document.getElementById('counterparty-group-title');
      var nameLabel = document.getElementById('counterparty-name-label');
      var inputCounterpartyName = document.getElementById('input-counterparty-name');
      var inputCounterpartyPhone = document.getElementById('input-counterparty-phone');
      var inputCounterpartyEmail = document.getElementById('input-counterparty-email');
      var inputPrincipal = document.getElementById('input-principal');
      var inputDueDate = document.getElementById('input-due-date');
      var selectFrequency = document.getElementById('select-frequency');
      var inputFixedInterest = document.getElementById('input-fixed-interest');
      var inputInterestRate = document.getElementById('input-interest-rate');
      var selectInterestPeriod = document.getElementById('select-interest-period');
      var inputNotes = document.getElementById('input-notes');
      var btnSubmitLabel = document.getElementById('btn-submit-label');
      var form = document.getElementById('agreement-form');
      var wrapperEmail = document.getElementById('wrapper-email');
      var wrapperRelationship = document.getElementById('wrapper-relationship');
      var btnOpenRel = document.getElementById('btn-open-relationship');
      var inputRelationship = document.getElementById('input-relationship');
      var textRelationship = document.getElementById('selected-relationship-text');

      var radios = document.querySelectorAll('input[name="interestType"]');
      var fieldFixed = document.getElementById('field-fixed-interest');
      var fieldSimple = document.getElementById('field-simple-interest');
      var inputCurrency = document.getElementById('input-currency');
      var inputDate = document.getElementById('input-agreement-date');

      if (inputDate) {
        inputDate.value = new Date().toISOString().split('T')[0];
      }

      if (inputCurrency && data.currency) {
        inputCurrency.value = data.currency;
      }

      function updateUI() {
        var isCasual = currentMode === 'casual';

        if (modeToggleEl && modeLockedBanner) {
          if (modeLocked) {
            modeToggleEl.classList.add('hidden');
            modeLockedBanner.classList.remove('hidden');
            if (modeLockedIcon) modeLockedIcon.textContent = isCasual ? 'handshake' : 'account_balance';
            if (modeLockedLabel) {
              modeLockedLabel.textContent = isCasual
                ? 'Casual Personal Lending'
                : 'Institutional Loan Agreement';
            }
          } else {
            modeToggleEl.classList.remove('hidden');
            modeLockedBanner.classList.add('hidden');
          }
        }

        if (modeCasual && modeFormal) {
          if (isCasual) {
            modeCasual.className = 'mode-btn active-casual py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm';
            modeFormal.className = 'mode-btn py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400';
            if (modeBadge) {
              modeBadge.textContent = '0% Interest';
              modeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300';
            }
            if (modeDesc) modeDesc.textContent = 'Casual: Informal personal tracking with friends & peers (0% interest).';
            if (cardInterestTerms) cardInterestTerms.classList.add('hidden');
            if (cardPenaltyTerms) cardPenaltyTerms.classList.add('hidden');
            if (wrapperEmail) wrapperEmail.classList.add('hidden');
            if (wrapperRelationship) wrapperRelationship.classList.remove('hidden');
          } else {
            modeFormal.className = 'mode-btn active-formal py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm';
            modeCasual.className = 'mode-btn py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400';
            if (modeBadge) {
              modeBadge.textContent = 'Terms & Interest';
              modeBadge.className = 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300';
            }
            if (modeDesc) modeDesc.textContent = 'Loan Agreement: Institutional terms with clients, banks or SACCOs.';
            if (cardInterestTerms) cardInterestTerms.classList.remove('hidden');
            if (cardPenaltyTerms) cardPenaltyTerms.classList.remove('hidden');
            if (wrapperEmail) wrapperEmail.classList.remove('hidden');
            if (wrapperRelationship) wrapperRelationship.classList.add('hidden');
          }
        } else {
          if (isCasual) {
            if (cardInterestTerms) cardInterestTerms.classList.add('hidden');
            if (cardPenaltyTerms) cardPenaltyTerms.classList.add('hidden');
            if (wrapperEmail) wrapperEmail.classList.add('hidden');
            if (wrapperRelationship) wrapperRelationship.classList.remove('hidden');
          } else {
            if (cardInterestTerms) cardInterestTerms.classList.remove('hidden');
            if (cardPenaltyTerms) cardPenaltyTerms.classList.remove('hidden');
            if (wrapperEmail) wrapperEmail.classList.remove('hidden');
            if (wrapperRelationship) wrapperRelationship.classList.add('hidden');
          }
        }

        if (isEdit && cardPenaltyTerms) {
          cardPenaltyTerms.classList.add('hidden');
        }

        if (dirLent && dirBorrowed) {
          if (direction === 'lent') {
            dirLent.className = 'direction-btn active py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm';
            dirBorrowed.className = 'direction-btn py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400';
          } else {
            dirBorrowed.className = 'direction-btn active py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm';
            dirLent.className = 'direction-btn py-3 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 text-slate-600 dark:text-slate-400';
          }
        }

        if (isCasual) {
          if (screenTitle) screenTitle.textContent = isEdit ? "Edit Casual Record" : "New Casual Record";
          if (direction === 'lent') {
            if (groupTitle) groupTitle.textContent = "Friend / Peer Information";
            if (nameLabel) nameLabel.textContent = "Friend's Full Name *";
            if (inputCounterpartyName) inputCounterpartyName.placeholder = "e.g. John Kamau";
          } else {
            if (groupTitle) groupTitle.textContent = "Lender Information";
            if (nameLabel) nameLabel.textContent = "Lent by (Friend / Peer) *";
            if (inputCounterpartyName) inputCounterpartyName.placeholder = "e.g. Mary Wanjiku";
          }
          if (btnSubmitLabel) btnSubmitLabel.textContent = isEdit ? "Update Casual Record" : "Save Casual Record";
        } else {
          if (screenTitle) screenTitle.textContent = isEdit ? "Edit Loan Agreement" : "New Loan Agreement";
          if (direction === 'lent') {
            if (groupTitle) groupTitle.textContent = "Client / Borrower Information";
            if (nameLabel) nameLabel.textContent = "Borrower / Client Full Name *";
            if (inputCounterpartyName) inputCounterpartyName.placeholder = "e.g. Mutua Enterprises / John Doe";
          } else {
            if (groupTitle) groupTitle.textContent = "Lending Institution / Financier";
            if (nameLabel) nameLabel.textContent = "Institution / Financier Name *";
            if (inputCounterpartyName) inputCounterpartyName.placeholder = "e.g. Equity Bank / Tala / SACCO";
          }
          if (btnSubmitLabel) btnSubmitLabel.textContent = isEdit ? "Update Loan Agreement" : "Save Loan Agreement";
        }
      }

      if (modeCasual && !modeLocked) {
        modeCasual.addEventListener('click', function() {
          currentMode = 'casual';
          updateUI();
        });
      }
      if (modeFormal && !modeLocked) {
        modeFormal.addEventListener('click', function() {
          currentMode = 'formal';
          updateUI();
        });
      }

      if (dirLent) {
        dirLent.addEventListener('click', function() {
          direction = 'lent';
          updateUI();
        });
      }
      if (dirBorrowed) {
        dirBorrowed.addEventListener('click', function() {
          direction = 'borrowed';
          updateUI();
        });
      }

      function setRelationship(rel) {
        if (!rel) rel = 'Friend';
        if (inputRelationship) inputRelationship.value = rel;
        if (textRelationship) {
          var icon = rel === 'Family' ? 'family_restroom' : rel === 'Co-worker' ? 'work' : rel === 'Business Partner' ? 'handshake' : 'group';
          textRelationship.innerHTML = '<span class="material-symbols-outlined text-[16px] text-teal-600 dark:text-teal-400">' + icon + '</span><span>' + rel + '</span>';
        }
      }

      window.__onRelationshipSelected = function(rel) {
        setRelationship(rel);
      };

      if (btnOpenRel) {
        btnOpenRel.addEventListener('click', function(e) {
          e.preventDefault();
          var current = (inputRelationship && inputRelationship.value) || 'Friend';
          if (window.__stitchPost) {
            window.__stitchPost({ type: 'haptic', style: 'selection' });
          }
          if (window.__stitchDropdown) {
            window.__stitchDropdown({
              title: 'Select Relationship',
              subtitle: 'Choose your relationship with this contact',
              value: current,
              options: [
                { value: 'Family', label: 'Family', icon: 'family_restroom', subtitle: 'Immediate or extended family member' },
                { value: 'Friend', label: 'Friend', icon: 'group', subtitle: 'Close friend or peer' },
                { value: 'Co-worker', label: 'Co-worker', icon: 'work', subtitle: 'Colleague, associate, or coworker' },
                { value: 'Business Partner', label: 'Business Partner', icon: 'handshake', subtitle: 'Client, supplier, or partner' },
                { value: 'Other', label: 'Other', icon: 'person', subtitle: 'Other informal contact' }
              ],
              onSelect: function(val) {
                setRelationship(val);
              }
            });
          } else {
            setRelationship(current);
          }
        });
      }

      // Hydrate fields for Edit Agreement or Prefill
      var source = isEdit ? editAgr : prefill;
      if (source) {
        if (source.counterpartyName && inputCounterpartyName) inputCounterpartyName.value = source.counterpartyName;
        if (source.counterpartyPhone && inputCounterpartyPhone) inputCounterpartyPhone.value = source.counterpartyPhone;
        if (source.counterpartyEmail && inputCounterpartyEmail) inputCounterpartyEmail.value = source.counterpartyEmail;
        if (source.principalAmount && inputPrincipal) {
          inputPrincipal.value = window.__stitchFormatCommas ? window.__stitchFormatCommas(source.principalAmount) : String(source.principalAmount);
        }
        if (source.notes && inputNotes) inputNotes.value = source.notes;
        if (source.agreementDate && inputDate) {
          inputDate.value = String(source.agreementDate).split('T')[0];
        }
        if (source.dueDate && inputDueDate) {
          inputDueDate.value = String(source.dueDate).split('T')[0];
        }
        if (source.repaymentFrequency && selectFrequency) {
          selectFrequency.value = source.repaymentFrequency;
          if (window.__stitchSyncSelectUI) window.__stitchSyncSelectUI(selectFrequency);
        }
        if (isEdit && source.interestType) {
          radios.forEach(function(r) {
            r.checked = r.value === source.interestType;
          });
          if (fieldFixed) fieldFixed.classList.toggle('hidden', source.interestType !== 'fixed');
          if (fieldSimple) fieldSimple.classList.toggle('hidden', source.interestType !== 'simple');
          if (source.agreedInterestAmount && inputFixedInterest) {
            inputFixedInterest.value = window.__stitchFormatCommas ? window.__stitchFormatCommas(source.agreedInterestAmount) : String(source.agreedInterestAmount);
          }
          if (source.interestRate && inputInterestRate) {
            inputInterestRate.value = String(source.interestRate);
          }
          if (source.interestCalculationPeriod && selectInterestPeriod) {
            selectInterestPeriod.value = source.interestCalculationPeriod;
            if (window.__stitchSyncSelectUI) window.__stitchSyncSelectUI(selectInterestPeriod);
          }
        }
      }

      setRelationship((source && source.relationship) || 'Friend');
      updateUI();

      radios.forEach(function(r) {
        r.addEventListener('change', function() {
          if (fieldFixed) fieldFixed.classList.add('hidden');
          if (fieldSimple) fieldSimple.classList.add('hidden');
          if (r.value === 'fixed' && fieldFixed) fieldFixed.classList.remove('hidden');
          if (r.value === 'simple' && fieldSimple) fieldSimple.classList.remove('hidden');
        });
      });

      var penaltyRadios = document.querySelectorAll('input[name="penaltyType"]');
      var fieldPenaltyConfig = document.getElementById('field-penalty-config');
      var labelPenaltyRate = document.getElementById('label-penalty-rate');
      var inputPenaltyRate = document.getElementById('input-penalty-rate');
      var inputPenaltyGrace = document.getElementById('input-penalty-grace');

      penaltyRadios.forEach(function(pr) {
        pr.addEventListener('change', function() {
          if (!fieldPenaltyConfig) return;
          if (pr.value === 'none') {
            fieldPenaltyConfig.classList.add('hidden');
          } else {
            fieldPenaltyConfig.classList.remove('hidden');
            if (labelPenaltyRate) {
              if (pr.value === 'percentage') {
                labelPenaltyRate.textContent = "Percentage Rate (%) *";
                if (inputPenaltyRate) inputPenaltyRate.placeholder = "5";
              } else if (pr.value === 'daily') {
                labelPenaltyRate.textContent = "Daily Late Fee (Amount) *";
                if (inputPenaltyRate) inputPenaltyRate.placeholder = "50";
              } else {
                labelPenaltyRate.textContent = "Fixed Late Fee *";
                if (inputPenaltyRate) inputPenaltyRate.placeholder = "500";
              }
            }
          }
        });
      });

      if (form) {
        var isSubmitting = false;
        function safeIsoDate(raw, fallbackIso) {
          if (!raw) return fallbackIso;
          var s = String(raw).trim();
          var parsed = /^\\d{4}-\\d{2}-\\d{2}$/.test(s) ? new Date(s + 'T12:00:00.000Z') : new Date(s);
          return isNaN(parsed.getTime()) ? fallbackIso : parsed.toISOString();
        }

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          if (isSubmitting) return;
          var showAlert = window.__stitchAlert || window.alert;

          try {
            var name = String((inputCounterpartyName && inputCounterpartyName.value) || '').trim();
            var phone = String((inputCounterpartyPhone && inputCounterpartyPhone.value) || '').trim();
            var email = String((inputCounterpartyEmail && inputCounterpartyEmail.value) || '').trim();
            var rawPrincipal = (inputPrincipal && inputPrincipal.value) || '';
            var principal = window.__stitchParseNumeric
              ? window.__stitchParseNumeric(rawPrincipal)
              : Number(String(rawPrincipal || 0).replace(/,/g, ''));
            var rawAgrDate = (inputDate && inputDate.value) || '';
            var rawDueDate = (inputDueDate && inputDueDate.value) || '';
            var frequency = (selectFrequency && selectFrequency.value) || 'one_time';
            var selectedInterest = document.querySelector('input[name="interestType"]:checked');
            var interestType = currentMode === 'formal' && selectedInterest ? selectedInterest.value : 'none';
            var fixedInterest = currentMode === 'formal'
              ? (window.__stitchParseNumeric ? window.__stitchParseNumeric((inputFixedInterest || {}).value) : Number(String((inputFixedInterest || {}).value || 0).replace(/,/g, '')))
              : 0;
            var interestRate = currentMode === 'formal'
              ? (window.__stitchParseNumeric ? window.__stitchParseNumeric((inputInterestRate || {}).value) : Number(String((inputInterestRate || {}).value || 0).replace(/,/g, '')))
              : 0;
            var interestPeriod = (selectInterestPeriod && selectInterestPeriod.value) || 'per_month';
            var notes = String((inputNotes && inputNotes.value) || '').trim();

            var selectedPenalty = document.querySelector('input[name="penaltyType"]:checked');
            var penaltyType = currentMode === 'formal' && selectedPenalty ? selectedPenalty.value : 'none';
            var pRate = currentMode === 'formal'
              ? (window.__stitchParseNumeric ? window.__stitchParseNumeric((inputPenaltyRate || {}).value) : Number(String((inputPenaltyRate || {}).value || 0).replace(/,/g, '')))
              : 0;
            var pGrace = currentMode === 'formal'
              ? (window.__stitchParseNumeric ? window.__stitchParseNumeric((inputPenaltyGrace || {}).value) : Number(String((inputPenaltyGrace || {}).value || 0).replace(/,/g, '')))
              : 0;

            if (!name) {
              showAlert(
                currentMode === 'casual'
                  ? 'Please enter the friend or contact name for this casual record.'
                  : 'Please enter the borrower or lender name.',
                'Missing Information',
                'warning'
              );
              if (inputCounterpartyName) inputCounterpartyName.focus();
              return;
            }

            if (!Number.isFinite(principal) || principal <= 0) {
              showAlert('Please enter a valid positive principal amount.', 'Missing Information', 'warning');
              if (inputPrincipal) inputPrincipal.focus();
              return;
            }

            var agreedInterestAmount = 0;
            if (currentMode === 'formal') {
              if (interestType === 'fixed') {
                agreedInterestAmount = fixedInterest;
              } else if (interestType === 'simple' && interestRate > 0) {
                agreedInterestAmount = Math.round((principal * (interestRate / 100)));
              }
            }

            var relVal = currentMode === 'casual' ? ((inputRelationship && inputRelationship.value) || 'Friend') : undefined;
            var emailVal = currentMode === 'formal' ? email : '';

            var payload = {
              type: isEdit ? 'lending.agreement.update' : 'lending.agreement.create',
              id: isEdit ? editAgr.id : undefined,
              agreementCategory: currentMode,
              direction: direction,
              counterpartyName: name,
              counterpartyPhone: phone,
              counterpartyEmail: emailVal,
              relationship: relVal,
              principalAmount: principal,
              agreementDate: safeIsoDate(rawAgrDate, new Date().toISOString()),
              dueDate: rawDueDate ? safeIsoDate(rawDueDate, '') || undefined : undefined,
              repaymentFrequency: frequency,
              interestType: interestType,
              agreedInterestAmount: agreedInterestAmount,
              interestRate: interestType === 'simple' ? interestRate : undefined,
              interestCalculationPeriod: interestType === 'simple' ? interestPeriod : undefined,
              penaltyType: penaltyType,
              penaltyRate: pRate,
              penaltyAmount: penaltyType === 'fixed' ? pRate : 0,
              penaltyGraceDays: pGrace,
              notes: notes,
            };

            isSubmitting = true;
            var submitBtn = form.querySelector('button[type="submit"]');
            var prevLabel = btnSubmitLabel ? btnSubmitLabel.textContent : '';
            if (submitBtn) submitBtn.disabled = true;
            if (btnSubmitLabel) btnSubmitLabel.textContent = isEdit ? 'Updating...' : 'Saving...';
            setTimeout(function() {
              isSubmitting = false;
              if (submitBtn) submitBtn.disabled = false;
              if (btnSubmitLabel && prevLabel) btnSubmitLabel.textContent = prevLabel;
            }, 2500);

            if (window.__stitchPost) {
              window.__stitchPost(payload);
            } else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
          } catch (submitErr) {
            isSubmitting = false;
            showAlert('Could not submit record. Please verify your entries and try again.', 'Save Error', 'error');
          }
        });
      }
    })();
  `
}

export function agreementDetailsScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};
      var agr = data.agreement || {};
      var payments = data.payments || [];

      var headerRef = document.getElementById('header-ref');
      var nameEl = document.getElementById('counterparty-name');
      var relBadge = document.getElementById('relationship-badge');
      var dirSubtitle = document.getElementById('direction-subtitle');
      var dirIcon = document.getElementById('direction-icon');
      var dirWrap = document.getElementById('direction-icon-wrap');
      var statusBadge = document.getElementById('status-badge');
      var remEl = document.getElementById('amount-remaining');
      var barEl = document.getElementById('progress-bar');
      var progText = document.getElementById('progress-text');

      var amtPrin = document.getElementById('amount-principal');
      var amtInt = document.getElementById('amount-interest');
      var amtPen = document.getElementById('amount-penalty');
      var amtPrinPaid = document.getElementById('amount-principal-paid');
      var amtIntPaid = document.getElementById('amount-interest-paid');
      var amtPenPaid = document.getElementById('amount-penalty-paid');
      var badgePen = document.getElementById('penalty-rule-badge');
      var accruedPen = document.getElementById('label-accrued-penalty');
      var unpaidPen = document.getElementById('label-unpaid-penalty');
      var btnAdjustPen = document.getElementById('btn-adjust-penalty');

      var dateAgr = document.getElementById('date-agreed');
      var dateDue = document.getElementById('date-due');
      var textFreq = document.getElementById('text-frequency');

      var btnRecord = document.getElementById('btn-record-payment');
      var btnStatement = document.getElementById('btn-view-statement');
      var btnArchive = document.getElementById('btn-settle-archive');
      var listEl = document.getElementById('payments-list');
      var emptyEl = document.getElementById('payments-empty');
      var countEl = document.getElementById('payments-count');

      if (headerRef) headerRef.textContent = agr.reference || '';
      if (nameEl) nameEl.textContent = agr.counterparty || '';
      if (relBadge) {
        if (agr.agreementCategory === 'casual') {
          relBadge.textContent = agr.relationship || 'Friend';
          relBadge.classList.remove('hidden');
        } else {
          relBadge.classList.add('hidden');
        }
      }
      if (dirSubtitle) dirSubtitle.textContent = agr.direction === 'lent' ? "Money I've Lent" : "Money I Owe";
      if (dirIcon) dirIcon.textContent = agr.direction === 'lent' ? 'arrow_outward' : 'call_received';
      if (dirWrap && agr.direction === 'borrowed') {
        dirWrap.className = 'w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 flex items-center justify-center shadow-sm';
      }

      if (statusBadge) {
        statusBadge.textContent = agr.statusLabel || '';
        statusBadge.className = 'px-2.5 py-1 rounded-full text-xs font-semibold ' + agr.statusBg + ' ' + agr.statusText;
      }

      if (remEl) remEl.textContent = agr.remainingFormatted || 'KSh 0';
      if (barEl) barEl.style.width = (agr.progress || 0) + '%';
      if (progText) progText.textContent = (agr.progress || 0) + '% Repaid';

      if (amtPrin) amtPrin.textContent = agr.principalFormatted || 'KSh 0';
      if (amtInt) amtInt.textContent = agr.interestFormatted || 'KSh 0';
      if (amtPen) amtPen.textContent = agr.penaltyFormatted || 'KSh 0';
      if (amtPrinPaid) amtPrinPaid.textContent = agr.principalPaidFormatted || 'KSh 0';
      if (amtIntPaid) amtIntPaid.textContent = agr.interestPaidFormatted || 'KSh 0';
      if (amtPenPaid) amtPenPaid.textContent = agr.penaltyPaidFormatted || 'KSh 0';

      var hasAssessedPenalty = Number(agr.penaltyAmount) > 0;
      var hasSuggestedPenalty = Number(agr.suggestedPenalty) > 0;

      if (accruedPen) {
        if (hasAssessedPenalty) {
          accruedPen.textContent = agr.penaltyFormatted || 'KSh 0';
        } else if (hasSuggestedPenalty) {
          accruedPen.textContent = 'None applied (Suggested: ' + (agr.suggestedPenaltyFormatted || 'KSh 0') + ')';
        } else {
          accruedPen.textContent = 'None applied';
        }
      }
      if (unpaidPen) unpaidPen.textContent = agr.remainingPenaltyFormatted || 'KSh 0';

      if (btnAdjustPen) {
        if (!hasAssessedPenalty && hasSuggestedPenalty) {
          btnAdjustPen.innerHTML = '<span class="material-symbols-outlined text-[15px]">gavel</span>Assess Penalty';
          btnAdjustPen.className = 'py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold active:scale-95 transition-all shadow-sm flex items-center gap-1';
        } else if (hasAssessedPenalty) {
          btnAdjustPen.innerHTML = '<span class="material-symbols-outlined text-[15px]">tune</span>Adjust';
        } else {
          btnAdjustPen.innerHTML = '<span class="material-symbols-outlined text-[15px]">add</span>Assess';
        }
      }
      if (badgePen) {
        var pLabel = 'None';
        if (agr.penaltyType === 'fixed') pLabel = 'Fixed Late Fee';
        else if (agr.penaltyType === 'percentage') pLabel = agr.penaltyRate + '% Fee';
        else if (agr.penaltyType === 'daily') pLabel = 'KSh ' + agr.penaltyRate + '/day';
        badgePen.textContent = pLabel;
        if (agr.penaltyType && agr.penaltyType !== 'none') {
          badgePen.className = 'px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300';
        }
      }

      if (dateAgr) dateAgr.textContent = agr.agreementDateFormatted || '-';
      if (dateDue) dateDue.textContent = agr.dueDateFormatted || '-';
      if (textFreq) textFreq.textContent = agr.frequency || '-';

      if (countEl) countEl.textContent = payments.length + (payments.length === 1 ? ' payment' : ' payments');

      if (payments.length > 0 && listEl) {
        if (emptyEl) emptyEl.remove();
        listEl.innerHTML = '';
        payments.forEach(function(pay) {
          var item = document.createElement('div');
          item.className = 'p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between text-xs';
          var penLine = (pay.penaltyFormatted && pay.penaltyFormatted !== 'KSh 0' && pay.penaltyFormatted !== 'KES 0')
            ? '<span class="text-amber-600 dark:text-amber-400">Penalty: ' + pay.penaltyFormatted + '</span><br/>'
            : '';
          item.innerHTML = 
            '<div>' +
              '<span class="font-bold text-slate-800 dark:text-slate-200 block">' + pay.amountFormatted + '</span>' +
              '<span class="text-[10px] text-slate-400">' + pay.dateFormatted + ' • ' + pay.paymentMethod + '</span>' +
            '</div>' +
            '<div class="text-right text-[10px] text-slate-500 dark:text-slate-400">' +
              penLine +
              '<span>Principal: ' + pay.principalFormatted + '</span><br/>' +
              '<span>Interest: ' + pay.interestFormatted + '</span>' +
            '</div>';
          listEl.appendChild(item);
        });
      }

      if (btnAdjustPen) {
        btnAdjustPen.addEventListener('click', function() {
          if (window.__stitchPenaltyModal) {
            window.__stitchPenaltyModal({
              agreement: agr,
              onSave: function(penaltyData) {
                if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'lending.penalty.update',
                    id: agr.id,
                    penaltyType: penaltyData.penaltyType,
                    penaltyRate: penaltyData.penaltyRate,
                    penaltyGraceDays: penaltyData.penaltyGraceDays,
                    penaltyAmount: penaltyData.penaltyAmount,
                  }));
                }
                var showAlert = window.__stitchAlert;
                if (showAlert) showAlert('Penalty terms updated.');
              }
            });
          }
        });
      }

      if (btnRecord) {
        btnRecord.addEventListener('click', function() {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'navigate',
              route: 'recordPayment',
              id: agr.id
            }));
          }
        });
      }

      if (btnStatement) {
        btnStatement.addEventListener('click', function() {
          var showFeedback = window.__stitchFeedback || window.__stitchAlert;
          if (showFeedback) {
            showFeedback({
              variant: 'info',
              title: 'Agreement Statement',
              subtitle: (agr.reference || '') + ' • ' + (agr.counterparty || ''),
              message: 'Principal: ' + (agr.principalFormatted || '-') + '\\nInterest: ' + (agr.interestFormatted || '0') + '\\nPenalties: ' + (agr.penaltyFormatted || '0') + '\\nTotal Paid: ' + (agr.totalPaidFormatted || '0') + '\\nRemaining Balance: ' + (agr.remainingFormatted || '0'),
              primaryLabel: 'Close'
            });
          }
        });
      }

      var btnEdit = document.getElementById('btn-edit-agreement');
      if (btnEdit) {
        btnEdit.addEventListener('click', function() {
          var payload = {
            type: 'navigate',
            route: 'createAgreement',
            params: {
              editId: agr.id,
              origin: agr.agreementCategory || 'casual',
              mode: agr.agreementCategory || 'casual',
              modeLocked: 'true',
              direction: agr.direction || 'lent'
            }
          };
          if (window.__stitchPost) {
            window.__stitchPost(payload);
          } else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        });
      }

      if (btnArchive) {
        btnArchive.addEventListener('click', function() {
          var doArchive = function() {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'lending.agreement.archive',
                id: agr.id
              }));
            }
          };

          if (window.__stitchConfirm) {
            window.__stitchConfirm({
              variant: 'warning',
              title: 'Settle & Archive',
              message: 'Mark this agreement with ' + (agr.counterparty || 'counterparty') + ' as settled and archive it?',
              confirmLabel: 'Settle & Archive',
              cancelLabel: 'Cancel',
              onConfirm: doArchive
            });
          } else {
            doArchive();
          }
        });
      }
    })();
  `
}

export function recordPaymentScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};
      var agrId = data.agreementId;
      var remaining = Number(data.remainingAmount) || 0;
      var remainingPrincipal = Number(data.remainingPrincipal) || 0;
      var remainingInterest = Number(data.remainingInterest) || 0;
      var remainingPenalty = Number(data.remainingPenalty) || 0;

      var screenTitle = document.getElementById('screen-title');
      var labelCounterparty = document.getElementById('label-counterparty');
      var labelRef = document.getElementById('label-ref');
      var labelRemaining = document.getElementById('label-remaining');
      var currencyTag = document.getElementById('currency-tag');

      var labelRemPenalty = document.getElementById('label-rem-penalty');
      var labelRemInterest = document.getElementById('label-rem-interest');
      var labelRemPrincipal = document.getElementById('label-rem-principal');

      var inputAmount = document.getElementById('input-payment-amount');
      var inputPenalty = document.getElementById('input-penalty-comp');
      var inputInterest = document.getElementById('input-interest-comp');
      var inputPrincipal = document.getElementById('input-principal-comp');
      var btnAutoAllocate = document.getElementById('btn-auto-allocate');

      if (window.__stitchSetupNumericInput) {
        window.__stitchSetupNumericInput(inputAmount);
        window.__stitchSetupNumericInput(inputPenalty);
        window.__stitchSetupNumericInput(inputInterest);
        window.__stitchSetupNumericInput(inputPrincipal);
      }

      var inputDate = document.getElementById('input-payment-date');
      var warningEl = document.getElementById('allocation-warning');
      var form = document.getElementById('payment-form');

      if (inputDate) {
        inputDate.value = new Date().toISOString().split('T')[0];
      }

      if (labelCounterparty) labelCounterparty.textContent = (data.direction === 'lent' ? 'Borrower: ' : 'Lender: ') + (data.counterparty || '-');
      if (labelRef) labelRef.textContent = 'Ref: ' + (data.reference || '-');
      if (labelRemaining) labelRemaining.textContent = data.remainingFormatted || 'KSh 0';
      if (currencyTag && data.currency) currencyTag.textContent = data.currency;

      if (labelRemPenalty) labelRemPenalty.textContent = data.remainingPenaltyFormatted || (data.currency + ' ' + remainingPenalty);
      if (labelRemInterest) labelRemInterest.textContent = data.remainingInterestFormatted || (data.currency + ' ' + remainingInterest);
      if (labelRemPrincipal) labelRemPrincipal.textContent = data.remainingPrincipalFormatted || (data.currency + ' ' + remainingPrincipal);

      if (screenTitle) {
        screenTitle.textContent = data.direction === 'lent' ? 'Record Repayment Received' : 'Record Repayment Made';
      }

      // Waterfall Allocation Function: 1. Penalties -> 2. Interest -> 3. Principal
      function applyWaterfall(val) {
        var parseNum = window.__stitchParseNumeric || parseFloat;
        var fmtNum = window.__stitchFormatCommas || function(v) { return v; };
        var total = Math.max(0, parseNum(val) || 0);

        // 1. Penalties first
        var pen = Math.min(total, remainingPenalty);
        var rem1 = total - pen;

        // 2. Interest second
        var intComp = Math.min(rem1, remainingInterest);
        var rem2 = rem1 - intComp;

        // 3. Principal last
        var prinComp = rem2;

        if (inputPenalty) inputPenalty.value = pen > 0 ? fmtNum(pen) : (total > 0 && remainingPenalty === 0 ? 0 : (fmtNum(pen) || 0));
        if (inputInterest) inputInterest.value = intComp > 0 ? fmtNum(intComp) : (rem1 > 0 && remainingInterest === 0 ? 0 : (fmtNum(intComp) || 0));
        if (inputPrincipal) inputPrincipal.value = prinComp > 0 ? fmtNum(prinComp) : 0;

        checkAllocation();
      }

      if (inputAmount) {
        inputAmount.addEventListener('input', function(e) {
          applyWaterfall(e.target.value);
        });
      }

      if (btnAutoAllocate) {
        btnAutoAllocate.addEventListener('click', function(e) {
          e.preventDefault();
          if (inputAmount) applyWaterfall(inputAmount.value);
        });
      }

      if (inputPenalty) inputPenalty.addEventListener('input', checkAllocation);
      if (inputInterest) inputInterest.addEventListener('input', checkAllocation);
      if (inputPrincipal) inputPrincipal.addEventListener('input', checkAllocation);

      function checkAllocation() {
        var parseNum = window.__stitchParseNumeric || parseFloat;
        var total = parseNum((inputAmount || {}).value) || 0;
        var pen = parseNum((inputPenalty || {}).value) || 0;
        var i = parseNum((inputInterest || {}).value) || 0;
        var p = parseNum((inputPrincipal || {}).value) || 0;

        if (Math.abs((pen + i + p) - total) > 0.01) {
          if (warningEl) warningEl.classList.remove('hidden');
        } else {
          if (warningEl) warningEl.classList.add('hidden');
        }
      }

      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var parseNum = window.__stitchParseNumeric || parseFloat;
          var total = parseNum((inputAmount || {}).value) || 0;
          var pen = parseNum((inputPenalty || {}).value) || 0;
          var i = parseNum((inputInterest || {}).value) || 0;
          var p = parseNum((inputPrincipal || {}).value) || 0;

          var dateVal = (document.getElementById('input-payment-date') || {}).value;
          var method = (document.getElementById('select-payment-method') || {}).value || 'UPI';
          var refNo = (document.getElementById('input-reference-no') || {}).value || '';
          var notes = (document.getElementById('input-payment-notes') || {}).value || '';

          var showAlert = window.__stitchAlert || window.alert;

          if (total <= 0) {
            showAlert('Please enter a valid positive payment amount.');
            return;
          }

          if (Math.abs((pen + i + p) - total) > 0.01) {
            showAlert('Penalty (' + pen + ') + Interest (' + i + ') + Principal (' + p + ') must equal total amount (' + total + ').');
            return;
          }

          var doSubmit = function() {
            var payload = {
              type: 'lending.payment.create',
              agreementId: agrId,
              amount: total,
              penaltyComponent: pen,
              interestComponent: i,
              principalComponent: p,
              paymentDate: new Date(dateVal || Date.now()).toISOString(),
              paymentMethod: method,
              referenceNumber: refNo,
              notes: notes,
            };
            if (window.__stitchPost) {
              window.__stitchPost(payload);
            } else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(payload));
            }
          };

          var showConfirm = window.__stitchConfirm;
          if (typeof showConfirm === 'function') {
            var fmtNum = window.__stitchFormatCommas || function(v) { return Number(v || 0).toLocaleString(); };
            var cur = data.currency || 'KES';
            var counterparty = data.counterparty || 'this agreement';
            var dirTitle = data.direction === 'lent' ? 'Repayment Received' : 'Repayment Made';
            var refText = data.reference ? (' • Ref: ' + data.reference) : '';

            var confirmHtml =
              '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<div style="padding:14px 16px;border-radius:18px;border:1px solid var(--border-subtle);background:var(--surface-container-low);text-align:center;">' +
                  '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);margin-bottom:4px;">Total ' + escapeHtml(dirTitle) + '</div>' +
                  '<div style="font-size:26px;font-weight:900;letter-spacing:-0.02em;color:var(--action-primary, #4f46e5);">' + escapeHtml(cur) + ' ' + fmtNum(total) + '</div>' +
                  '<div style="margin-top:6px;font-size:12px;font-weight:600;color:var(--text-secondary);">' +
                    escapeHtml(counterparty) + escapeHtml(refText) +
                  '</div>' +
                '</div>' +
                '<div style="padding:12px 14px;border-radius:14px;border:1px solid var(--border-subtle);background:var(--surface-container-lowest);display:flex;flex-direction:column;gap:8px;">' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">' +
                    '<span style="color:var(--text-muted);display:flex;align-items:center;gap:6px;"><span style="width:7px;height:7px;border-radius:999px;background:#10b981;"></span>Principal Portion</span>' +
                    '<span style="font-weight:700;color:var(--text-primary);">' + escapeHtml(cur) + ' ' + fmtNum(p) + '</span>' +
                  '</div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">' +
                    '<span style="color:var(--text-muted);display:flex;align-items:center;gap:6px;"><span style="width:7px;height:7px;border-radius:999px;background:#6366f1;"></span>Interest Portion</span>' +
                    '<span style="font-weight:700;color:var(--text-primary);">' + escapeHtml(cur) + ' ' + fmtNum(i) + '</span>' +
                  '</div>' +
                  '<div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">' +
                    '<span style="color:var(--text-muted);display:flex;align-items:center;gap:6px;"><span style="width:7px;height:7px;border-radius:999px;background:#f59e0b;"></span>Penalty / Fees Portion</span>' +
                    '<span style="font-weight:700;color:var(--text-primary);">' + escapeHtml(cur) + ' ' + fmtNum(pen) + '</span>' +
                  '</div>' +
                '</div>' +
                '<div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-secondary);padding:0 4px;">' +
                  '<span><strong>Method:</strong> ' + escapeHtml(method) + '</span>' +
                  (dateVal ? ('<span><strong>Date:</strong> ' + escapeHtml(dateVal) + '</span>') : '') +
                '</div>' +
                (refNo ? ('<div style="font-size:11.5px;color:var(--text-muted);padding:0 4px;"><strong>Ref / Trans ID:</strong> ' + escapeHtml(refNo) + '</div>') : '') +
                (notes ? ('<div style="font-size:11.5px;color:var(--text-muted);padding:0 4px;font-style:italic;">&ldquo;' + escapeHtml(notes) + '&rdquo;</div>') : '') +
              '</div>';

            var fallbackMsg = 'Record ' + dirTitle + ' of ' + cur + ' ' + fmtNum(total) + ' for ' + counterparty + '?' +
              '\\n\\n' +
              '• Principal: ' + cur + ' ' + fmtNum(p) +
              '\\n• Interest: ' + cur + ' ' + fmtNum(i) +
              '\\n• Penalty: ' + cur + ' ' + fmtNum(pen) +
              (method ? ('\\n• Method: ' + method) : '') +
              (refNo ? ('\\n• Ref: ' + refNo) : '');

            showConfirm({
              variant: 'info',
              icon: 'verified',
              title: 'Confirm Repayment',
              subtitle: 'Please verify the allocation before recording',
              html: confirmHtml,
              message: fallbackMsg,
              confirmLabel: 'Confirm Repayment',
              cancelLabel: 'Cancel',
              onConfirm: doSubmit
            });
          } else {
            doSubmit();
          }
        });
      }
    })();
  `
}

export function lendingProfileScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};
      var profileType = data.profileType || 'individual';

      var tabInd = document.getElementById('type-individual');
      var tabComp = document.getElementById('type-company');
      var compGroup = document.getElementById('group-company-name');
      var labelName = document.getElementById('label-name');

      var inputOwner = document.getElementById('input-owner-name');
      var inputCompany = document.getElementById('input-company-name');
      var inputMobile = document.getElementById('input-mobile');
      var inputEmail = document.getElementById('input-email');
      var inputAddress = document.getElementById('input-address');
      var inputTax = document.getElementById('input-tax-id');
      var form = document.getElementById('lending-profile-form');

      if (inputOwner) inputOwner.value = data.ownerName || '';
      if (inputCompany) inputCompany.value = data.companyName || '';
      if (inputMobile) inputMobile.value = data.mobileNumber || '';
      if (inputEmail) inputEmail.value = data.emailAddress || '';
      if (inputAddress) inputAddress.value = data.officeAddress || '';
      if (inputTax) inputTax.value = data.businessIdentifier || '';

      function updateTypeUI() {
        if (profileType === 'individual') {
          tabInd.className = 'type-tab active py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center';
          tabComp.className = 'type-tab py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center text-slate-500 dark:text-slate-400';
          if (compGroup) compGroup.classList.add('hidden');
          if (labelName) labelName.textContent = "Owner / Financier Name *";
        } else {
          tabComp.className = 'type-tab active py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center';
          tabInd.className = 'type-tab py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center text-slate-500 dark:text-slate-400';
          if (compGroup) compGroup.classList.remove('hidden');
          if (labelName) labelName.textContent = "Authorized Officer Name *";
        }
      }

      if (tabInd) {
        tabInd.addEventListener('click', function() {
          profileType = 'individual';
          updateTypeUI();
        });
      }

      if (tabComp) {
        tabComp.addEventListener('click', function() {
          profileType = 'company';
          updateTypeUI();
        });
      }

      updateTypeUI();

      if (form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          var owner = (inputOwner || {}).value || '';
          var comp = (inputCompany || {}).value || '';
          var mobile = (inputMobile || {}).value || '';
          var email = (inputEmail || {}).value || '';
          var address = (inputAddress || {}).value || '';
          var tax = (inputTax || {}).value || '';

          if (!owner) {
            (window.__stitchAlert || window.alert)('Please provide the financier name.');
            return;
          }

          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'lending.profile.save',
              profileType: profileType,
              ownerName: owner,
              companyName: comp,
              mobileNumber: mobile,
              emailAddress: email,
              officeAddress: address,
              businessIdentifier: tax,
            }));
          }
        });
      }
    })();
  `
}

export function lendingAnalyticsScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};

      var statLentRem = document.getElementById('stat-report-lent-rem');
      var statLentTot = document.getElementById('stat-report-lent-tot');
      var statBorrowRem = document.getElementById('stat-report-borrow-rem');
      var statBorrowTot = document.getElementById('stat-report-borrow-tot');
      var statIntRecv = document.getElementById('stat-interest-received');
      var statIntPaid = document.getElementById('stat-interest-paid');
      var statActive = document.getElementById('stat-active-count');
      var statSettled = document.getElementById('stat-settled-count');
      var statOverdue = document.getElementById('stat-overdue-count');

      if (statLentRem) statLentRem.textContent = data.lentRemaining || 'KSh 0';
      if (statLentTot) statLentTot.textContent = 'Total Lent: ' + (data.lentPrincipal || 'KSh 0');
      if (statBorrowRem) statBorrowRem.textContent = data.borrowedRemaining || 'KSh 0';
      if (statBorrowTot) statBorrowTot.textContent = 'Total Borrowed: ' + (data.borrowedPrincipal || 'KSh 0');
      if (statIntRecv) statIntRecv.textContent = '+' + (data.interestReceived || 'KSh 0');
      if (statIntPaid) statIntPaid.textContent = '-' + (data.interestPaid || 'KSh 0');
      if (statActive) statActive.textContent = data.activeCount || '0';
      if (statSettled) statSettled.textContent = data.settledCount || '0';
      if (statOverdue) statOverdue.textContent = data.overdueCount || '0';
    })();
  `
}
