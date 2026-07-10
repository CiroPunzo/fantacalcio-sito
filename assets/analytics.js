/* =========================================
   ProFantasy GA4 Analytics
   Replace window.PF_GA4_ID in index.html with your Measurement ID, e.g. G-ABC123XYZ
========================================= */

(function () {
  const id = window.PF_GA4_ID;

  const isValidId = typeof id === "string" && /^G-[A-Z0-9]+$/i.test(id) && id !== "G-XXXXXXXXXX";

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  if (!isValidId) {
    window.pfTrack = function (eventName, params = {}) {
      console.info("[PF Analytics preview]", eventName, params);
    };
    console.info("[PF Analytics] GA4 non attivo: inserisci un Measurement ID valido in index.html.");
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
  document.head.appendChild(script);

  gtag("js", new Date());
  gtag("config", id, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });

  window.pfTrack = function (eventName, params = {}) {
    gtag("event", eventName, {
      page_path: window.location.pathname,
      ...params
    });
  };

  function track(eventName, params = {}) {
    window.pfTrack(eventName, params);
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-analytics], a, button");
    if (!target) return;

    const label =
      target.getAttribute("data-analytics") ||
      target.textContent.trim().replace(/\s+/g, " ").slice(0, 80) ||
      target.getAttribute("href") ||
      "unknown";

    const href = target.getAttribute("href") || "";
    track("pf_click", {
      click_label: label,
      click_href: href
    });
  });

  document.addEventListener("change", function (event) {
    if (event.target && event.target.matches("#playerOne, #playerTwo")) {
      track("pf_compare_change", {
        field: event.target.id,
        value: event.target.value
      });
    }
  });

  const boardTabs = document.querySelectorAll("[data-board-tab]");
  boardTabs.forEach((button) => {
    button.addEventListener("click", () => {
      track("pf_board_tab", {
        tab_name: button.dataset.boardTab || button.textContent.trim()
      });
    });
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id || entry.target.className || "section";
      track("pf_section_view", { section_id: String(id).slice(0, 80) });
      sectionObserver.unobserve(entry.target);
    });
  }, { threshold: 0.45 });

  document.querySelectorAll("section[id]").forEach((section) => sectionObserver.observe(section));

  const depths = [25, 50, 75, 90];
  const reached = new Set();

  window.addEventListener("scroll", function () {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - window.innerHeight;
    if (height <= 0) return;

    const percent = Math.round((scrollTop / height) * 100);

    depths.forEach((depth) => {
      if (percent >= depth && !reached.has(depth)) {
        reached.add(depth);
        track("pf_scroll_depth", { depth });
      }
    });
  }, { passive: true });
})();
