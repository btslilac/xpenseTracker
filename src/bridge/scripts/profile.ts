import { sharedScript } from './shared'

export function profileScript() {
  return `
${sharedScript()}
(function() {
  var data = window.__STITCH_DATA__ || {};

  // ── Identity ──
  try {
    var nameNode = document.getElementById('user-name');
    var emailNode = document.getElementById('user-email');
    var currencyBadge = document.getElementById('user-currency-badge');
    if (nameNode) nameNode.textContent = data.fullName || 'User';
    if (emailNode) emailNode.textContent = data.email || '';
    if (currencyBadge && data.currency) currencyBadge.textContent = data.currency;
    var versionNode = document.getElementById('profile-version-subtitle');
    if (versionNode && data.appVersion) {
      versionNode.textContent = 'Version ' + data.appVersion + ' (Build ' + (data.buildNumber || '3') + ') · Check for updates';
    }
  } catch(e) { console.error('profile:identity', e); }

  // ── Appearance summary + style pill ──
  try {
    var summaryNode = document.getElementById('profile-appearance-summary');
    var pillNode = document.getElementById('profile-style-pill');
    if (data.appearanceStyle) {
      var styleName = data.appearanceStyle === 'material-expressive' ? 'Material 3' : 'Liquid Glass';
      var schemeName = data.appearanceScheme
        ? (data.appearanceScheme.charAt(0).toUpperCase() + data.appearanceScheme.slice(1))
        : 'System';
      var themeName = data.appearanceTheme
        ? (data.appearanceTheme.charAt(0).toUpperCase() + data.appearanceTheme.slice(1))
        : 'Concept';
      var pureBlackSuffix = data.appearancePureBlack ? ' · Pure Black' : '';
      if (summaryNode) summaryNode.textContent = styleName + ' · ' + schemeName + pureBlackSuffix + ' · ' + themeName;
      if (pillNode) pillNode.textContent = styleName;
    }
  } catch(e) { console.error('profile:appearance-summary', e); }

  // ── Avatar ──
  try {
    var avatarUrl = String(data.avatarUrl || '').trim();
    if (avatarUrl) {
      document.querySelectorAll('#profile-avatar, img[alt*="User"], img[alt*="Avatar"], img[alt*="Profile"]').forEach(function(img) {
        img.setAttribute('src', avatarUrl);
      });
    }
  } catch(e) { console.error('profile:avatar', e); }

  // ── Edit Photo button ──
  try {
    var editPhoto = document.getElementById('btn-edit-photo');
    if (editPhoto) {
      editPhoto.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (window.__stitchPost) window.__stitchPost({ type: 'profile.avatar.pick' });
      };
    }
  } catch(e) { console.error('profile:edit-photo', e); }

  // ── Lending toggle ──
  try {
    var toggleLending = document.getElementById('toggle-lending-workspace');
    var btnLendingProfile = document.getElementById('btn-lending-profile');
    if (toggleLending) {
      toggleLending.checked = Boolean(data.lendingEnabled);
      if (btnLendingProfile) {
        btnLendingProfile.style.display = Boolean(data.lendingEnabled) ? 'flex' : 'none';
      }
      toggleLending.addEventListener('change', function() {
        if (btnLendingProfile) {
          btnLendingProfile.style.display = toggleLending.checked ? 'flex' : 'none';
        }
        if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'settings.lending.toggle',
            enabled: toggleLending.checked
          }));
        }
      });
    }
  } catch(e) { console.error('profile:lending-toggle', e); }

  // ── Biometric lock toggle ──
  try {
    var toggleBio = document.getElementById('toggle-biometric-lock');
    if (toggleBio) {
      toggleBio.checked = Boolean(data.biometricLock);
      toggleBio.addEventListener('change', function() {
        if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'selection' });
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'settings.biometric.toggle',
            enabled: toggleBio.checked
          }));
        }
      });
    }
  } catch(e) { console.error('profile:biometric-toggle', e); }

  // ── SMS detection toggle ──
  try {
    var toggleSms = document.getElementById('toggle-sms-detection');
    window.__stitchSetSmsToggleState = function(enabled) {
      if (toggleSms) toggleSms.checked = Boolean(enabled);
    };
    if (toggleSms) {
      toggleSms.checked = Boolean(data.smsTransactionDetection);
      toggleSms.addEventListener('change', function() {
        if (window.__stitchPost) window.__stitchPost({ type: 'haptic', style: 'light' });
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'settings.sms.toggle',
            enabled: toggleSms.checked
          }));
        }
      });
    }
  } catch(e) { console.error('profile:sms-toggle', e); }
})();
`
}
