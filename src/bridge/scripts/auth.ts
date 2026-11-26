import { sharedScript } from './shared'

export function authScript(mode: 'signin' | 'signup' | 'forgotPassword') {
  return `
${sharedScript()}
(function() {
  var authMode = ${JSON.stringify(mode)};
  var data = window.__STITCH_DATA__ || {};
  var inFlight = false;

  function showInlineError(el, msg) {
    if (!el) return;
    if (msg) {
      el.textContent = msg;
      el.classList.remove('hidden');
    } else {
      el.textContent = '';
      el.classList.add('hidden');
    }
  }

  function showBanner(bannerId, tone, msg) {
    var banner = document.getElementById(bannerId);
    if (!banner) return;
    if (!msg) {
      banner.className = 'hidden rounded-2xl px-3.5 py-3 text-xs font-medium leading-relaxed border';
      banner.textContent = '';
      return;
    }
    var toneClasses = {
      error: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
      warning: 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200',
      info: 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-200',
      success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300',
    };
    banner.className = 'rounded-2xl px-3.5 py-3 text-xs font-medium leading-relaxed border xp-surface-enter ' + (toneClasses[tone] || toneClasses.info);
    banner.textContent = msg;
  }

  function wirePasswordToggle(inputId, btnId) {
    var input = document.getElementById(inputId);
    var btn = document.getElementById(btnId);
    if (!input || !btn) return;
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var nextVisible = input.type === 'password';
      input.type = nextVisible ? 'text' : 'password';
      btn.setAttribute('aria-pressed', nextVisible ? 'true' : 'false');
      btn.setAttribute('aria-label', nextVisible ? 'Hide password' : 'Show password');
      var icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = nextVisible ? 'visibility_off' : 'visibility';
    });
  }

  function setLoading(submitBtnId, labelId, spinnerId, busy, idleText, busyText) {
    inFlight = busy;
    var btn = document.getElementById(submitBtnId);
    var lbl = document.getElementById(labelId);
    var spn = document.getElementById(spinnerId);
    if (btn) btn.disabled = busy;
    if (lbl) lbl.textContent = busy ? busyText : idleText;
    if (spn) spn.classList.toggle('hidden', !busy);
  }

  // Expose host-invoked callback so ONLY verified auth responses trigger inline shake/banners
  window.__stitchAuthResult = function(res) {
    inFlight = false;
    if (!res) return;
    if (authMode === 'signin') {
      setLoading('btn-signin-submit', 'signin-submit-label', 'signin-submit-spinner', false, 'Sign In', 'Signing In...');
      var pwWrap = document.getElementById('signin-password-wrap');
      var pwInput = document.getElementById('signin-password');
      var pwErr = document.getElementById('signin-password-error');
      showBanner('auth-status-banner', 'info', '');
      showInlineError(pwErr, '');
      if (pwInput) pwInput.classList.remove('xp-input-error');
      if (pwWrap) pwWrap.classList.remove('xp-shake');

      if (!res.ok) {
        if (res.errorType === 'invalid_credentials') {
          if (pwInput) pwInput.classList.add('xp-input-error');
          showInlineError(pwErr, res.message || 'Incorrect password. Please try again.');
          if (pwWrap) {
            void pwWrap.offsetWidth;
            pwWrap.classList.add('xp-shake');
          }
          if (pwInput) {
            pwInput.focus();
            pwInput.select && pwInput.select();
          }
        } else if (res.errorType === 'rate_limited') {
          showBanner('auth-status-banner', 'warning', res.message || 'Too many attempts. Please wait a moment.');
        } else if (res.errorType === 'email_not_confirmed') {
          showBanner('auth-status-banner', 'info', res.message || 'Please verify your email address before signing in.');
        } else if (res.errorType === 'network') {
          showBanner('auth-status-banner', 'warning', res.message || 'Network unavailable. Check connection and try again.');
        } else {
          showBanner('auth-status-banner', 'error', res.message || 'Sign-in could not be completed.');
        }
      }
      return;
    }

    if (authMode === 'signup') {
      setLoading('btn-signup-submit', 'signup-submit-label', 'signup-submit-spinner', false, 'Create Account', 'Creating Account...');
      if (res.ok) {
        if (res.requiresGuardianConsent) {
          showBanner('auth-status-banner', 'warning', res.message);
        } else if (res.requiresEmailVerification) {
          showBanner('auth-status-banner', 'success', res.message);
        }
      } else {
        showBanner('auth-status-banner', res.errorType === 'network' ? 'warning' : 'error', res.message || 'Could not create account.');
      }
      return;
    }

    if (authMode === 'forgotPassword') {
      var btn = document.getElementById('btn-recovery-submit');
      var lbl = document.getElementById('recovery-submit-label');
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Send Recovery Instructions';
      if (res.ok) {
        showBanner('recovery-status-banner', 'success', res.message);
        var nextSteps = document.getElementById('recovery-next-steps');
        if (nextSteps) nextSteps.classList.remove('hidden');
        if (window.__startRecoveryCooldown) window.__startRecoveryCooldown(60);
      } else {
        showBanner('recovery-status-banner', res.errorType === 'network' ? 'warning' : 'error', res.message);
      }
    }
  };

  if (authMode === 'signin') {
    wirePasswordToggle('signin-password', 'toggle-signin-password');
    var signinForm = document.getElementById('signin-form');
    var emailEl = document.getElementById('signin-email');
    var passEl = document.getElementById('signin-password');
    var emailErr = document.getElementById('signin-email-error');
    var passErr = document.getElementById('signin-password-error');
    if (emailEl && data.routeParams && data.routeParams.email) {
      emailEl.value = data.routeParams.email;
    }
    if (passEl) {
      passEl.addEventListener('input', function() {
        passEl.classList.remove('xp-input-error');
        showInlineError(passErr, '');
      });
    }
    if (emailEl) {
      emailEl.addEventListener('input', function() {
        showInlineError(emailErr, '');
      });
    }
    if (signinForm) {
      signinForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (inFlight) return;
        var email = (emailEl && emailEl.value || '').trim();
        var password = passEl && passEl.value || '';
        showBanner('auth-status-banner', 'info', '');
        showInlineError(emailErr, '');
        showInlineError(passErr, '');
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email)) {
          showInlineError(emailErr, 'Enter a valid email address.');
          emailEl && emailEl.focus();
          return;
        }
        if (!password) {
          showInlineError(passErr, 'Enter your password to continue.');
          passEl && passEl.focus();
          return;
        }
        setLoading('btn-signin-submit', 'signin-submit-label', 'signin-submit-spinner', true, 'Sign In', 'Signing In...');
        window.__stitchPost({ type: 'auth.email', mode: 'signin', email: email, password: password });
      });
    }
    var forgotBtn = document.getElementById('btn-forgot-password');
    if (forgotBtn) {
      forgotBtn.addEventListener('click', function() {
        var email = (emailEl && emailEl.value || '').trim();
        window.__stitchPost({ type: 'auth.switch', mode: 'forgotPassword', email: email });
      });
    }
    var switchSignup = document.getElementById('btn-switch-signup');
    if (switchSignup) {
      switchSignup.addEventListener('click', function() {
        window.__stitchPost({ type: 'auth.switch', mode: 'signup' });
      });
    }
  }

  if (authMode === 'signup') {
    wirePasswordToggle('signup-password', 'toggle-signup-password');
    wirePasswordToggle('signup-confirm-password', 'toggle-signup-confirm');
    var ageBracket = 'adult_18_plus';
    var btnAdult = document.getElementById('age-btn-adult');
    var btnMinor = document.getElementById('age-btn-minor');
    var guardianAcc = document.getElementById('guardian-fields-accordion');

    function setAgeBracket(next) {
      ageBracket = next;
      var isMinor = next === 'under_18';
      if (btnAdult) {
        btnAdult.setAttribute('aria-checked', isMinor ? 'false' : 'true');
        btnAdult.setAttribute('data-selected', isMinor ? 'false' : 'true');
      }
      if (btnMinor) {
        btnMinor.setAttribute('aria-checked', isMinor ? 'true' : 'false');
        btnMinor.setAttribute('data-selected', isMinor ? 'true' : 'false');
      }
      if (guardianAcc) guardianAcc.setAttribute('data-open', isMinor ? 'true' : 'false');
    }

    btnAdult && btnAdult.addEventListener('click', function() { setAgeBracket('adult_18_plus'); });
    btnMinor && btnMinor.addEventListener('click', function() { setAgeBracket('under_18'); });

    var suPass = document.getElementById('signup-password');
    var suConfirm = document.getElementById('signup-confirm-password');
    var suEmail = document.getElementById('signup-email');
    var suName = document.getElementById('signup-fullname');
    var suConsent = document.getElementById('signup-legal-consent');

    function updateStrengthUI(pw) {
      var len = pw.length >= 8;
      var low = /[a-z]/.test(pw);
      var up = /[A-Z]/.test(pw);
      var num = /\\d/.test(pw);
      var sym = /[^A-Za-z0-9]/.test(pw);
      var score = 0;
      if (len) score++;
      if (low && up) score++;
      if (num) score++;
      if (sym || pw.length >= 12) score++;
      var colors = ['bg-rose-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500'];
      var labels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
      for (var i = 1; i <= 4; i++) {
        var bar = document.getElementById('pw-bar-' + i);
        if (bar) {
          bar.className = 'flex-1 rounded-full transition-colors ' + (i <= score ? colors[Math.max(0, score - 1)] : 'bg-outline-variant/40');
        }
      }
      var lbl = document.getElementById('pw-strength-label');
      var hint = document.getElementById('pw-strength-hint');
      if (lbl) lbl.textContent = pw ? labels[score] : 'Password strength';
      if (hint) {
        if (!len) hint.textContent = 'Need at least 8 characters';
        else if (!up || !num) hint.textContent = 'Add uppercase & number for better security';
        else hint.textContent = 'Ready';
      }
    }

    suPass && suPass.addEventListener('input', function() {
      updateStrengthUI(suPass.value || '');
      showInlineError(document.getElementById('signup-password-error'), '');
    });
    suConfirm && suConfirm.addEventListener('input', function() {
      var err = document.getElementById('signup-confirm-error');
      if (suConfirm.value && suPass && suConfirm.value !== suPass.value) {
        showInlineError(err, 'Passwords do not match yet.');
      } else {
        showInlineError(err, '');
      }
    });

    var suForm = document.getElementById('signup-form');
    suForm && suForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (inFlight) return;
      var fullName = (suName && suName.value || '').trim();
      var email = (suEmail && suEmail.value || '').trim();
      var password = suPass && suPass.value || '';
      var confirmPw = suConfirm && suConfirm.value || '';
      var guardianName = (document.getElementById('guardian-name')?.value || '').trim();
      var guardianEmail = (document.getElementById('guardian-email')?.value || '').trim();
      var accepted = Boolean(suConsent && suConsent.checked);

      showBanner('auth-status-banner', 'info', '');
      showInlineError(document.getElementById('signup-fullname-error'), '');
      showInlineError(document.getElementById('signup-email-error'), '');
      showInlineError(document.getElementById('signup-password-error'), '');
      showInlineError(document.getElementById('signup-confirm-error'), '');
      showInlineError(document.getElementById('guardian-error'), '');
      showInlineError(document.getElementById('signup-consent-error'), '');

      if (fullName.length < 2) {
        showInlineError(document.getElementById('signup-fullname-error'), 'Please enter your full name.');
        suName && suName.focus();
        return;
      }
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email)) {
        showInlineError(document.getElementById('signup-email-error'), 'Please enter a valid email address.');
        suEmail && suEmail.focus();
        return;
      }
      if (password.length < 8) {
        showInlineError(document.getElementById('signup-password-error'), 'Password must be at least 8 characters long.');
        suPass && suPass.focus();
        return;
      }
      if (password !== confirmPw) {
        showInlineError(document.getElementById('signup-confirm-error'), 'Passwords must match.');
        suConfirm && suConfirm.focus();
        return;
      }
      if (ageBracket === 'under_18') {
        if (guardianName.length < 2 || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(guardianEmail)) {
          showInlineError(document.getElementById('guardian-error'), 'Enter your parent or legal guardian’s full name and valid email address.');
          return;
        }
        if (guardianEmail.toLowerCase() === email.toLowerCase()) {
          showInlineError(document.getElementById('guardian-error'), 'Guardian email must differ from the minor account email.');
          return;
        }
      }
      if (!accepted) {
        showInlineError(document.getElementById('signup-consent-error'), 'Please confirm acceptance of the Terms of Service and Privacy Policy.');
        return;
      }

      setLoading('btn-signup-submit', 'signup-submit-label', 'signup-submit-spinner', true, 'Create Account', 'Creating Account...');
      window.__stitchPost({
        type: 'auth.email',
        mode: 'signup',
        fullName: fullName,
        email: email,
        password: password,
        ageBracket: ageBracket,
        guardianName: guardianName,
        guardianEmail: guardianEmail,
        acceptedLegal: accepted,
      });
    });

    var switchSignin = document.getElementById('btn-switch-signin');
    switchSignin && switchSignin.addEventListener('click', function() {
      window.__stitchPost({ type: 'auth.switch', mode: 'signin' });
    });
  }

  if (authMode === 'forgotPassword') {
    var recEmail = document.getElementById('recovery-email');
    var recErr = document.getElementById('recovery-email-error');
    var recForm = document.getElementById('recovery-form');
    var resendBtn = document.getElementById('btn-recovery-resend');
    var countdownText = document.getElementById('recovery-countdown-text');
    var cooldownTimer = null;

    if (recEmail && data.routeParams && data.routeParams.email) {
      recEmail.value = data.routeParams.email;
    }

    window.__startRecoveryCooldown = function(seconds) {
      clearInterval(cooldownTimer);
      var left = seconds;
      if (resendBtn) resendBtn.disabled = true;
      function tick() {
        if (left <= 0) {
          clearInterval(cooldownTimer);
          if (resendBtn) resendBtn.disabled = false;
          if (countdownText) countdownText.textContent = 'Didn’t receive it? You can resend now.';
          return;
        }
        if (countdownText) countdownText.textContent = 'Resend available in ' + left + 's';
        left--;
      }
      tick();
      cooldownTimer = setInterval(tick, 1000);
    };

    function sendRecovery() {
      if (inFlight) return;
      var email = (recEmail && recEmail.value || '').trim();
      showInlineError(recErr, '');
      showBanner('recovery-status-banner', 'info', '');
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(email)) {
        showInlineError(recErr, 'Enter a valid email address.');
        recEmail && recEmail.focus();
        return;
      }
      inFlight = true;
      var btn = document.getElementById('btn-recovery-submit');
      var lbl = document.getElementById('recovery-submit-label');
      if (btn) btn.disabled = true;
      if (lbl) lbl.textContent = 'Sending...';
      window.__stitchPost({ type: 'auth.password.reset', email: email });
    }

    recForm && recForm.addEventListener('submit', function(e) {
      e.preventDefault();
      sendRecovery();
    });
    resendBtn && resendBtn.addEventListener('click', function() {
      sendRecovery();
    });
    var backBtn = document.getElementById('btn-back-to-signin');
    backBtn && backBtn.addEventListener('click', function() {
      window.__stitchPost({ type: 'auth.switch', mode: 'signin', email: (recEmail && recEmail.value || '').trim() });
    });
  }

  var googleButton = document.getElementById('btn-google-signin');
  if (googleButton) {
    googleButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (inFlight) return;
      window.__stitchPost({ type: 'auth.google', mode: authMode });
    });
  }
})();
`
}
