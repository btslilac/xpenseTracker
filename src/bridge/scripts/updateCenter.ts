import { sharedScript } from './shared'

export function updateCenterScript(): string {
  return `
    ${sharedScript()}
    (function() {
      var data = window.__STITCH_DATA__ || {};
      var latestRelease = data.availableUpdate || null;
      var versionCurrent = document.getElementById('version-current');
      var channelName = document.getElementById('channel-name');
      var btnCheck = document.getElementById('btn-check-update');
      var btnDownload = document.getElementById('btn-download-update');
      var btnLater = document.getElementById('btn-update-later');
      var statusPill = document.getElementById('status-pill');
      var statusText = document.getElementById('status-text');
      var cardAvailable = document.getElementById('update-available-card');
      var titleAvailable = document.getElementById('update-available-title');
      var verAvailable = document.getElementById('update-available-version');
      var notesAvailable = document.getElementById('update-available-notes');

      if (versionCurrent) {
        versionCurrent.textContent = 'XpenseTracker v' + (data.currentVersion || '1.0.2') + ' (Build ' + (data.buildNumber || '3') + ')';
      }
      if (channelName) {
        channelName.textContent = 'Release Channel: ' + (data.channel || 'Production (Hermes)');
      }

      function applyUpdateResult(res) {
        if (btnCheck) {
          btnCheck.disabled = false;
          btnCheck.classList.remove('opacity-70');
        }
        res = res || {};
        if (res.status === 'update_available' && res.latestRelease) {
          latestRelease = res.latestRelease;
          if (cardAvailable) cardAvailable.classList.remove('hidden');
          if (titleAvailable) titleAvailable.textContent = latestRelease.releaseTitle || 'New Version Available';
          if (verAvailable) verAvailable.textContent = 'v' + String(latestRelease.version || '').replace(/^v/i, '');
          if (notesAvailable) notesAvailable.textContent = latestRelease.releaseNotes || 'Bug fixes and performance improvements.';
          if (statusText) statusText.textContent = 'Update available (v' + String(latestRelease.version || '').replace(/^v/i, '') + ')';
          if (statusPill) {
            statusPill.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5';
          }
          if (btnDownload) {
            btnDownload.disabled = false;
            btnDownload.textContent = latestRelease.storeUrl ? 'Download Update' : 'Release Info';
          }
          return;
        }

        if (cardAvailable) cardAvailable.classList.add('hidden');

        if (res.status === 'offline' || res.status === 'error') {
          if (statusText) statusText.textContent = res.status === 'offline' ? 'Offline · Unable to check' : 'Update check failed';
          if (statusPill) {
            statusPill.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1.5';
          }
          return;
        }

        if (statusText) statusText.textContent = 'Your app is up to date';
        if (statusPill) {
          statusPill.className = 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5';
        }
      }

      window.__stitchUpdateCenterResult = applyUpdateResult;
      window.__stitchUpdateDownloadState = function(stateLabel) {
        if (!btnDownload) return;
        btnDownload.disabled = false;
        btnDownload.textContent = stateLabel === 'opened' ? 'Opened Installer Link' : 'Download Update';
      };

      if (latestRelease) {
        applyUpdateResult({ status: 'update_available', latestRelease: latestRelease });
      }

      if (btnCheck) {
        btnCheck.addEventListener('click', function() {
          if (statusText) statusText.textContent = 'Checking for updates...';
          btnCheck.disabled = true;
          btnCheck.classList.add('opacity-70');
          var payload = { type: 'updates.check' };
          if (window.__stitchPost) window.__stitchPost(payload);
          else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
          setTimeout(function() {
            if (btnCheck.disabled) {
              btnCheck.disabled = false;
              btnCheck.classList.remove('opacity-70');
            }
          }, 8000);
        });
      }

      if (btnDownload) {
        btnDownload.addEventListener('click', function() {
          btnDownload.disabled = true;
          btnDownload.textContent = 'Opening download...';
          var payload = {
            type: 'updates.download',
            version: latestRelease ? latestRelease.version : '',
            storeUrl: latestRelease ? latestRelease.storeUrl : '',
            updateType: latestRelease ? latestRelease.updateType : 'native',
          };
          if (window.__stitchPost) window.__stitchPost(payload);
          else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
          setTimeout(function() {
            btnDownload.disabled = false;
            btnDownload.textContent = 'Download Update';
          }, 3000);
        });
      }

      if (btnLater) {
        btnLater.addEventListener('click', function() {
          if (window.__stitchPost) window.__stitchPost({ type: 'back' });
          else if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'back' }));
          }
        });
      }
    })();
  `
}
