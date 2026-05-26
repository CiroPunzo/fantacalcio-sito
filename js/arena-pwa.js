(function () {
  'use strict';

  const PFA_PWA_VERSION = 'pwa-v1';
  const STORAGE = {
    notifications: 'pfa_arena_notifications_pref',
    installDismissed: 'pfa_arena_install_dismissed',
    lastReminder: 'pfa_arena_last_reminder_key'
  };

  const page = (location.pathname.split('/').pop() || 'arena.html').toLowerCase();
  const isAuthPage = ['login.html', 'register.html', 'auth-confirmed.html'].includes(page);
  const isArenaPage = page.endsWith('.html') || page === '';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function storageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  }

  function createEl(tag, className, html) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (html) el.innerHTML = html;
    return el;
  }

  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register('sw.js?v=' + PFA_PWA_VERSION, { scope: './' });
      return reg;
    } catch (err) {
      console.warn('[PFA Arena] Service worker non registrato:', err);
      return null;
    }
  }

  async function showLocalNotification(title, options) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      const reg = await navigator.serviceWorker.getRegistration('./');
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options || {});
      } else {
        new Notification(title, options || {});
      }
    } catch (err) {
      console.warn('[PFA Arena] Notifica non inviata:', err);
    }
  }

  function showNotificationPrompt() {
    if (isAuthPage) return;
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      storageSet(STORAGE.notifications, 'enabled');
      return;
    }
    if (Notification.permission === 'denied') return;
    if (storageGet(STORAGE.notifications)) return;

    setTimeout(() => {
      if (document.querySelector('.pfa-notification-toast')) return;

      const toast = createEl('div', 'pfa-notification-toast', `
        <button type="button" class="pfa-toast-close" aria-label="Chiudi">×</button>
        <span class="pfa-toast-kicker">Promemoria Arena</span>
        <strong>Non perdere streak e prediction.</strong>
        <p>Attiva notifiche leggere per ricordarti nuovi match, reward e missioni.</p>
        <div class="pfa-toast-actions">
          <button type="button" class="pfa-toast-primary">Attiva</button>
          <button type="button" class="pfa-toast-secondary">Più tardi</button>
        </div>
      `);

      document.body.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('is-visible'));

      const close = () => {
        toast.classList.remove('is-visible');
        setTimeout(() => toast.remove(), 260);
      };

      toast.querySelector('.pfa-toast-close')?.addEventListener('click', () => {
        storageSet(STORAGE.notifications, 'dismissed');
        close();
      });

      toast.querySelector('.pfa-toast-secondary')?.addEventListener('click', () => {
        storageSet(STORAGE.notifications, 'later');
        close();
      });

      toast.querySelector('.pfa-toast-primary')?.addEventListener('click', async () => {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            storageSet(STORAGE.notifications, 'enabled');
            await showLocalNotification('ProFantasy Arena attivata', {
              body: 'Ti ricorderemo prediction, streak e reward quando il browser lo permette.',
              icon: 'img/favicon-192x192.png',
              badge: 'img/favicon-192x192.png',
              tag: 'pfa-arena-enabled'
            });
          } else {
            storageSet(STORAGE.notifications, 'dismissed');
          }
        } catch (_) {
          storageSet(STORAGE.notifications, 'dismissed');
        }
        close();
      });
    }, 2200);
  }

  function getUpcomingFixture() {
    const fixtures = window.PFA_WORLD_CUP_FIXTURES || window.WORLD_CUP_FIXTURES || window.PFA_FIXTURES || [];
    if (!Array.isArray(fixtures) || !fixtures.length) return null;
    const now = Date.now();
    const candidates = fixtures
      .map((m) => {
        const raw = m.kickoffISO || m.kickoff || m.datetime || m.dateTime || (m.date && m.time ? `${m.date}T${m.time}:00+02:00` : null);
        const ts = raw ? new Date(raw).getTime() : NaN;
        return { match: m, ts };
      })
      .filter((item) => Number.isFinite(item.ts) && item.ts > now)
      .sort((a, b) => a.ts - b.ts);
    return candidates[0] || null;
  }

  function setupLightReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    if (storageGet(STORAGE.notifications) !== 'enabled') return;

    const check = async () => {
      const next = getUpcomingFixture();
      if (!next) return;
      const diff = next.ts - Date.now();
      const oneHour = 60 * 60 * 1000;
      const fiveMin = 5 * 60 * 1000;
      if (diff > oneHour || diff < 0) return;

      const match = next.match || {};
      const home = match.home || match.homeName || match.home_code || 'Home';
      const away = match.away || match.awayName || match.away_code || 'Away';
      const key = `${match.id || home + '-' + away}-${new Date(next.ts).toISOString().slice(0, 13)}`;
      if (storageGet(STORAGE.lastReminder) === key) return;
      storageSet(STORAGE.lastReminder, key);

      await showLocalNotification('Prediction in arrivo', {
        body: `${home} vs ${away} inizia tra meno di 1 ora. Entra nell’Arena e proteggi la tua streak.`,
        icon: 'img/favicon-192x192.png',
        badge: 'img/favicon-192x192.png',
        tag: 'pfa-next-match-' + key,
        data: { url: 'daily-prediction.html' },
        requireInteraction: diff <= fiveMin
      });
    };

    setTimeout(check, 5000);
    setInterval(check, 60000);
  }

  function setupInstallPrompt() {
    if (isAuthPage || !isArenaPage) return;

    let deferredPrompt = null;
    const dismissedAt = Number(storageGet(STORAGE.installDismissed) || 0);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < sevenDays) return;

    function showInstallCard(mode) {
      if (document.querySelector('.pfa-install-card')) return;
      const isIos = mode === 'ios';
      const card = createEl('div', 'pfa-install-card', `
        <button type="button" class="pfa-install-close" aria-label="Chiudi">×</button>
        <span class="pfa-install-kicker">Collegamento rapido</span>
        <strong>${isIos ? 'Aggiungi l’Arena alla Home' : 'Scarica l’App Arena'}</strong>
        <p>${isIos ? 'Su iPhone: Condividi → Aggiungi alla schermata Home.' : 'Installa il collegamento rapido e rientra nel gioco in un tap.'}</p>
        <div class="pfa-install-actions">
          ${isIos ? '<button type="button" class="pfa-install-secondary">Ho capito</button>' : '<button type="button" class="pfa-install-primary">Installa</button><button type="button" class="pfa-install-secondary">Più tardi</button>'}
        </div>
      `);
      document.body.appendChild(card);
      requestAnimationFrame(() => card.classList.add('is-visible'));

      const close = () => {
        card.classList.remove('is-visible');
        setTimeout(() => card.remove(), 260);
      };

      card.querySelector('.pfa-install-close')?.addEventListener('click', () => {
        storageSet(STORAGE.installDismissed, String(Date.now()));
        close();
      });
      card.querySelector('.pfa-install-secondary')?.addEventListener('click', () => {
        storageSet(STORAGE.installDismissed, String(Date.now()));
        close();
      });
      card.querySelector('.pfa-install-primary')?.addEventListener('click', async () => {
        if (!deferredPrompt) return close();
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => null);
        deferredPrompt = null;
        storageSet(STORAGE.installDismissed, String(Date.now()));
        close();
      });
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPrompt = event;
      setTimeout(() => showInstallCard('native'), 4600);
    });

    const ua = navigator.userAgent || '';
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (isIos && !isStandalone) {
      setTimeout(() => showInstallCard('ios'), 5200);
    }
  }

  ready(async () => {
    await registerServiceWorker();
    showNotificationPrompt();
    setupInstallPrompt();
    setupLightReminders();
  });
})();
