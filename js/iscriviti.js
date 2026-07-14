(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Countdown to the start of the League
  const countdown = qs('[data-countdown]');
  if (countdown) {
    const target = new Date('2026-09-02T00:00:00+02:00').getTime();
    const fields = {
      days: qs('[data-days]', countdown),
      hours: qs('[data-hours]', countdown),
      minutes: qs('[data-minutes]', countdown),
      seconds: qs('[data-seconds]', countdown)
    };
    const updateCountdown = () => {
      const remaining = Math.max(0, target - Date.now());
      const values = {
        days: Math.floor(remaining / 86400000),
        hours: Math.floor((remaining % 86400000) / 3600000),
        minutes: Math.floor((remaining % 3600000) / 60000),
        seconds: Math.floor((remaining % 60000) / 1000)
      };
      Object.entries(fields).forEach(([key, node]) => {
        if (node) node.textContent = String(values[key]).padStart(2, '0');
      });
    };
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
  }

  const prizeTabs = qsa('[data-signup-prize-tab]');
  const prizePanels = qsa('[data-signup-prize-panel]');
  const tournamentRadios = qsa('input[name="tournament_interest"]');
  const tournamentCards = qsa('[data-tournament-card]');

  const setPrizeMode = (mode, options = {}) => {
    prizeTabs.forEach((button) => {
      const active = button.dataset.signupPrizeTab === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    prizePanels.forEach((panel) => {
      const active = panel.dataset.signupPrizePanel === mode;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    tournamentCards.forEach((card) => {
      const radio = qs('input[type="radio"]', card);
      card.classList.toggle('selected', radio?.value === mode);
    });
    if (options.syncRadio !== false) {
      const radio = tournamentRadios.find((item) => item.value === mode);
      if (radio) radio.checked = true;
    }
  };

  prizeTabs.forEach((button) => {
    button.addEventListener('click', () => setPrizeMode(button.dataset.signupPrizeTab));
  });
  tournamentRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) setPrizeMode(radio.value, { syncRadio: false });
    });
  });
  tournamentCards.forEach((card) => {
    card.addEventListener('click', () => {
      const radio = qs('input[type="radio"]', card);
      if (radio) setPrizeMode(radio.value);
    });
  });
  setPrizeMode(qs('input[name="tournament_interest"]:checked')?.value || 'open', { syncRadio: false });

  // Prize image lightbox
  const lightbox = qs('[data-signup-lightbox]');
  const lightboxImage = qs('[data-signup-lightbox-image]');
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lightboxImage) lightboxImage.src = '';
  };
  qsa('[data-preview-image]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.previewImage || '';
      lightboxImage.alt = button.dataset.previewAlt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    });
  });
  qs('[data-signup-lightbox-close]')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });

  // Success modal
  const modal = qs('#successModal');
  const openModal = () => {
    if (!modal) return;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  };
  qs('[data-close-modal]')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
      closeModal();
    }
  });

  // Registration form
  const form = qs('#leagueSignupForm');
  const submitButton = qs('#submitBtn');
  const formMessage = qs('#formMessage');

  const setMessage = (message = '', type = '') => {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = 'form-message';
    if (message) formMessage.classList.add('is-visible', type === 'success' ? 'is-success' : 'is-error');
  };

  const normalizePhone = (value) => value.trim().replace(/\s+/g, ' ');
  const formValue = (data, name) => String(data.get(name) || '').trim();

  const validateForm = () => {
    if (!form) return false;
    let valid = true;
    qsa('input, select', form).forEach((field) => field.classList.remove('is-invalid'));
    const requiredFields = qsa('[required]', form);
    requiredFields.forEach((field) => {
      const invalid = field.type === 'checkbox' ? !field.checked : !String(field.value || '').trim();
      if (invalid) {
        field.classList.add('is-invalid');
        valid = false;
      }
    });
    const email = qs('input[name="email"]', form);
    if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
      email.classList.add('is-invalid');
      valid = false;
    }
    return valid;
  };

  const submitRegistration = async (payload) => {
    const client = await (window.PFA_SUPABASE_READY || Promise.resolve(window.PFA_SUPABASE));
    if (!client) throw new Error('Connessione al database non disponibile. Ricarica la pagina e riprova.');
    const { error } = await client.from('league_signups').insert(payload);
    if (error) throw error;
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage();

    if (!validateForm()) {
      setMessage('Controlla i campi obbligatori e conferma età e privacy.', 'error');
      qs('.is-invalid', form)?.focus();
      return;
    }

    const data = new FormData(form);
    const teamName = formValue(data, 'team_name');
    const payload = {
      first_name: formValue(data, 'first_name'),
      last_name: formValue(data, 'last_name'),
      nickname: formValue(data, 'nickname') || null,
      email: formValue(data, 'email').toLowerCase(),
      phone: normalizePhone(formValue(data, 'phone')) || null,
      province: formValue(data, 'province') || null,
      tournament_interest: formValue(data, 'tournament_interest'),
      fantasy_level: formValue(data, 'fantasy_level') || null,
      age_confirmed: Boolean(data.get('age_confirmed')),
      privacy_accepted: Boolean(data.get('privacy_accepted')),
      marketing_accepted: Boolean(data.get('marketing_accepted')),
      source: 'website_iscriviti_2026_27',
      status: 'new',
      notes: teamName ? `Nome squadra: ${teamName}` : null
    };

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.querySelector('span').textContent = 'Invio in corso…';
      }
      await submitRegistration(payload);
      form.reset();
      setPrizeMode('open');
      setMessage('Iscrizione inviata correttamente.', 'success');
      openModal();
      window.gtag?.('event', 'league_signup_success', { tournament_interest: payload.tournament_interest });
    } catch (error) {
      console.error('ProFantasy League signup error:', error);
      const duplicate = error?.code === '23505' || /duplicate|unique/i.test(error?.message || '');
      const message = duplicate
        ? 'Questa email risulta già registrata per il torneo selezionato.'
        : 'Non è stato possibile inviare la candidatura. Riprova tra qualche secondo.';
      setMessage(message, 'error');
      window.gtag?.('event', 'league_signup_error', { error_code: error?.code || 'unknown' });
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.querySelector('span').textContent = 'Invia iscrizione';
      }
    }
  });
})();
