(function () {
  'use strict';

  const PFA_PWA_VERSION = 'pwa-install-nudge-v2';
  const STORAGE = {
    notifications: 'pfa_arena_notifications_pref',
    installDismissed: 'pfa_arena_install_dismissed',
    lastReminder: 'pfa_arena_last_reminder_key',
    installHelpDismissed: 'pfa_arena_install_help_dismissed',
    installCompleted: 'pfa_arena_install_completed'
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

  function isStandaloneMode() {
    return Boolean(window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches;
  }

  function getPlatformMode() {
    const ua = navigator.userAgent || '';
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
    if (isIos) return 'ios';
    if (isAndroid) return 'android';
    if (isSafari) return 'safari';
    return 'desktop';
  }

  function showInstallGuide(mode, deferredPrompt) {
    if (document.querySelector('.pfa-install-modal')) return;

    const steps = mode === 'ios'
      ? ['Tocca il pulsante Condividi di Safari.', 'Scegli “Aggiungi alla schermata Home”.', 'Conferma: l’Arena comparirà come app.']
      : mode === 'android'
        ? ['Tocca “Installa” se compare il popup.', 'Oppure apri il menu ⋮ di Chrome.', 'Scegli “Installa app” o “Aggiungi a schermata Home”.']
        : ['Apri il menu del browser o l’icona installa nella barra URL.', 'Scegli “Installa app” / “Aggiungi collegamento”.', 'Rientra nella World Cup Arena con un click.'];

    const modal = createEl('div', 'pfa-install-modal', `
      <div class="pfa-install-modal-backdrop" data-install-close></div>
      <section class="pfa-install-modal-panel" role="dialog" aria-modal="true" aria-label="Aggiungi Arena alla schermata Home">
        <button type="button" class="pfa-install-modal-close" data-install-close aria-label="Chiudi">×</button>
        <div class="pfa-install-modal-icon">⚡</div>
        <span class="pfa-install-kicker">Arena in un tap</span>
        <h2>Aggiungi ProFantasy Arena alla Home</h2>
        <p>Entra più velocemente, non perdere prediction e streak, e vivi il gioco come una vera app.</p>
        <div class="pfa-install-steps">
          ${steps.map((step, index) => `<div class="pfa-install-step"><strong>${index + 1}</strong><span>${step}</span></div>`).join('')}
        </div>
        <div class="pfa-install-modal-actions">
          ${deferredPrompt ? '<button type="button" class="pfa-install-primary" data-native-install>Installa ora</button>' : ''}
          <button type="button" class="pfa-install-secondary" data-install-close>Ok, ho capito</button>
        </div>
      </section>
    `);

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('is-visible'));

    const close = () => {
      modal.classList.remove('is-visible');
      setTimeout(() => modal.remove(), 260);
    };

    modal.querySelectorAll('[data-install-close]').forEach((btn) => {
      btn.addEventListener('click', () => close());
    });

    modal.querySelector('[data-native-install]')?.addEventListener('click', async () => {
      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(() => null);
        storageSet(STORAGE.installCompleted, 'requested');
      } catch (_) {}
      close();
    });
  }

  function showInstallChip(deferredPromptRef) {
    if (isAuthPage || !isArenaPage || isStandaloneMode()) return;
    if (document.querySelector('.pfa-install-chip')) return;
    if (storageGet(STORAGE.installCompleted) === 'installed') return;

    const dismissedAt = Number(storageGet(STORAGE.installHelpDismissed) || 0);
    const twoDays = 2 * 24 * 60 * 60 * 1000;
    if (dismissedAt && Date.now() - dismissedAt < twoDays) return;

    const chip = createEl('button', 'pfa-install-chip', `
      <span class="pfa-install-chip-icon">📲</span>
      <span><strong>Salva l’Arena</strong><small>Aggiungi alla Home</small></span>
    `);
    chip.type = 'button';
    chip.setAttribute('aria-label', 'Aggiungi ProFantasy Arena alla schermata Home');

    const close = createEl('button', 'pfa-install-chip-x', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Nascondi suggerimento installazione');

    const wrapper = createEl('div', 'pfa-install-chip-wrap');
    wrapper.appendChild(chip);
    wrapper.appendChild(close);
    document.body.appendChild(wrapper);
    requestAnimationFrame(() => wrapper.classList.add('is-visible'));

    chip.addEventListener('click', () => showInstallGuide(getPlatformMode(), deferredPromptRef && deferredPromptRef.current));
    close.addEventListener('click', () => {
      storageSet(STORAGE.installHelpDismissed, String(Date.now()));
      wrapper.classList.remove('is-visible');
      setTimeout(() => wrapper.remove(), 220);
    });
  }

  function setupInstallPrompt() {
    if (isAuthPage || !isArenaPage || isStandaloneMode()) return;

    const deferredPromptRef = { current: null };
    const dismissedAt = Number(storageGet(STORAGE.installDismissed) || 0);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    function showInstallCard(mode) {
      if (document.querySelector('.pfa-install-card') || isStandaloneMode()) return;
      const isIos = mode === 'ios';
      const card = createEl('div', 'pfa-install-card', `
        <button type="button" class="pfa-install-close" aria-label="Chiudi">×</button>
        <span class="pfa-install-kicker">Collegamento rapido</span>
        <strong>${isIos ? 'Aggiungi l’Arena alla Home' : 'Scarica l’App Arena'}</strong>
        <p>${isIos ? 'Su iPhone: Condividi → Aggiungi alla schermata Home.' : 'Installa il collegamento rapido e rientra nel gioco in un tap.'}</p>
        <div class="pfa-install-actions">
          ${isIos ? '<button type="button" class="pfa-install-primary" data-guide>Mostrami come</button><button type="button" class="pfa-install-secondary">Più tardi</button>' : '<button type="button" class="pfa-install-primary">Installa</button><button type="button" class="pfa-install-secondary">Più tardi</button>'}
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
        setTimeout(() => showInstallChip(deferredPromptRef), 900);
      });
      card.querySelector('.pfa-install-secondary')?.addEventListener('click', () => {
        storageSet(STORAGE.installDismissed, String(Date.now()));
        close();
        setTimeout(() => showInstallChip(deferredPromptRef), 900);
      });
      card.querySelector('[data-guide]')?.addEventListener('click', () => {
        close();
        showInstallGuide('ios', null);
      });
      card.querySelector('.pfa-install-primary')?.addEventListener('click', async () => {
        if (isIos || !deferredPromptRef.current) {
          close();
          showInstallGuide(getPlatformMode(), null);
          return;
        }
        deferredPromptRef.current.prompt();
        await deferredPromptRef.current.userChoice.catch(() => null);
        deferredPromptRef.current = null;
        storageSet(STORAGE.installDismissed, String(Date.now()));
        close();
      });
    }

    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      if (!dismissedAt || Date.now() - dismissedAt >= sevenDays) {
        setTimeout(() => showInstallCard('native'), 4200);
      }
      setTimeout(() => showInstallChip(deferredPromptRef), 9000);
    });

    window.addEventListener('appinstalled', () => {
      storageSet(STORAGE.installCompleted, 'installed');
      document.querySelector('.pfa-install-chip-wrap')?.remove();
      document.querySelector('.pfa-install-card')?.remove();
    });

    const platform = getPlatformMode();
    if (platform === 'ios') {
      if (!dismissedAt || Date.now() - dismissedAt >= sevenDays) {
        setTimeout(() => showInstallCard('ios'), 5000);
      }
      setTimeout(() => showInstallChip(deferredPromptRef), 11000);
    } else {
      setTimeout(() => showInstallChip(deferredPromptRef), 12000);
    }
  }

  ready(async () => {
    await registerServiceWorker();
    showNotificationPrompt();
    setupInstallPrompt();
    setupLightReminders();
  });
})();
