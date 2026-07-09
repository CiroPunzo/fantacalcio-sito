(function () {
  const config = window.PF_CONFIG || {};
  const form = document.getElementById("leagueSignupForm");
  const submitBtn = document.getElementById("submitBtn");
  const formMessage = document.getElementById("formMessage");
  const modal = document.getElementById("successModal");
  const closeModalButtons = document.querySelectorAll("[data-close-modal]");
  const homeLink = document.querySelector("[data-home-link]");
  const transferLink = document.querySelector("[data-transfer-link]");
  const tournamentCards = document.querySelectorAll("[data-tournament-card]");

  const countdownLabel = document.querySelector("[data-countdown-label]");
  const daysEl = document.querySelector("[data-days]");
  const hoursEl = document.querySelector("[data-hours]");
  const minutesEl = document.querySelector("[data-minutes]");
  const secondsEl = document.querySelector("[data-seconds]");

  if (homeLink && config.HOME_URL) homeLink.href = config.HOME_URL;
  if (transferLink && config.TRANSFER_URL) transferLink.href = config.TRANSFER_URL;
  if (countdownLabel && config.COUNTDOWN_LABEL) countdownLabel.textContent = config.COUNTDOWN_LABEL;

  initTournamentCards();
  initModal();
  initCountdown();
  form?.addEventListener("submit", handleSubmit);

  function initTournamentCards() {
    tournamentCards.forEach((card) => {
      card.addEventListener("click", () => selectTournamentCard(card));
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectTournamentCard(card);
        }
      });
      card.setAttribute("tabindex", "0");
    });
  }

  function selectTournamentCard(card) {
    tournamentCards.forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
    const input = card.querySelector("input[type='radio']");
    if (input) input.checked = true;
  }

  function initModal() {
    closeModalButtons.forEach((button) => button.addEventListener("click", closeModal));

    modal?.addEventListener("click", (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function initCountdown() {
    const target = new Date(config.SIGNUP_DEADLINE || "2026-09-02T00:00:00+02:00");

    function tick() {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (Number.isNaN(target.getTime())) {
        setCountdownValues(0, 0, 0, 0);
        return;
      }

      if (diff <= 0) {
        setCountdownValues(0, 0, 0, 0);
        if (countdownLabel) countdownLabel.textContent = "Iscrizioni in chiusura";
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setCountdownValues(days, hours, minutes, seconds);
    }

    tick();
    window.setInterval(tick, 1000);
  }

  function setCountdownValues(days, hours, minutes, seconds) {
    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessage();

    const validationError = getValidationError(form);
    if (validationError) {
      showMessage(validationError, "error");
      return;
    }

    const payload = buildPayload(new FormData(form));

    if (!isSupabaseConfigured(config)) {
      showMessage("Prima di andare online devi inserire URL e anon key Supabase nel file assets/config.js.", "info");
      return;
    }

    setLoading(true);

    try {
      const result = await submitViaSupabaseRpc(payload);

      if (result?.ok === false && result?.code === "duplicate_email") {
        showMessage("Questa email risulta già registrata. Se vuoi modificare i dati, contatta il team ProFantasy.", "info");
        return;
      }

      if (result?.ok === false) {
        console.error("Supabase RPC returned error:", result);
        showMessage("Qualcosa è andato storto durante l'invio. Controlla Supabase e riprova.", "error");
        return;
      }

      form.reset();
      resetTournamentCards();
      openModal();
    } catch (error) {
      console.error("Unexpected signup error:", error);
      showMessage("Connessione a Supabase non riuscita. Controlla URL/anon key, progetto Supabase attivo e prova anche da Chrome.", "error");
    } finally {
      setLoading(false);
    }
  }

  async function submitViaSupabaseRpc(payload) {
    const baseUrl = String(config.SUPABASE_URL || "").replace(/\/+$/, "");
    const endpoint = `${baseUrl}/rest/v1/rpc/pf_create_league_signup`;
    const anonKey = config.SUPABASE_ANON_KEY;

    const response = await fetch(endpoint, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "apikey": anonKey,
        "Authorization": `Bearer ${anonKey}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("Supabase HTTP error:", response.status, data);
      return {
        ok: false,
        code: data?.code || `http_${response.status}`,
        message: data?.message || data?.raw || "Errore HTTP Supabase",
        details: data
      };
    }

    return data || { ok: true };
  }

  function buildPayload(formData) {
    const params = new URLSearchParams(window.location.search);

    return {
      p_first_name: clean(formData.get("first_name")),
      p_last_name: clean(formData.get("last_name")),
      p_email: clean(formData.get("email")).toLowerCase(),
      p_phone: clean(formData.get("phone")) || null,
      p_nickname: clean(formData.get("nickname")) || null,
      p_team_name: clean(formData.get("team_name")) || null,
      p_province: clean(formData.get("province")) || null,
      p_tournament_interest: formData.get("tournament_interest"),
      p_fantasy_level: formData.get("fantasy_level") || null,
      p_age_confirmed: formData.get("age_confirmed") === "on",
      p_privacy_accepted: formData.get("privacy_accepted") === "on",
      p_marketing_accepted: formData.get("marketing_accepted") === "on",
      p_source: params.get("source") || params.get("utm_source") || "direct",
      p_utm_campaign: params.get("utm_campaign") || null,
      p_utm_medium: params.get("utm_medium") || null
    };
  }

  function getValidationError(formElement) {
    const email = formElement.querySelector("input[name='email']");
    const ageConfirmed = formElement.querySelector("input[name='age_confirmed']");
    const privacyAccepted = formElement.querySelector("input[name='privacy_accepted']");

    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      return "Compila i campi obbligatori prima di inviare l'iscrizione.";
    }

    if (email && !email.value.includes("@")) {
      return "Inserisci un indirizzo email valido.";
    }

    if (!ageConfirmed?.checked) {
      return "Per iscriverti devi confermare di avere almeno 18 anni.";
    }

    if (!privacyAccepted?.checked) {
      return "Per inviare il modulo devi accettare il trattamento dei dati.";
    }

    return null;
  }

  function isSupabaseConfigured(settings) {
    return Boolean(
      settings.SUPABASE_URL &&
      settings.SUPABASE_ANON_KEY &&
      !settings.SUPABASE_URL.includes("INSERISCI") &&
      !settings.SUPABASE_ANON_KEY.includes("INSERISCI")
    );
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    const span = submitBtn.querySelector("span");
    if (span) span.textContent = isLoading ? "Invio in corso" : "Invia iscrizione";
  }

  function showMessage(message, type) {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
  }

  function clearMessage() {
    if (!formMessage) return;
    formMessage.textContent = "";
    formMessage.className = "form-message";
  }

  function openModal() {
    modal?.classList.add("open");
    modal?.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
  }

  function resetTournamentCards() {
    tournamentCards.forEach((item) => item.classList.remove("selected"));
    const firstCard = tournamentCards[0];
    const firstInput = firstCard?.querySelector("input[type='radio']");
    firstCard?.classList.add("selected");
    if (firstInput) firstInput.checked = true;
  }
})();
