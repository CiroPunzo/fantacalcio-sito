(function () {
  const config = window.PF_CONFIG || {};
  const measurementId = String(config.GA4_MEASUREMENT_ID || "").trim();
  const debugMode = Boolean(config.GA4_DEBUG_MODE);
  const enabled = Boolean(
    config.GA4_ENABLED !== false &&
    /^G-[A-Z0-9]+$/i.test(measurementId) &&
    !measurementId.includes("INSERISCI")
  );

  const state = {
    formTouched: false,
    signupSuccess: false,
    scrollDepthsSent: new Set(),
    formStartSent: false,
    loadedAt: Date.now()
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  function log(...args) {
    if (debugMode) console.log("[PF Analytics]", ...args);
  }

  function loadGtag() {
    if (!enabled) {
      log("GA4 disattivato o measurement ID non configurato.");
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.gtag("js", new Date());

    // Impostazione conservativa: niente advertising signals.
    window.gtag("config", measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      send_page_view: true,
      debug_mode: debugMode,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });

    log("GA4 caricato", measurementId);
  }

  function track(eventName, params) {
    const safeParams = sanitizeParams(params || {});

    if (!enabled) {
      log("Evento non inviato perché GA4 non è attivo", eventName, safeParams);
      return;
    }

    window.gtag("event", eventName, {
      page_path: window.location.pathname,
      page_title: document.title,
      page_location: window.location.href,
      ...safeParams
    });

    log("Evento inviato", eventName, safeParams);
  }

  function sanitizeParams(params) {
    const blockedKeys = new Set([
      "email",
      "mail",
      "phone",
      "telefono",
      "whatsapp",
      "first_name",
      "last_name",
      "name",
      "nome",
      "cognome"
    ]);

    return Object.fromEntries(
      Object.entries(params)
        .filter(([key]) => !blockedKeys.has(String(key).toLowerCase()))
        .map(([key, value]) => {
          if (typeof value === "string") return [key, value.slice(0, 100)];
          return [key, value];
        })
    );
  }

  function getSelectedTournament() {
    const selected = document.querySelector("input[name='tournament_interest']:checked");
    return selected ? selected.value : "unknown";
  }

  function getFilledFieldsCount() {
    const form = document.getElementById("leagueSignupForm");
    if (!form) return 0;

    const fields = Array.from(form.querySelectorAll("input, select, textarea"));
    return fields.filter((field) => {
      if (field.type === "checkbox" || field.type === "radio") return field.checked;
      return String(field.value || "").trim().length > 0;
    }).length;
  }

  function initFormTracking() {
    const form = document.getElementById("leagueSignupForm");
    if (!form) return;

    form.addEventListener("focusin", () => markFormStart(), { once: true });
    form.addEventListener("input", () => markFormTouched());
    form.addEventListener("change", () => markFormTouched());
  }

  function markFormTouched() {
    state.formTouched = true;
  }

  function markFormStart() {
    if (state.formStartSent) return;
    state.formTouched = true;
    state.formStartSent = true;
    track("pf_signup_form_start", {
      tournament_interest: getSelectedTournament()
    });
  }

  function initScrollTracking() {
    const thresholds = [25, 50, 75, 90];

    function onScroll() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const percent = Math.round((scrollTop / maxScroll) * 100);

      thresholds.forEach((threshold) => {
        if (percent >= threshold && !state.scrollDepthsSent.has(threshold)) {
          state.scrollDepthsSent.add(threshold);
          track("pf_scroll_depth", { percent: threshold });
        }
      });
    }

    window.addEventListener("scroll", throttle(onScroll, 400), { passive: true });
    onScroll();
  }

  function initClickTracking() {
    document.addEventListener("click", (event) => {
      const target = event.target.closest("a, button, [data-tournament-card]");
      if (!target) return;

      if (target.matches("[data-tournament-card]")) return;

      const text = cleanText(target.textContent);
      const href = target.getAttribute("href") || "";
      const area = target.closest(".modal-actions") ? "success_modal" :
        target.closest(".topbar") ? "topbar" :
        target.closest(".signup-card") ? "signup_card" : "page";

      track("pf_cta_click", {
        cta_text: text,
        cta_href: href,
        cta_area: area
      });
    });
  }

  function initAbandonTracking() {
    function sendAbandon() {
      if (!state.formTouched || state.signupSuccess) return;

      track("pf_signup_abandon", {
        tournament_interest: getSelectedTournament(),
        filled_fields_count: getFilledFieldsCount(),
        time_on_page_seconds: Math.round((Date.now() - state.loadedAt) / 1000),
        transport_type: "beacon"
      });
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendAbandon();
    });

    window.addEventListener("pagehide", sendAbandon);
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80);
  }

  function throttle(fn, delay) {
    let last = 0;
    let timeout = null;

    return function throttled(...args) {
      const now = Date.now();
      const remaining = delay - (now - last);

      if (remaining <= 0) {
        if (timeout) window.clearTimeout(timeout);
        timeout = null;
        last = now;
        fn.apply(this, args);
        return;
      }

      if (!timeout) {
        timeout = window.setTimeout(() => {
          last = Date.now();
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  window.PFAnalytics = {
    enabled,
    track,
    markSignupSuccess() {
      state.signupSuccess = true;
    },
    markFormTouched
  };

  document.addEventListener("DOMContentLoaded", () => {
    loadGtag();
    initFormTracking();
    initScrollTracking();
    initClickTracking();
    initAbandonTracking();
  });
})();
