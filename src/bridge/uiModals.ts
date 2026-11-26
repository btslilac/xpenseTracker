// Shared Theme-Aware Modal, Sheet, Dropdown, DatePicker, Toast & Classification UI System
export function getUiModalsScript(): string {
  return `
  (function() {
    if (window.__stitchModalsLoaded) return;
    window.__stitchModalsLoaded = true;

    // ── Inject Centralized Theme-Aware Modal & Popup CSS ───────────────────────
    var styleId = 'xpense-modal-style';
    if (!document.getElementById(styleId)) {
      var style = document.createElement('style');
      style.id = styleId;
      style.textContent = [
        'html.xp-modal-open, html.xp-modal-open body { overflow: hidden !important; overscroll-behavior: contain; }',
        '.stitch-modal-backdrop {',
        '  position: fixed; inset: 0; z-index: 99999;',
        '  display: flex; align-items: center; justify-content: center;',
        '  padding: max(16px, var(--safe-area-top, 16px)) 16px max(16px, var(--safe-area-bottom, 16px)) 16px;',
        '  background: var(--scrim-bg, rgba(15, 23, 42, 0.56));',
        '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
        '  opacity: 0; pointer-events: none;',
        '  transition: opacity 0.22s var(--motion-curve, cubic-bezier(0.2, 0.9, 0.3, 1));',
        '}',
        '.stitch-modal-backdrop.stitch-sheet-mode {',
        '  align-items: flex-end;',
        '  padding-left: 12px; padding-right: 12px; padding-bottom: max(12px, var(--safe-area-bottom, 12px));',
        '}',
        '@media (min-width: 640px) {',
        '  .stitch-modal-backdrop.stitch-sheet-mode { align-items: center; padding: 24px; }',
        '}',
        '.stitch-modal-backdrop.stitch-visible { opacity: 1; pointer-events: auto; }',
        '.stitch-modal-card {',
        '  width: 100%; max-width: 400px;',
        '  background: var(--surface-card-strong, #ffffff);',
        '  color: var(--text-primary, #0f172a);',
        '  border: 1px solid var(--border-subtle, rgba(148, 163, 184, 0.24));',
        '  border-radius: var(--modal-radius, 24px);',
        '  box-shadow: var(--elevated-shadow, 0 24px 56px -12px rgba(0, 0, 0, 0.32));',
        '  overflow: hidden;',
        '  transform: scale(0.95) translateY(10px);',
        '  transition: transform 0.24s var(--motion-curve, cubic-bezier(0.2, 0.9, 0.3, 1));',
        '  font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;',
        '  max-height: min(88dvh, 720px); display: flex; flex-direction: column;',
        '}',
        '.stitch-sheet-mode .stitch-modal-card {',
        '  max-width: 460px;',
        '  transform: translateY(24px) scale(0.98);',
        '}',
        '.stitch-modal-backdrop.stitch-visible .stitch-modal-card { transform: scale(1) translateY(0); }',
        'html[data-visual-style="glass"] .stitch-modal-card {',
        '  backdrop-filter: var(--glass-blur-heavy, blur(26px) saturate(1.4));',
        '  -webkit-backdrop-filter: var(--glass-blur-heavy, blur(26px) saturate(1.4));',
        '  box-shadow: var(--elevated-shadow), inset 0 1px 0 var(--border-highlight, rgba(255,255,255,0.28));',
        '}',
        'html[data-visual-style="m3"] .stitch-modal-card {',
        '  background: var(--surface-container-high, var(--surface-card-strong, #ffffff));',
        '  backdrop-filter: none; -webkit-backdrop-filter: none;',
        '}',
        'html[data-pure-black="true"] .stitch-modal-card {',
        '  background: #0d0d11 !important;',
        '  border-color: rgba(255, 255, 255, 0.14) !important;',
        '}',
        '.stitch-modal-handle {',
        '  width: 38px; height: 4px; border-radius: 999px; margin: 10px auto 2px;',
        '  background: var(--outline-variant, rgba(148,163,184,0.45));',
        '}',
        '.stitch-modal-header {',
        '  padding: 18px 20px 12px; display: flex; align-items: flex-start; gap: 12px;',
        '}',
        '.stitch-modal-badge {',
        '  width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;',
        '  display: flex; align-items: center; justify-content: center;',
        '  background: var(--primary-container, rgba(99,102,241,0.14));',
        '  color: var(--on-primary-container, var(--action-primary, #4f46e5));',
        '}',
        '.stitch-modal-badge.tone-success { background: var(--fin-income-bg, rgba(16,185,129,0.14)); color: var(--fin-income, #10b981); }',
        '.stitch-modal-badge.tone-error, .stitch-modal-badge.tone-danger { background: var(--fin-expense-bg, rgba(239,68,68,0.14)); color: var(--fin-expense, #ef4444); }',
        '.stitch-modal-badge.tone-warning, .stitch-modal-badge.tone-offline { background: var(--fin-warning-bg, rgba(245,158,11,0.14)); color: var(--fin-warning, #f59e0b); }',
        '.stitch-modal-badge.tone-info { background: var(--fin-info-bg, rgba(59,130,246,0.14)); color: var(--fin-info, #3b82f6); }',
        '.stitch-modal-title {',
        '  font-size: 17px; font-weight: 700; line-height: 1.3; margin: 0;',
        '  color: var(--text-primary, #0f172a);',
        '}',
        '.stitch-modal-sub {',
        '  font-size: 12.5px; line-height: 1.45; margin: 4px 0 0;',
        '  color: var(--text-secondary, #64748b);',
        '}',
        '.stitch-modal-body {',
        '  padding: 6px 20px 18px; font-size: 14px; line-height: 1.55;',
        '  color: var(--text-secondary, #475569); overflow-y: auto; flex: 1; min-height: 0;',
        '}',
        '.stitch-modal-footer {',
        '  padding: 12px 20px 18px; display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;',
        '  border-top: 1px solid var(--border-subtle, rgba(148,163,184,0.16));',
        '}',
        '.stitch-btn {',
        '  border: none; min-height: 44px; padding: 10px 18px; border-radius: 14px;',
        '  font-size: 13.5px; font-weight: 700; cursor: pointer;',
        '  display: inline-flex; align-items: center; justify-content: center; gap: 6px;',
        '  transition: transform 0.14s ease, opacity 0.14s ease, background-color 0.15s ease;',
        '}',
        '.stitch-btn:active { transform: scale(0.96); }',
        '.stitch-btn:disabled { opacity: 0.55; pointer-events: none; }',
        '.stitch-btn-primary {',
        '  background: var(--action-primary, #4f46e5); color: var(--action-primary-text, #ffffff);',
        '  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);',
        '}',
        '.stitch-btn-secondary {',
        '  background: var(--surface-container, rgba(148,163,184,0.14));',
        '  color: var(--text-primary, #0f172a);',
        '  border: 1px solid var(--border-subtle, rgba(148,163,184,0.22));',
        '}',
        '.stitch-btn-danger {',
        '  background: var(--fin-expense, #dc2626); color: #ffffff;',
        '}',
        '.stitch-btn-icon {',
        '  width: 36px; height: 36px; min-height: 36px; padding: 0; border-radius: 999px;',
        '  border: none; background: var(--surface-container, rgba(148,163,184,0.14));',
        '  color: var(--text-secondary, #64748b); cursor: pointer;',
        '  display: inline-flex; align-items: center; justify-content: center;',
        '}',
        '.stitch-btn-icon:active { transform: scale(0.92); }',
        '.stitch-sync-pill {',
        '  display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px;',
        '  font-size: 11px; font-weight: 700; margin-top: 8px;',
        '  background: var(--fin-warning-bg, rgba(245,158,11,0.14));',
        '  color: var(--fin-warning, #f59e0b);',
        '}',
        '.xp-sheet-list { display: flex; flex-direction: column; gap: 6px; padding: 4px 16px 16px; overflow-y: auto; }',
        '.xp-sheet-item {',
        '  width: 100%; display: flex; align-items: center; gap: 12px; text-align: left;',
        '  padding: 12px 14px; border-radius: 16px;',
        '  border: 1px solid var(--border-subtle, rgba(148,163,184,0.18));',
        '  background: var(--surface-container-low, rgba(148,163,184,0.08));',
        '  color: var(--text-primary, #0f172a); cursor: pointer;',
        '  transition: transform 0.14s ease, background-color 0.14s ease, border-color 0.14s ease;',
        '}',
        '.xp-sheet-item:active { transform: scale(0.985); }',
        '.xp-sheet-item.selected {',
        '  background: var(--primary-container, rgba(79,70,229,0.14));',
        '  border-color: var(--action-primary, #4f46e5);',
        '}',
        '.xp-sheet-item.tone-danger .xp-sheet-icon { background: var(--fin-expense-bg, rgba(239,68,68,0.14)); color: var(--fin-expense, #ef4444); }',
        '.xp-sheet-item.tone-danger .xp-sheet-label { color: var(--fin-expense, #ef4444); }',
        '.xp-sheet-item.tone-warning .xp-sheet-icon { background: var(--fin-warning-bg, rgba(245,158,11,0.14)); color: var(--fin-warning, #f59e0b); }',
        '.xp-sheet-item.tone-success .xp-sheet-icon { background: var(--fin-income-bg, rgba(16,185,129,0.14)); color: var(--fin-income, #10b981); }',
        '.xp-sheet-item.tone-primary .xp-sheet-icon { background: var(--primary-container, rgba(79,70,229,0.14)); color: var(--action-primary, #4f46e5); }',
        '.xp-sheet-icon {',
        '  width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;',
        '  display: flex; align-items: center; justify-content: center;',
        '  background: var(--surface-container-high, rgba(148,163,184,0.16));',
        '  color: var(--text-secondary, #64748b);',
        '}',
        '.xp-sheet-search-wrap { padding: 0 16px 10px; }',
        '.xp-sheet-search {',
        '  width: 100%; height: 42px; border-radius: 14px; padding: 0 14px 0 38px;',
        '  border: 1px solid var(--border-subtle, rgba(148,163,184,0.28));',
        '  background: var(--surface-container, rgba(148,163,184,0.1));',
        '  color: var(--text-primary, #0f172a); font-size: 13.5px; outline: none;',
        '}',
        '.xp-sheet-search:focus { border-color: var(--action-primary, #4f46e5); }',
        '.xp-select-native-hidden {',
        '  position: absolute !important; opacity: 0 !important; width: 1px !important; height: 1px !important;',
        '  pointer-events: none !important; overflow: hidden !important; clip: rect(0 0 0 0) !important;',
        '}',
        '.xp-select-trigger {',
        '  width: 100%; min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px;',
        '  padding: 10px 14px; border-radius: 14px;',
        '  border: 1px solid var(--border-subtle, rgba(148,163,184,0.3));',
        '  background: var(--surface-container-low, rgba(148,163,184,0.08));',
        '  color: var(--text-primary, #0f172a); font-size: 13px; font-weight: 600;',
        '  cursor: pointer; text-align: left; transition: border-color 0.15s ease, transform 0.12s ease;',
        '}',
        '.xp-select-trigger:active { transform: scale(0.99); }',
        '.xp-dp-head {',
        '  padding: 16px 18px; display: flex; justify-content: space-between; align-items: center;',
        '  background: var(--action-primary, #4f46e5); color: var(--action-primary-text, #ffffff);',
        '}',
        '.xp-dp-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }',
        '.xp-dp-year-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-height: 236px; overflow-y: auto; padding: 4px; }',
        '.xp-dp-day {',
        '  aspect-ratio: 1; display: flex; align-items: center; justify-content: center;',
        '  border-radius: 12px; font-size: 13px; font-weight: 600; border: none; background: transparent;',
        '  color: var(--text-primary, #0f172a); cursor: pointer;',
        '}',
        '.xp-dp-day:hover { background: var(--surface-container, rgba(148,163,184,0.16)); }',
        '.xp-dp-day.selected { background: var(--action-primary, #4f46e5); color: var(--action-primary-text, #ffffff); }',
        '.xp-dp-day.today { border: 1.5px solid var(--action-primary, #4f46e5); color: var(--action-primary, #4f46e5); }',
        '.xp-dp-day.today.selected { color: var(--action-primary-text, #ffffff); }',
        '.xp-dp-day.disabled { opacity: 0.3; pointer-events: none; }',
        '.xp-toast-stack {',
        '  position: fixed; left: 50%; transform: translateX(-50%); z-index: 100020;',
        '  bottom: calc(var(--safe-area-bottom, 0px) + 86px);',
        '  width: calc(100% - 32px); max-width: 420px; display: flex; flex-direction: column; gap: 8px; pointer-events: none;',
        '}',
        'body.xp-no-bottom-nav .xp-toast-stack { bottom: max(20px, var(--safe-area-bottom, 20px)); }',
        '.xp-toast-pill {',
        '  pointer-events: auto; display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 16px;',
        '  background: var(--surface-card-strong, #0f172a); color: var(--text-primary, #f8fafc);',
        '  border: 1px solid var(--border-subtle, rgba(148,163,184,0.28));',
        '  box-shadow: var(--elevated-shadow, 0 12px 32px rgba(0,0,0,0.22));',
        '  backdrop-filter: var(--glass-blur-heavy, blur(20px)); -webkit-backdrop-filter: var(--glass-blur-heavy, blur(20px));',
        '  opacity: 0; transform: translateY(12px) scale(0.97);',
        '  transition: opacity 0.2s ease, transform 0.2s var(--motion-curve, ease);',
        '  font-family: Inter, -apple-system, sans-serif; font-size: 13px; font-weight: 600;',
        '}',
        '.xp-toast-pill.visible { opacity: 1; transform: translateY(0) scale(1); }'
      ].join('\\n');
      document.head.appendChild(style);
    }

    function ensureRoot() {
      var root = document.getElementById('stitch-modal-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'stitch-modal-root';
        (document.body || document.documentElement).appendChild(root);
      }
      return root;
    }

    function ensureToastStack() {
      var stack = document.getElementById('xp-toast-stack');
      if (!stack) {
        stack = document.createElement('div');
        stack.id = 'xp-toast-stack';
        stack.className = 'xp-toast-stack';
        (document.body || document.documentElement).appendChild(stack);
      }
      if (!document.querySelector('nav, #xpense-bottom-nav')) {
        document.body && document.body.classList.add('xp-no-bottom-nav');
      } else {
        document.body && document.body.classList.remove('xp-no-bottom-nav');
      }
      return stack;
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function postBridge(payload) {
      try {
        if (window.__stitchPost) {
          window.__stitchPost(payload);
        } else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      } catch (e) {}
    }

    // ── Modal Stack & Hardware Back / Scroll Lock Coordinator ──────────────────
    var modalStack = [];
    var modalSeq = 0;

    function syncModalStackState() {
      if (modalStack.length > 0) {
        document.documentElement.classList.add('xp-modal-open');
      } else {
        document.documentElement.classList.remove('xp-modal-open');
      }
      postBridge({ type: 'ui.modal.state', openCount: modalStack.length });
    }

    function pushModalEntry(closeFn, dismissible) {
      modalSeq += 1;
      var id = 'xp_m_' + modalSeq;
      modalStack.push({ id: id, close: closeFn, dismissible: dismissible !== false });
      syncModalStackState();
      return id;
    }

    function removeModalEntry(id) {
      var next = modalStack.filter(function(item) { return item.id !== id; });
      if (next.length !== modalStack.length) {
        modalStack = next;
        syncModalStackState();
      }
    }

    window.__stitchCloseTopModal = function() {
      if (!modalStack.length) return false;
      var top = modalStack[modalStack.length - 1];
      if (top && typeof top.close === 'function') {
        top.close(true);
        return true;
      }
      return false;
    };

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalStack.length > 0) {
        var top = modalStack[modalStack.length - 1];
        if (top && top.dismissible) {
          e.preventDefault();
          top.close(true);
        }
      }
    });

    function createModalShell(opts) {
      opts = opts || {};
      var root = ensureRoot();
      var backdrop = document.createElement('div');
      backdrop.className = 'stitch-modal-backdrop' + (opts.sheet ? ' stitch-sheet-mode' : '');
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      var closed = false;
      var stackId = null;

      function close(cancelled) {
        if (closed) return;
        closed = true;
        removeModalEntry(stackId);
        backdrop.classList.remove('stitch-visible');
        setTimeout(function() {
          if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        }, 220);
        if (typeof opts.onClose === 'function') opts.onClose(cancelled);
      }

      stackId = pushModalEntry(close, opts.dismissible !== false);

      backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop && opts.dismissible !== false) {
          close(true);
        }
      });

      root.appendChild(backdrop);
      requestAnimationFrame(function() {
        backdrop.classList.add('stitch-visible');
      });

      return { backdrop: backdrop, close: close };
    }

    // ── 1. Unified Feedback / Alert Modal ──────────────────────────────────────
    var VARIANT_META = {
      success: { icon: 'check_circle', cls: 'tone-success', defaultTitle: 'Completed' },
      error:   { icon: 'error',        cls: 'tone-error',   defaultTitle: 'Action Needed' },
      danger:  { icon: 'error',        cls: 'tone-danger',  defaultTitle: 'Warning' },
      warning: { icon: 'warning',      cls: 'tone-warning', defaultTitle: 'Notice' },
      offline: { icon: 'cloud_off',    cls: 'tone-offline', defaultTitle: 'Saved Offline' },
      info:    { icon: 'info',         cls: 'tone-info',    defaultTitle: 'Information' },
    };

    window.__stitchFeedback = function(options) {
      options = options || {};
      var variant = VARIANT_META[options.variant || 'info'] ? (options.variant || 'info') : 'info';
      var meta = VARIANT_META[variant];
      var title = options.title || meta.defaultTitle;
      var msg = options.message || '';
      var primaryLabel = options.primaryLabel || 'OK';
      var secondaryLabel = options.secondaryLabel || '';
      var syncBadge = options.syncBadge || (variant === 'offline' ? 'Will sync when online' : '');

      var shell = createModalShell({ dismissible: options.dismissible !== false });
      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.innerHTML =
        '<div class="stitch-modal-header">' +
          '<div class="stitch-modal-badge ' + meta.cls + '">' +
            '<span class="material-symbols-outlined text-[24px]">' + escapeHtml(options.icon || meta.icon) + '</span>' +
          '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="stitch-modal-title">' + escapeHtml(title) + '</h3>' +
            (options.subtitle ? '<p class="stitch-modal-sub">' + escapeHtml(options.subtitle) + '</p>' : '') +
            (syncBadge ? '<div class="stitch-sync-pill"><span class="material-symbols-outlined text-[14px]">cloud_queue</span><span>' + escapeHtml(syncBadge) + '</span></div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="stitch-modal-body">' + escapeHtml(msg).replace(/\\n/g, '<br/>') + '</div>' +
        '<div class="stitch-modal-footer">' +
          (secondaryLabel ? '<button type="button" class="stitch-btn stitch-btn-secondary" data-fb-secondary>' + escapeHtml(secondaryLabel) + '</button>' : '') +
          '<button type="button" class="stitch-btn stitch-btn-primary" data-fb-primary>' + escapeHtml(primaryLabel) + '</button>' +
        '</div>';

      shell.backdrop.appendChild(card);

      var btnPrimary = card.querySelector('[data-fb-primary]');
      var btnSecondary = card.querySelector('[data-fb-secondary]');
      if (btnPrimary) {
        btnPrimary.addEventListener('click', function() {
          shell.close(false);
          if (typeof options.onPrimary === 'function') options.onPrimary();
          if (options.primaryActionId) {
            postBridge({ type: 'ui.feedback.action', actionId: options.primaryActionId, role: 'primary' });
          }
        });
        setTimeout(function() { try { btnPrimary.focus(); } catch (e) {} }, 30);
      }
      if (btnSecondary) {
        btnSecondary.addEventListener('click', function() {
          shell.close(false);
          if (typeof options.onSecondary === 'function') options.onSecondary();
          if (options.secondaryActionId) {
            postBridge({ type: 'ui.feedback.action', actionId: options.secondaryActionId, role: 'secondary' });
          }
        });
      }
      return shell.close;
    };

    window.__stitchAlert = function(message, title, type) {
      if (message && typeof message === 'object') {
        return window.__stitchFeedback(message);
      }
      return window.__stitchFeedback({
        variant: type || 'info',
        title: title || (type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice'),
        message: String(message || ''),
      });
    };

    window.alert = function(msg) {
      window.__stitchAlert(String(msg || ''));
    };

    // ── 2. Unified Confirmation Modal (object OR positional args) ──────────────
    window.__stitchConfirm = function(msgOrOpts, title, onConfirm, onCancel, confirmText, cancelText) {
      var opts = (msgOrOpts && typeof msgOrOpts === 'object')
        ? msgOrOpts
        : {
            message: String(msgOrOpts || ''),
            title: title || 'Confirm Action',
            onConfirm: onConfirm,
            onCancel: onCancel,
            confirmLabel: confirmText || 'Confirm',
            cancelLabel: cancelText || 'Cancel',
          };

      var variant = opts.variant || 'info';
      var meta = VARIANT_META[variant] || VARIANT_META.info;
      var resolved = false;

      var shell = createModalShell({
        dismissible: opts.dismissible !== false,
        onClose: function(cancelled) {
          if (!resolved && cancelled) {
            resolved = true;
            if (typeof opts.onCancel === 'function') opts.onCancel();
            if (opts.actionId) {
              postBridge({ type: 'ui.confirm.result', actionId: opts.actionId, confirmed: false, payload: opts.payload || null });
            }
          }
        },
      });

      var confirmBtnClass = (variant === 'danger' || variant === 'error') ? 'stitch-btn-danger' : 'stitch-btn-primary';
      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.innerHTML =
        '<div class="stitch-modal-header">' +
          '<div class="stitch-modal-badge ' + meta.cls + '">' +
            '<span class="material-symbols-outlined text-[24px]">' + escapeHtml(opts.icon || (variant === 'danger' ? 'delete_forever' : meta.icon)) + '</span>' +
          '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="stitch-modal-title">' + escapeHtml(opts.title || 'Confirm Action') + '</h3>' +
            (opts.subtitle ? '<p class="stitch-modal-sub">' + escapeHtml(opts.subtitle) + '</p>' : '') +
          '</div>' +
        '</div>' +
        '<div class="stitch-modal-body">' + (opts.html ? opts.html : escapeHtml(opts.message || '').replace(/\\n/g, '<br/>')) + '</div>' +
        '<div class="stitch-modal-footer">' +
          '<button type="button" class="stitch-btn stitch-btn-secondary" data-cf-cancel>' + escapeHtml(opts.cancelLabel || 'Cancel') + '</button>' +
          '<button type="button" class="stitch-btn ' + confirmBtnClass + '" data-cf-ok>' + escapeHtml(opts.confirmLabel || 'Confirm') + '</button>' +
        '</div>';

      shell.backdrop.appendChild(card);

      var cancelBtn = card.querySelector('[data-cf-cancel]');
      var okBtn = card.querySelector('[data-cf-ok]');

      function resolveConfirm(confirmed) {
        if (resolved) return;
        resolved = true;
        if (okBtn) okBtn.disabled = true;
        shell.close(false);
        if (confirmed) {
          if (typeof opts.onConfirm === 'function') opts.onConfirm();
        } else {
          if (typeof opts.onCancel === 'function') opts.onCancel();
        }
        if (opts.actionId) {
          postBridge({ type: 'ui.confirm.result', actionId: opts.actionId, confirmed: confirmed, payload: opts.payload || null });
        }
      }

      if (cancelBtn) cancelBtn.addEventListener('click', function() { resolveConfirm(false); });
      if (okBtn) okBtn.addEventListener('click', function() { resolveConfirm(true); });
      return shell.close;
    };

    window.confirm = function(msg) {
      window.__stitchConfirm(String(msg || ''), 'Confirm');
      return false;
    };

    // ── 3. Theme-Aware Action Sheet ────────────────────────────────────────────
    window.__stitchActionSheet = function(options) {
      options = options || {};
      var actions = Array.isArray(options.actions) ? options.actions : [];
      var shell = createModalShell({
        sheet: true,
        dismissible: options.dismissible !== false,
        onClose: function(cancelled) {
          if (cancelled && typeof options.onCancel === 'function') options.onCancel();
        },
      });

      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.innerHTML =
        '<div class="stitch-modal-handle"></div>' +
        '<div class="stitch-modal-header" style="padding-top:10px;">' +
          '<div style="flex:1;min-width:0;">' +
            (options.title ? '<h3 class="stitch-modal-title">' + escapeHtml(options.title) + '</h3>' : '') +
            (options.subtitle ? '<p class="stitch-modal-sub">' + escapeHtml(options.subtitle) + '</p>' : '') +
          '</div>' +
          '<button type="button" class="stitch-btn-icon" data-as-close aria-label="Close">' +
            '<span class="material-symbols-outlined text-[18px]">close</span>' +
          '</button>' +
        '</div>' +
        '<div class="xp-sheet-list" data-as-list></div>' +
        '<div class="stitch-modal-footer">' +
          '<button type="button" class="stitch-btn stitch-btn-secondary" style="width:100%;" data-as-cancel>' +
            escapeHtml(options.cancelLabel || 'Cancel') +
          '</button>' +
        '</div>';

      var list = card.querySelector('[data-as-list]');
      actions.forEach(function(action) {
        var toneCls = action.tone ? ' tone-' + action.tone : '';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'xp-sheet-item' + toneCls;
        if (action.disabled) btn.disabled = true;
        btn.innerHTML =
          (action.icon ? '<div class="xp-sheet-icon"><span class="material-symbols-outlined text-[20px]">' + escapeHtml(action.icon) + '</span></div>' : '') +
          '<div style="flex:1;min-width:0;">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
              '<span class="xp-sheet-label" style="font-size:14px;font-weight:700;">' + escapeHtml(action.label || '') + '</span>' +
              (action.badge ? '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:var(--primary-container);color:var(--on-primary-container);">' + escapeHtml(action.badge) + '</span>' : '') +
            '</div>' +
            (action.subtitle ? '<p style="margin:2px 0 0;font-size:12px;color:var(--text-secondary);">' + escapeHtml(action.subtitle) + '</p>' : '') +
          '</div>' +
          '<span class="material-symbols-outlined text-[18px]" style="color:var(--text-muted);">chevron_right</span>';

        btn.addEventListener('click', function() {
          shell.close(false);
          if (typeof action.onSelect === 'function') action.onSelect(action);
          if (typeof options.onSelect === 'function') options.onSelect(action.id, action);
          if (options.sheetId) {
            postBridge({ type: 'ui.actionsheet.select', sheetId: options.sheetId, actionId: action.id });
          }
        });
        list.appendChild(btn);
      });

      shell.backdrop.appendChild(card);
      card.querySelector('[data-as-close]').addEventListener('click', function() { shell.close(true); });
      card.querySelector('[data-as-cancel]').addEventListener('click', function() { shell.close(true); });
      return shell.close;
    };

    // ── 4. Custom Dropdown & Searchable Select Modal ───────────────────────────
    window.__stitchDropdown = function(options) {
      options = options || {};
      var items = Array.isArray(options.options) ? options.options : [];
      var selectedVal = options.value != null ? String(options.value) : '';
      var searchable = Boolean(options.searchable || items.length > 8);
      var searchText = '';

      var shell = createModalShell({ sheet: true, dismissible: options.dismissible !== false });
      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.innerHTML =
        '<div class="stitch-modal-handle"></div>' +
        '<div class="stitch-modal-header" style="padding-top:10px;">' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="stitch-modal-title">' + escapeHtml(options.title || 'Select Option') + '</h3>' +
            (options.subtitle ? '<p class="stitch-modal-sub">' + escapeHtml(options.subtitle) + '</p>' : '') +
          '</div>' +
          '<button type="button" class="stitch-btn-icon" data-dd-close aria-label="Close">' +
            '<span class="material-symbols-outlined text-[18px]">close</span>' +
          '</button>' +
        '</div>' +
        (searchable
          ? '<div class="xp-sheet-search-wrap">' +
              '<div style="position:relative;">' +
                '<span class="material-symbols-outlined text-[18px]" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;">search</span>' +
                '<input type="text" class="xp-sheet-search" data-dd-search placeholder="' + escapeHtml(options.searchPlaceholder || 'Search options...') + '" />' +
              '</div>' +
            '</div>'
          : '') +
        '<div class="xp-sheet-list" data-dd-list></div>' +
        (options.footerActionLabel
          ? '<div class="stitch-modal-footer"><button type="button" class="stitch-btn stitch-btn-primary" style="width:100%;" data-dd-footer-btn>' + escapeHtml(options.footerActionLabel) + '</button></div>'
          : '');

      var listEl = card.querySelector('[data-dd-list]');
      var searchInput = card.querySelector('[data-dd-search]');

      function renderOptions() {
        var q = searchText.trim().toLowerCase();
        var filtered = items.filter(function(item) {
          if (!q) return true;
          var hay = ((item.label || '') + ' ' + (item.subtitle || '') + ' ' + (item.badge || '')).toLowerCase();
          return hay.indexOf(q) !== -1;
        });

        listEl.innerHTML = '';
        if (filtered.length === 0) {
          listEl.innerHTML =
            '<div style="padding:28px 16px;text-align:center;color:var(--text-muted);font-size:13px;">' +
              escapeHtml(options.emptyMessage || 'No matching options found.') +
            '</div>';
          return;
        }

        filtered.forEach(function(item) {
          var valStr = String(item.value != null ? item.value : '');
          var isSelected = valStr === selectedVal;
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'xp-sheet-item' + (isSelected ? ' selected' : '') + (item.tone ? ' tone-' + item.tone : '');
          if (item.disabled) btn.disabled = true;

          btn.innerHTML =
            (item.icon
              ? '<div class="xp-sheet-icon"><span class="material-symbols-outlined text-[19px]">' + escapeHtml(item.icon) + '</span></div>'
              : '') +
            '<div style="flex:1;min-width:0;">' +
              '<div style="display:flex;align-items:center;gap:6px;">' +
                '<span class="xp-sheet-label" style="font-size:13.5px;font-weight:700;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(item.label || valStr) + '</span>' +
                (item.badge ? '<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:999px;background:var(--surface-container-high);color:var(--text-secondary);">' + escapeHtml(item.badge) + '</span>' : '') +
              '</div>' +
              (item.subtitle ? '<p style="margin:2px 0 0;font-size:11.5px;color:var(--text-secondary);">' + escapeHtml(item.subtitle) + '</p>' : '') +
            '</div>' +
            (isSelected
              ? '<span class="material-symbols-outlined text-[20px]" style="color:var(--action-primary);">check_circle</span>'
              : '');

          btn.addEventListener('click', function() {
            shell.close(false);
            if (typeof options.onSelect === 'function') options.onSelect(valStr, item);
            if (options.selectId) {
              postBridge({ type: 'ui.select.result', selectId: options.selectId, value: valStr, item: item });
            }
          });
          listEl.appendChild(btn);
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', function(e) {
          searchText = e.target.value || '';
          renderOptions();
        });
      }

      var footerBtn = card.querySelector('[data-dd-footer-btn]');
      if (footerBtn) {
        footerBtn.addEventListener('click', function() {
          shell.close(false);
          if (typeof options.onFooterAction === 'function') options.onFooterAction();
        });
      }

      card.querySelector('[data-dd-close]').addEventListener('click', function() { shell.close(true); });
      shell.backdrop.appendChild(card);
      renderOptions();
      return shell.close;
    };

    window.__stitchSelectModal = window.__stitchDropdown;
    window.__stitchSearchSelect = function(options) {
      var next = Object.assign({}, options || {}, { searchable: true });
      return window.__stitchDropdown(next);
    };

    // ── Progressive Custom Trigger Enhancement for Native <select> Elements ──
    window.__stitchSyncSelectUI = function(sel) {
      if (!sel || !sel.__xpTrigger) return;
      var opt = sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex] : null;
      var textEl = sel.__xpTrigger.querySelector('[data-xp-select-label]');
      if (textEl) {
        textEl.textContent = opt ? opt.text : (sel.getAttribute('data-placeholder') || 'Select...');
      }
    };

    window.__stitchEnhanceSelects = function(root) {
      var scope = root || document;
      var selects = scope.querySelectorAll('select:not([data-native-select="true"])');
      selects.forEach(function(sel) {
        if (sel.__xpEnhanced || sel.closest('#stitch-modal-root')) return;
        sel.__xpEnhanced = true;

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'xp-select-trigger';
        if (sel.id) trigger.setAttribute('data-for-select', sel.id);
        trigger.innerHTML =
          '<span data-xp-select-label style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">Select</span>' +
          '<span class="material-symbols-outlined text-[18px]" style="color:var(--text-muted);flex-shrink:0;">expand_more</span>';

        sel.classList.add('xp-select-native-hidden');
        sel.parentNode.insertBefore(trigger, sel.nextSibling);
        sel.__xpTrigger = trigger;
        window.__stitchSyncSelectUI(sel);

        try {
          var desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
          if (desc && desc.get && desc.set) {
            Object.defineProperty(sel, 'value', {
              configurable: true,
              get: function() { return desc.get.call(this); },
              set: function(v) {
                desc.set.call(this, v);
                window.__stitchSyncSelectUI(this);
              },
            });
          }
        } catch (err) {}

        sel.addEventListener('change', function() {
          window.__stitchSyncSelectUI(sel);
        });

        try {
          var obs = new MutationObserver(function() {
            window.__stitchSyncSelectUI(sel);
          });
          obs.observe(sel, { childList: true, subtree: true, characterData: true });
        } catch (err) {}

        trigger.addEventListener('click', function(e) {
          e.preventDefault();
          var opts = [];
          for (var i = 0; i < sel.options.length; i += 1) {
            var o = sel.options[i];
            opts.push({
              value: o.value,
              label: o.text,
              disabled: o.disabled,
              icon: o.getAttribute('data-icon') || '',
              subtitle: o.getAttribute('data-subtitle') || '',
            });
          }
          var labelText = sel.getAttribute('aria-label') || sel.getAttribute('data-label') || 'Choose Option';
          if (sel.id) {
            var lbl = document.querySelector('label[for="' + sel.id + '"]');
            if (lbl && lbl.textContent) labelText = lbl.textContent.trim();
          }
          window.__stitchDropdown({
            title: labelText,
            value: sel.value,
            options: opts,
            searchable: opts.length > 8,
            onSelect: function(val) {
              sel.value = val;
              window.__stitchSyncSelectUI(sel);
              sel.dispatchEvent(new Event('change', { bubbles: true }));
              sel.dispatchEvent(new Event('input', { bubbles: true }));
            },
          });
        });
      });
    };

    // ── 5. Themed Custom Calendar / Date Picker (with Year Grid + Presets) ───
    window.__stitchDatePicker = function(inputOrOpts) {
      var isInput = inputOrOpts && typeof inputOrOpts.tagName === 'string';
      var opts = isInput ? { inputEl: inputOrOpts } : (inputOrOpts || {});
      var inputEl = opts.inputEl || null;

      var rawVal = opts.value != null ? String(opts.value) : (inputEl ? String(inputEl.value || '') : '');
      var selectedDate = rawVal ? new Date(rawVal + (rawVal.length === 10 ? 'T12:00:00' : '')) : new Date();
      if (isNaN(selectedDate.getTime())) selectedDate = new Date();

      var minDate = opts.minDate ? new Date(opts.minDate) : null;
      var maxDate = opts.maxDate ? new Date(opts.maxDate) : null;
      var viewYear = selectedDate.getFullYear();
      var viewMonth = selectedDate.getMonth();
      var yearMode = false;

      var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      function toIsoDate(d) {
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      }

      var shell = createModalShell({ dismissible: true });
      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.style.maxWidth = '360px';

      card.innerHTML =
        '<div class="xp-dp-head">' +
          '<button type="button" data-dp-year-toggle style="background:transparent;border:none;color:inherit;display:flex;align-items:center;gap:6px;cursor:pointer;padding:0;text-align:left;">' +
            '<div>' +
              '<div style="font-size:11px;opacity:0.8;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">' + escapeHtml(opts.title || 'Select Date') + '</div>' +
              '<div data-dp-month-label style="font-size:17px;font-weight:800;margin-top:1px;"></div>' +
            '</div>' +
            '<span class="material-symbols-outlined text-[20px]" data-dp-year-caret>arrow_drop_down</span>' +
          '</button>' +
          '<div style="display:flex;gap:4px;" data-dp-nav-arrows>' +
            '<button type="button" class="stitch-btn-icon" data-dp-prev style="background:rgba(255,255,255,0.16);color:#ffffff;"><span class="material-symbols-outlined text-[20px]">chevron_left</span></button>' +
            '<button type="button" class="stitch-btn-icon" data-dp-next style="background:rgba(255,255,255,0.16);color:#ffffff;"><span class="material-symbols-outlined text-[20px]">chevron_right</span></button>' +
          '</div>' +
        '</div>' +
        (opts.showPresets
          ? '<div style="display:flex;gap:8px;padding:12px 16px 0;">' +
              '<button type="button" data-dp-preset="today" class="stitch-btn stitch-btn-secondary" style="min-height:32px;padding:4px 12px;font-size:12px;border-radius:999px;">Today</button>' +
              '<button type="button" data-dp-preset="yesterday" class="stitch-btn stitch-btn-secondary" style="min-height:32px;padding:4px 12px;font-size:12px;border-radius:999px;">Yesterday</button>' +
            '</div>'
          : '') +
        '<div style="padding:14px 16px 8px;" data-dp-body></div>' +
        '<div class="stitch-modal-footer">' +
          (opts.clearable ? '<button type="button" class="stitch-btn stitch-btn-secondary" style="margin-right:auto;" data-dp-clear>Clear</button>' : '') +
          '<button type="button" class="stitch-btn stitch-btn-secondary" data-dp-cancel>Cancel</button>' +
          '<button type="button" class="stitch-btn stitch-btn-primary" data-dp-ok>Confirm</button>' +
        '</div>';

      var monthLabel = card.querySelector('[data-dp-month-label]');
      var bodyEl = card.querySelector('[data-dp-body]');
      var arrowsEl = card.querySelector('[data-dp-nav-arrows]');
      var caretEl = card.querySelector('[data-dp-year-caret]');

      function applyConfirmedDate(d) {
        var iso = toIsoDate(d);
        shell.close(false);
        if (inputEl) {
          inputEl.value = iso;
          inputEl.dispatchEvent(new Event('change', { bubbles: true }));
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (typeof opts.onSelect === 'function') opts.onSelect(iso, d);
      }

      function renderCalendarView() {
        monthLabel.textContent = MONTHS[viewMonth] + ' ' + viewYear;
        arrowsEl.style.display = yearMode ? 'none' : 'flex';
        caretEl.textContent = yearMode ? 'arrow_drop_up' : 'arrow_drop_down';

        if (yearMode) {
          var currentY = new Date().getFullYear();
          var startY = opts.minYear || 1935;
          var endY = opts.maxYear || (currentY + 10);
          var grid = document.createElement('div');
          grid.className = 'xp-dp-year-grid';
          for (var y = endY; y >= startY; y -= 1) {
            (function(yr) {
              var b = document.createElement('button');
              b.type = 'button';
              b.className = 'stitch-btn ' + (yr === viewYear ? 'stitch-btn-primary' : 'stitch-btn-secondary');
              b.style.minHeight = '38px';
              b.style.padding = '6px 8px';
              b.textContent = String(yr);
              b.addEventListener('click', function() {
                viewYear = yr;
                yearMode = false;
                renderCalendarView();
              });
              grid.appendChild(b);
            })(y);
          }
          bodyEl.innerHTML = '';
          bodyEl.appendChild(grid);
          return;
        }

        var todayStr = toIsoDate(new Date());
        var selectedStr = toIsoDate(selectedDate);
        var firstDay = new Date(viewYear, viewMonth, 1).getDay();
        var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

        var html = '<div class="xp-dp-grid" style="margin-bottom:6px;">' +
          DAYS.map(function(d) {
            return '<span style="font-size:10.5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;">' + d + '</span>';
          }).join('') +
        '</div><div class="xp-dp-grid">';

        for (var blank = 0; blank < firstDay; blank += 1) {
          html += '<div></div>';
        }
        for (var day = 1; day <= daysInMonth; day += 1) {
          var cellDate = new Date(viewYear, viewMonth, day, 12, 0, 0);
          var iso = toIsoDate(cellDate);
          var outOfRange = (minDate && cellDate < minDate) || (maxDate && cellDate > maxDate);
          var cls = 'xp-dp-day' + (iso === selectedStr ? ' selected' : '') + (iso === todayStr ? ' today' : '') + (outOfRange ? ' disabled' : '');
          html += '<button type="button" class="' + cls + '" data-dp-iso="' + iso + '">' + day + '</button>';
        }
        html += '</div>';
        bodyEl.innerHTML = html;

        bodyEl.querySelectorAll('[data-dp-iso]').forEach(function(btn) {
          btn.addEventListener('click', function() {
            var iso = btn.getAttribute('data-dp-iso');
            selectedDate = new Date(iso + 'T12:00:00');
            renderCalendarView();
          });
        });
      }

      card.querySelector('[data-dp-year-toggle]').addEventListener('click', function() {
        yearMode = !yearMode;
        renderCalendarView();
      });

      card.querySelector('[data-dp-prev]').addEventListener('click', function() {
        viewMonth -= 1;
        if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
        renderCalendarView();
      });

      card.querySelector('[data-dp-next]').addEventListener('click', function() {
        viewMonth += 1;
        if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
        renderCalendarView();
      });

      card.querySelectorAll('[data-dp-preset]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var p = btn.getAttribute('data-dp-preset');
          var d = new Date();
          if (p === 'yesterday') d.setDate(d.getDate() - 1);
          selectedDate = d;
          viewYear = d.getFullYear();
          viewMonth = d.getMonth();
          applyConfirmedDate(d);
        });
      });

      var clearBtn = card.querySelector('[data-dp-clear]');
      if (clearBtn) {
        clearBtn.addEventListener('click', function() {
          shell.close(false);
          if (inputEl) {
            inputEl.value = '';
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (typeof opts.onClear === 'function') opts.onClear();
        });
      }

      card.querySelector('[data-dp-cancel]').addEventListener('click', function() { shell.close(true); });
      card.querySelector('[data-dp-ok]').addEventListener('click', function() { applyConfirmedDate(selectedDate); });

      shell.backdrop.appendChild(card);
      renderCalendarView();
      return shell.close;
    };

    function attachDatePickers() {
      document.querySelectorAll('input[type="date"], [data-stitch-datepicker]').forEach(function(input) {
        if (input.__stitchDatePickerAttached) return;
        input.__stitchDatePickerAttached = true;
        input.setAttribute('readonly', 'readonly');
        input.style.cursor = 'pointer';
        input.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          window.__stitchDatePicker(input);
        });
      });
    }

    // ── 6. Floating Non-Blocking Theme-Aware Toast ─────────────────────────────
    window.__stitchToast = function(messageOrOpts, type, duration) {
      var opts = (messageOrOpts && typeof messageOrOpts === 'object')
        ? messageOrOpts
        : { message: String(messageOrOpts || ''), variant: type || 'info', duration: duration };

      var variant = opts.variant || 'info';
      var meta = VARIANT_META[variant] || VARIANT_META.info;
      var stack = ensureToastStack();
      while (stack.children.length >= 2) {
        stack.removeChild(stack.firstChild);
      }

      var pill = document.createElement('div');
      pill.className = 'xp-toast-pill';
      pill.innerHTML =
        '<span class="material-symbols-outlined text-[19px]" style="color:' +
          (variant === 'success' ? 'var(--fin-income, #10b981)'
            : variant === 'error' || variant === 'danger' ? 'var(--fin-expense, #ef4444)'
            : variant === 'warning' || variant === 'offline' ? 'var(--fin-warning, #f59e0b)'
            : 'var(--action-primary, #6366f1)') +
        ';">' + escapeHtml(opts.icon || meta.icon) + '</span>' +
        '<span style="flex:1;min-width:0;line-height:1.35;">' + escapeHtml(opts.message || '') + '</span>';

      stack.appendChild(pill);
      requestAnimationFrame(function() { pill.classList.add('visible'); });

      var removed = false;
      function dismiss() {
        if (removed) return;
        removed = true;
        pill.classList.remove('visible');
        setTimeout(function() {
          if (pill.parentNode) pill.parentNode.removeChild(pill);
        }, 200);
      }
      pill.addEventListener('click', dismiss);
      setTimeout(dismiss, Number(opts.duration) > 0 ? Number(opts.duration) : 2800);
      return dismiss;
    };

    // ── 7. Themed Late Penalty Modal ───────────────────────────────────────────
    window.__stitchPenaltyModal = function(options) {
      options = options || {};
      var agreement = options.agreement || {};
      var onSave = options.onSave;

      var currentType = agreement.penaltyType || 'none';
      var currentRate = Number(agreement.penaltyRate) || 0;
      var currentGrace = Number(agreement.penaltyGraceDays) || 0;
      var currentManual = Number(agreement.penaltyAmount) || 0;
      var currency = agreement.currency || 'KSh';

      var shell = createModalShell({ sheet: true, dismissible: true });
      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.innerHTML =
        '<div class="stitch-modal-handle"></div>' +
        '<div class="stitch-modal-header" style="padding-top:10px;">' +
          '<div class="stitch-modal-badge tone-warning"><span class="material-symbols-outlined text-[22px]">gavel</span></div>' +
          '<div style="flex:1;min-width:0;">' +
            '<h3 class="stitch-modal-title">Late Payment Penalty</h3>' +
            '<p class="stitch-modal-sub">Adjust terms for ' + escapeHtml(agreement.counterpartyName || 'Agreement') + '</p>' +
          '</div>' +
          '<button type="button" class="stitch-btn-icon" data-p-close><span class="material-symbols-outlined text-[18px]">close</span></button>' +
        '</div>' +
        '<div class="stitch-modal-body" style="display:flex;flex-direction:column;gap:12px;">' +
          '<div>' +
            '<label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;">Penalty Type</label>' +
            '<select id="p-type-select" style="width:100%;">' +
              '<option value="none">No Penalty</option>' +
              '<option value="daily_fixed">Daily Fixed Amount (' + escapeHtml(currency) + '/day)</option>' +
              '<option value="daily_percent">Daily Percentage (% of unpaid/day)</option>' +
              '<option value="one_time_percent">One-Time Percentage (% on overdue)</option>' +
            '</select>' +
          '</div>' +
          '<div id="p-dynamic-fields" style="display:flex;flex-direction:column;gap:10px;"></div>' +
          '<div style="padding-top:10px;border-top:1px solid var(--border-subtle);">' +
            '<label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">Manual Penalty Override (' + escapeHtml(currency) + ')</label>' +
            '<input id="p-manual-amount" type="text" inputmode="decimal" value="' + currentManual + '" style="width:100%;padding:11px 14px;border-radius:14px;border:1px solid var(--border-subtle);background:var(--surface-container-low);color:var(--text-primary);font-size:13.5px;font-weight:700;" />' +
            '<p style="margin:4px 0 0;font-size:11px;color:var(--text-muted);">Accumulated late charges apply before interest and principal on repayments.</p>' +
          '</div>' +
        '</div>' +
        '<div class="stitch-modal-footer">' +
          '<button type="button" class="stitch-btn stitch-btn-secondary" data-p-cancel>Cancel</button>' +
          '<button type="button" class="stitch-btn stitch-btn-primary" data-p-save>Save Terms</button>' +
        '</div>';

      shell.backdrop.appendChild(card);

      var typeSelect = card.querySelector('#p-type-select');
      var dynEl = card.querySelector('#p-dynamic-fields');
      var manualEl = card.querySelector('#p-manual-amount');
      typeSelect.value = currentType;
      window.__stitchEnhanceSelects(card);
      if (window.__stitchSetupNumericInput && manualEl) {
        window.__stitchSetupNumericInput(manualEl);
      }

      function renderDyn() {
        var val = typeSelect.value;
        if (val === 'none') {
          dynEl.innerHTML = '';
          return;
        }
        var rateLabel = val === 'daily_fixed' ? 'Daily Fee (' + currency + ')' : val === 'daily_percent' ? 'Daily Rate (%)' : 'One-Time Rate (%)';
        dynEl.innerHTML =
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<div>' +
              '<label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">' + escapeHtml(rateLabel) + '</label>' +
              '<input id="p-rate-input" type="text" inputmode="decimal" value="' + currentRate + '" style="width:100%;padding:10px 12px;border-radius:14px;border:1px solid var(--border-subtle);background:var(--surface-container-low);color:var(--text-primary);font-size:13px;font-weight:700;" />' +
            '</div>' +
            '<div>' +
              '<label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);margin-bottom:4px;">Grace Days</label>' +
              '<input id="p-grace-input" type="text" inputmode="numeric" value="' + currentGrace + '" style="width:100%;padding:10px 12px;border-radius:14px;border:1px solid var(--border-subtle);background:var(--surface-container-low);color:var(--text-primary);font-size:13px;font-weight:700;" />' +
            '</div>' +
          '</div>';
        if (window.__stitchSetupNumericInput) {
          window.__stitchSetupNumericInput(dynEl.querySelector('#p-rate-input'));
          window.__stitchSetupNumericInput(dynEl.querySelector('#p-grace-input'));
        }
      }

      renderDyn();
      typeSelect.addEventListener('change', renderDyn);
      card.querySelector('[data-p-close]').addEventListener('click', function() { shell.close(true); });
      card.querySelector('[data-p-cancel]').addEventListener('click', function() { shell.close(true); });
      card.querySelector('[data-p-save]').addEventListener('click', function() {
        var parseNum = window.__stitchParseNumeric || function(s) { return parseFloat(String(s || '0').replace(/,/g, '')) || 0; };
        var rInput = dynEl.querySelector('#p-rate-input');
        var gInput = dynEl.querySelector('#p-grace-input');
        var rate = rInput ? parseNum(rInput.value) : 0;
        var grace = gInput ? parseInt(String(gInput.value || '0').replace(/,/g, ''), 10) || 0 : 0;
        var manual = manualEl ? parseNum(manualEl.value) : 0;
        shell.close(false);
        if (typeof onSave === 'function') {
          onSave({
            penaltyType: typeSelect.value,
            penaltyRate: rate,
            penaltyGraceDays: grace,
            penaltyAmount: manual,
          });
        }
      });
      return shell.close;
    };

    // ── Helper for Custom Page Modals to Join Hardware Back Stack ───────────────
    function registerCustomModal(closeFn, dismissible) {
      return pushModalEntry(closeFn, dismissible !== false);
    }

    function unregisterCustomModal(stackId) {
      removeModalEntry(stackId);
    }

    // ── 8. Smart Two-Way SMS Transaction Classification Modal ──────────────
    window.__stitchSmsClassification = function(payload) {
      payload = payload || {};
      var detection = payload.detection || {};
      var parsed = detection.parsed || {};
      var queueCount = Number(payload.queueCount || 1);
      var cats = payload.categories || {};
      var agrs = payload.agreements || {};
      var currency = parsed.currency || 'KES';
      var displayCurr = currency === 'KES' ? 'KSh' : currency;
      var amountNum = Number(parsed.amount || 0);
      var amountFormatted = displayCurr + ' ' + amountNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      var direction = parsed.direction || 'UNKNOWN';
      var classCat = parsed.classificationCategory || '';
      var fuliza = parsed.fulizaDetails || null;
      var isFulizaBorrow = classCat === 'FULIZA_BORROWING';
      var isFulizaRepay = classCat === 'FULIZA_REPAYMENT';
      var isIncoming = direction === 'INCOMING' && !isFulizaBorrow && !isFulizaRepay;
      var isOutgoing = (direction === 'OUTGOING' || isFulizaBorrow) && !isFulizaRepay;
      var counterparty = parsed.counterpartyName || parsed.recipient || parsed.senderId || 'Unknown';
      var refCode = parsed.referenceCode || '';
      var channelLabel = (parsed.provider || 'SMS') + (parsed.channel ? ' • ' + String(parsed.channel).replace(/_/g, ' ') : '');
      var timeText = parsed.smsTimestamp ? new Date(parsed.smsTimestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

      var dirBadgeBg = isFulizaBorrow
        ? 'rgba(245, 158, 11, 0.16)'
        : isFulizaRepay
          ? 'rgba(79, 70, 229, 0.14)'
          : isIncoming
            ? 'rgba(16, 185, 129, 0.14)'
            : isOutgoing
              ? 'rgba(244, 63, 94, 0.14)'
              : 'rgba(245, 158, 11, 0.14)';
      var dirBadgeText = isFulizaBorrow
        ? '#b45309'
        : isFulizaRepay
          ? '#4f46e5'
          : isIncoming
            ? '#059669'
            : isOutgoing
              ? '#e11d48'
              : '#b45309';
      var dirBadgeLabel = isFulizaBorrow
        ? 'Fuliza Overdraft Used'
        : isFulizaRepay
          ? (fuliza && fuliza.isPartialRecovery ? 'Fuliza Partial Recovery' : 'Fuliza Repayment')
          : isIncoming
            ? (fuliza && fuliza.isFulizaInvolved ? 'Income + Fuliza Recovery' : 'Incoming Money')
            : isOutgoing
              ? (fuliza && fuliza.isFulizaInvolved ? 'Expense (Wallet + Fuliza)' : 'Outgoing Payment')
              : 'Review Transaction';
      var queuePill = queueCount > 1
        ? '<span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:999px;background:var(--primary-container);color:var(--on-primary-container);">1 of ' + queueCount + ' pending</span>'
        : '';

      function fmtCur(v) {
        return displayCurr + ' ' + Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      var fulizaBreakdownHtml = '';
      if (fuliza && fuliza.isFulizaInvolved) {
        var rows = [];
        if (isIncoming && fuliza.grossInflowAmount != null) {
          rows.push('<div>Gross Received: <strong>' + escapeHtml(fmtCur(fuliza.grossInflowAmount)) + '</strong></div>');
          if (fuliza.fulizaAmount != null) rows.push('<div>Auto-recovered to Fuliza: <strong>-' + escapeHtml(fmtCur(fuliza.fulizaAmount)) + '</strong></div>');
          if (fuliza.netWalletImpact != null) rows.push('<div>Net Wallet Gain: <strong>' + escapeHtml(fmtCur(fuliza.netWalletImpact)) + '</strong></div>');
        } else if (isOutgoing && !isFulizaBorrow) {
          if (fuliza.walletPortion != null) rows.push('<div>M-PESA Wallet Portion: <strong>' + escapeHtml(fmtCur(fuliza.walletPortion)) + '</strong></div>');
          if (fuliza.fulizaAmount != null) rows.push('<div>Fuliza Overdraft Covered: <strong>' + escapeHtml(fmtCur(fuliza.fulizaAmount)) + '</strong></div>');
        }
        if (fuliza.fulizaAccessFee != null) rows.push('<div>Fuliza Access Fee: <strong>' + escapeHtml(fmtCur(fuliza.fulizaAccessFee)) + '</strong></div>');
        if (fuliza.fulizaInterest != null) rows.push('<div>Fuliza Interest / Fee: <strong>' + escapeHtml(fmtCur(fuliza.fulizaInterest)) + '</strong></div>');
        if (fuliza.outstandingFulizaBalance != null) rows.push('<div>Fuliza Balance Remaining: <strong>' + escapeHtml(fmtCur(fuliza.outstandingFulizaBalance)) + '</strong></div>');
        if (rows.length > 0) {
          fulizaBreakdownHtml =
            '<div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--border-subtle);font-size:12px;color:var(--text-secondary);display:grid;gap:3px;">' +
            rows.join('') +
            '</div>';
        }
      }

      var shell = createModalShell({ sheet: true, dismissible: false });
      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.innerHTML =
        '<div class="stitch-modal-handle"></div>' +
        '<div class="stitch-modal-header" style="padding-top:10px;">' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px;">' +
              '<span style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:3px 9px;border-radius:999px;background:' + dirBadgeBg + ';color:' + dirBadgeText + ';">' + dirBadgeLabel + '</span>' +
              (parsed.confidence === 'low' ? '<span style="font-size:10px;font-weight:700;padding:3px 9px;border-radius:999px;background:rgba(245,158,11,0.14);color:#b45309;">Confirm Category</span>' : '') +
              queuePill +
            '</div>' +
            '<h3 class="stitch-modal-title">' + (isFulizaBorrow ? 'Fuliza Overdraft Detected' : isFulizaRepay ? 'Fuliza Auto-Repayment' : isIncoming ? 'Money Received' : isOutgoing ? 'Transaction Detected' : 'Clarify SMS Transaction') + '</h3>' +
            '<p class="stitch-modal-sub">' + escapeHtml(channelLabel) + (timeText ? ' • ' + escapeHtml(timeText) : '') + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="stitch-modal-body">' +
          '<div style="padding:14px 16px;border-radius:18px;border:1px solid var(--border-subtle);background:var(--surface-container-low);margin-bottom:14px;">' +
            '<div style="font-size:24px;font-weight:900;letter-spacing:-0.02em;color:var(--text-primary);">' + escapeHtml(amountFormatted) + '</div>' +
            '<div style="margin-top:6px;font-size:12.5px;color:var(--text-secondary);display:flex;flex-wrap:wrap;gap:6px 14px;">' +
              '<span><strong>' + (isIncoming ? 'From:' : 'To / Facility:') + '</strong> ' + escapeHtml(counterparty) + '</span>' +
              (refCode ? '<span><strong>Ref:</strong> ' + escapeHtml(refCode) + '</span>' : '') +
            '</div>' +
            fulizaBreakdownHtml +
          '</div>' +
          '<p style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px;">How should XpenseTracker record this?</p>' +
          '<div class="xp-sheet-list" style="padding:0;" data-sms-options></div>' +
        '</div>' +
        '<div class="stitch-modal-footer">' +
          '<button type="button" class="stitch-btn stitch-btn-secondary" data-sms-later>Ask Later</button>' +
          '<button type="button" class="stitch-btn stitch-btn-danger" data-sms-dismiss>Ignore</button>' +
        '</div>';

      var optHost = card.querySelector('[data-sms-options]');
      var submitted = false;
      function submitChoice(actionPayload) {
        if (submitted) return;
        submitted = true;
        shell.close(false);
        postBridge({
          type: 'sms.classify.submit',
          detectionId: detection.id || '',
          payload: actionPayload
        });
      }

      function addOptionButton(opts) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'xp-sheet-item' + (opts.tone ? ' tone-' + opts.tone : '');
        btn.innerHTML =
          '<div class="xp-sheet-icon"><span class="material-symbols-outlined text-[20px]">' + escapeHtml(opts.icon || 'receipt_long') + '</span></div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="xp-sheet-label" style="font-size:13.5px;font-weight:700;">' + escapeHtml(opts.label) + '</div>' +
            (opts.subtitle ? '<p style="margin:2px 0 0;font-size:11.5px;color:var(--text-secondary);">' + escapeHtml(opts.subtitle) + '</p>' : '') +
          '</div>' +
          '<span class="material-symbols-outlined text-[18px]" style="color:var(--text-muted);">chevron_right</span>';
        btn.addEventListener('click', opts.onClick);
        optHost.appendChild(btn);
      }

      if (isOutgoing || direction === 'UNKNOWN') {
        addOptionButton({
          icon: 'shopping_bag',
          tone: 'danger',
          label: 'Record as Expense',
          subtitle: 'Choose spending category and log to expenses',
          onClick: function() {
            var expCats = Array.isArray(cats.expense) ? cats.expense : [];
            if (expCats.length > 0) {
              window.__stitchDropdown({
                title: 'Select Expense Category',
                subtitle: amountFormatted + ' • ' + counterparty,
                searchable: true,
                options: expCats.map(function(c) { return { value: c.id, label: c.name, icon: c.icon || 'category' }; }),
                onSelect: function(catId, item) {
                  submitChoice({ action: 'expense', categoryId: catId, categoryName: item ? item.label : '' });
                },
                onCancel: function() {
                  // Reopen classification if user backs out of category selection
                  postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' });
                }
              });
              shell.close(false);
            } else {
              submitChoice({ action: 'expense' });
            }
          }
        });

        addOptionButton({
          icon: 'north_east',
          tone: 'success',
          label: 'Money Lent',
          subtitle: 'Log casual peer loan (0%) or formal client Loan Agreement',
          onClick: function() {
            window.__stitchActionSheet({
              title: 'Choose Lending Type',
              subtitle: amountFormatted + ' to ' + counterparty,
              actions: [
                { id: 'casual', label: 'Casual Lending (0% Peer / Family)', subtitle: 'Track informal personal receivable', icon: 'group', tone: 'success', onSelect: function() { submitChoice({ action: 'lent', mode: 'casual' }); } },
                { id: 'formal', label: 'Loan Agreement (Formal / Client)', subtitle: 'Interest rate, terms & penalty rules', icon: 'account_balance', tone: 'primary', onSelect: function() { submitChoice({ action: 'lent', mode: 'formal' }); } }
              ],
              onCancel: function() {
                postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' });
              }
            });
            shell.close(false);
          }
        });

        addOptionButton({
          icon: 'payments',
          tone: 'primary',
          label: 'Repayment of Money I Owe',
          subtitle: 'Credit this payment toward a Casual or Institutional debt',
          onClick: function() {
            var borrowedList = Array.isArray(agrs.borrowed) ? agrs.borrowed : [];
            if (borrowedList.length === 0) {
              window.__stitchConfirm({
                variant: 'info',
                title: 'No Active Debts Found',
                message: 'You have no active borrowed loans to link this repayment to. Would you like to record a new borrowed loan or log this as an Expense?',
                confirmLabel: 'Log as Expense',
                cancelLabel: 'Back',
                onConfirm: function() { submitChoice({ action: 'expense' }); },
                onCancel: function() { postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' }); }
              });
              shell.close(false);
              return;
            }
            window.__stitchDropdown({
              title: 'Select Debt Being Repaid',
              subtitle: amountFormatted + ' paid to ' + counterparty,
              searchable: true,
              options: borrowedList.map(function(a) {
                return { value: a.id, label: a.counterpartyName, subtitle: a.subtitle, badge: a.remainingFormatted, icon: 'account_balance_wallet' };
              }),
              onSelect: function(agreementId) {
                submitChoice({ action: 'repayment_owed', agreementId: agreementId });
              },
              onCancel: function() {
                postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' });
              }
            });
            shell.close(false);
          }
        });
      }

      if ((isIncoming && !isFulizaRepay) || (direction === 'UNKNOWN' && !isFulizaRepay)) {
        addOptionButton({
          icon: 'south_west',
          tone: 'success',
          label: 'Record as Income',
          subtitle: 'Choose income category and add to inflow',
          onClick: function() {
            var incCats = Array.isArray(cats.income) ? cats.income : [];
            if (incCats.length > 0) {
              window.__stitchDropdown({
                title: 'Select Income Category',
                subtitle: amountFormatted + ' from ' + counterparty,
                searchable: true,
                options: incCats.map(function(c) { return { value: c.id, label: c.name, icon: c.icon || 'payments' }; }),
                onSelect: function(catId, item) {
                  submitChoice({ action: 'income', categoryId: catId, categoryName: item ? item.label : '' });
                },
                onCancel: function() {
                  postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' });
                }
              });
              shell.close(false);
            } else {
              submitChoice({ action: 'income' });
            }
          }
        });

        addOptionButton({
          icon: 'handshake',
          tone: 'primary',
          label: 'Repayment Received for Money I Lent',
          subtitle: 'Apply toward an active borrower record without distorting income',
          onClick: function() {
            var lentList = Array.isArray(agrs.lent) ? agrs.lent : [];
            if (lentList.length === 0) {
              window.__stitchConfirm({
                variant: 'info',
                title: 'No Active Receivables Found',
                message: 'You have no active lent records to apply this repayment to. Would you like to record it as Income instead?',
                confirmLabel: 'Record as Income',
                cancelLabel: 'Back',
                onConfirm: function() { submitChoice({ action: 'income' }); },
                onCancel: function() { postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' }); }
              });
              shell.close(false);
              return;
            }
            window.__stitchDropdown({
              title: 'Select Borrower Receivable',
              subtitle: amountFormatted + ' received from ' + counterparty,
              searchable: true,
              options: lentList.map(function(a) {
                return { value: a.id, label: a.counterpartyName, subtitle: a.subtitle, badge: a.remainingFormatted, icon: 'person' };
              }),
              onSelect: function(agreementId) {
                submitChoice({ action: 'repayment_lent', agreementId: agreementId });
              },
              onCancel: function() {
                postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' });
              }
            });
            shell.close(false);
          }
        });

        addOptionButton({
          icon: 'request_quote',
          tone: 'warning',
          label: 'Money Borrowed',
          subtitle: 'Disbursement received from a peer or loan facility',
          onClick: function() {
            window.__stitchActionSheet({
              title: 'Choose Borrowing Mode',
              subtitle: amountFormatted + ' from ' + counterparty,
              actions: [
                { id: 'casual', label: 'Casual Borrowing (0% Friend / Family)', subtitle: 'Simple balance owed', icon: 'group', tone: 'warning', onSelect: function() { submitChoice({ action: 'borrowed', mode: 'casual' }); } },
                { id: 'formal', label: 'Loan Agreement (Bank / SACCO / App)', subtitle: 'Formal rate, duration & penalty terms', icon: 'account_balance', tone: 'danger', onSelect: function() { submitChoice({ action: 'borrowed', mode: 'formal' }); } }
              ],
              onCancel: function() {
                postBridge({ type: 'sms.classify.reopen', detectionId: detection.id || '' });
              }
            });
            shell.close(false);
          }
        });
      }

      addOptionButton({
        icon: 'swap_horiz',
        label: isIncoming ? 'Other / Refund / Internal Transfer' : 'Other / Internal Transfer',
        subtitle: 'Mark reviewed and exclude from budget & loan ledgers',
        onClick: function() {
          submitChoice({ action: isIncoming ? 'other_refund' : 'other_transfer' });
        }
      });

      shell.backdrop.appendChild(card);
      card.querySelector('[data-sms-later]').addEventListener('click', function() {
        if (submitted) return;
        submitted = true;
        shell.close(false);
        postBridge({ type: 'sms.classify.defer', detectionId: detection.id || '' });
      });
      card.querySelector('[data-sms-dismiss]').addEventListener('click', function() {
        submitChoice({ action: 'dismiss' });
      });
      return shell.close;
    };

    // ── Manual / Paste M-PESA & Bank SMS Import Modal (Play-Compliant Alternative) ──
    window.__stitchManualSmsImportModal = function() {
      var shell = createModalShell({ sheet: true });
      var card = document.createElement('div');
      card.className = 'stitch-modal-card';
      card.innerHTML =
        '<div class="stitch-modal-handle"></div>' +
        '<div class="stitch-modal-header">' +
          '<div class="stitch-modal-badge tone-info"><span class="material-symbols-outlined">content_paste_go</span></div>' +
          '<div><h3 class="stitch-modal-title">Import M-PESA / Bank SMS Text</h3><p class="stitch-modal-sub">Paste one or more transaction messages below. Parsed strictly on your device—no SMS permissions needed.</p></div>' +
        '</div>' +
        '<div class="stitch-modal-body">' +
          '<textarea id="xp-manual-sms-input" rows="5" placeholder="e.g. UA10XYZ901 Confirmed. Ksh 1,500.00 paid to NAIVAS SUPERMARKET on 26/11/26 at 10:15 AM..." style="width:100%;border-radius:14px;border:1.5px solid var(--border-subtle);background:var(--surface-container-low);color:var(--text-primary);padding:12px;font-size:13px;outline:none;resize:vertical;"></textarea>' +
          '<p style="margin:8px 0 0;font-size:11.5px;color:var(--text-secondary);">Supports M-PESA Paybill, Till, Send Money, Pochi, Fuliza split &amp; recovery, and PesaLink/Bank SMS.</p>' +
        '</div>' +
        '<div class="stitch-modal-footer">' +
          '<button type="button" class="stitch-btn stitch-btn-secondary" data-manual-cancel>Cancel</button>' +
          '<button type="button" class="stitch-btn stitch-btn-primary" data-manual-parse>Parse &amp; Review</button>' +
        '</div>';
      shell.backdrop.appendChild(card);
      card.querySelector('[data-manual-cancel]').addEventListener('click', function() { shell.close(true); });
      card.querySelector('[data-manual-parse]').addEventListener('click', function() {
        var ta = card.querySelector('#xp-manual-sms-input');
        var rawText = (ta && ta.value || '').trim();
        if (!rawText) {
          window.__stitchToast && window.__stitchToast('Paste an M-PESA or bank message first.', 'warning');
          return;
        }
        shell.close(false);
        postBridge({ type: 'sms.manual.import', rawText: rawText });
      });
      return shell.close;
    };

    window.__stitchUI = {
      feedback: window.__stitchFeedback,
      alert: window.__stitchAlert,
      confirm: window.__stitchConfirm,
      actionSheet: window.__stitchActionSheet,
      dropdown: window.__stitchDropdown,
      searchSelect: window.__stitchSearchSelect,
      datePicker: window.__stitchDatePicker,
      toast: window.__stitchToast,
      penaltyModal: window.__stitchPenaltyModal,
      smsClassification: window.__stitchSmsClassification,
      manualSmsImport: window.__stitchManualSmsImportModal,
      enhanceSelects: window.__stitchEnhanceSelects,
      syncSelectUI: window.__stitchSyncSelectUI,
      createModalShell: createModalShell,
      registerCustomModal: registerCustomModal,
      unregisterCustomModal: unregisterCustomModal,
      closeTopModal: window.__stitchCloseTopModal,
      getOpenModalCount: function() { return modalStack.length; },
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        attachDatePickers();
        window.__stitchEnhanceSelects();
      });
    } else {
      attachDatePickers();
      window.__stitchEnhanceSelects();
    }
  })();
  `;
}
