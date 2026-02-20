// =====================
// HERO SLIDER
// =====================
let currentHeroSlide = 0;
let autoRotateInterval = null;

function initHeroSlider() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  if (!slides.length || !dots.length) return;

  slides.forEach(s => s.classList.remove("active"));
  dots.forEach(d => d.classList.remove("active"));

  slides[0].classList.add("active");
  dots[0].classList.add("active");

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => goToHeroSlide(index));
  });

  if (autoRotateInterval) clearInterval(autoRotateInterval);
  autoRotateInterval = setInterval(nextHeroSlide, 5000);

  const heroSlider = document.querySelector(".hero-slider");
  if (heroSlider) {
    let touchStartX = 0;
    let touchEndX = 0;

    heroSlider.addEventListener(
      "touchstart",
      (e) => { touchStartX = e.changedTouches[0].clientX; },
      { passive: true }
    );

    heroSlider.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        const threshold = 50;
        if (Math.abs(diff) < threshold) return;

        clearInterval(autoRotateInterval);
        if (diff < 0) nextHeroSlide();
        else prevHeroSlide();
        autoRotateInterval = setInterval(nextHeroSlide, 5000);
      },
      { passive: true }
    );
  }
}

function showHeroSlide(index) {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const total = slides.length;
  if (!total) return;

  if (index >= total) index = 0;
  if (index < 0) index = total - 1;
  currentHeroSlide = index;

  slides.forEach(s => s.classList.remove("active"));
  slides[index].classList.add("active");

  dots.forEach(d => d.classList.remove("active"));
  if (dots[index]) dots[index].classList.add("active");
}

function nextHeroSlide() {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;
  showHeroSlide(currentHeroSlide + 1);
}

function prevHeroSlide() {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;
  showHeroSlide(currentHeroSlide - 1);
}

function goToHeroSlide(index) {
  if (autoRotateInterval) clearInterval(autoRotateInterval);
  showHeroSlide(index);
  autoRotateInterval = setInterval(nextHeroSlide, 5000);
}

// =====================
// NEWS MODAL
// =====================
function openNewsModal(data) {
  const modal = document.getElementById("news-modal");
  if (!modal) return;

  const titleEl = document.getElementById("modal-title");
  const subtitleEl = document.getElementById("modal-subtitle");
  const imageEl = document.getElementById("modal-image");
  const contentEl = document.getElementById("modal-content");

  if (titleEl) titleEl.textContent = data?.title || "";
  if (subtitleEl) subtitleEl.textContent = data?.subtitle || "";
  if (imageEl) imageEl.src = data?.image || "";
  if (contentEl) contentEl.textContent = data?.content || "";

  modal.classList.add("active");
}

function closeNewsModal() {
  const modal = document.getElementById("news-modal");
  if (modal) modal.classList.remove("active");
}

// =====================
// GOOGLE SHEETS CONFIG
// =====================
const SHEET_ID = "1ujW6Mth_rdRfsXQCI16cnW5oIg9djjVZnpffPhi7f48";

/**
 * ATTENZIONE:
 * - Chiavi UNICHE (niente duplicati)
 * - Valori = NOMI FOGLI (non range stile "Classifica!A2:E")
 *   perché usiamo gviz sheet=...
 */
const SHEET_NAMES = {
  classifica: "Classifica",
  classificaMarcatori: "ClassificaMarcatori",
  classificaAssist: "ClassificaAssist",
  infortunati: "Infortunati",
  analisiFantacalcio: "AnalisiFantacalcio",
  pronostici: "Pronostici",
  risultatiGiornata: "RisultatiGiornata",
  playerPicks: "PlayerPicks",
  config: "Config",
  rosaSerieA: "RosaSerieA",
};

async function fetchSheetDataJson(sheetName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    const text = await response.text();

    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Impossibile trovare JSON nella risposta di Google Sheets");
      console.log("Response text:", text);
      return [];
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const json = JSON.parse(jsonString);

    const cols = json.table.cols.map(col => col.label);
    const rows = json.table.rows.map(row => {
      const obj = {};
      cols.forEach((col, idx) => {
        obj[col] = row.c[idx]?.v ?? "";
      });
      return obj;
    });

    rows.cols = cols;
    return rows;
  } catch (error) {
    console.error("Errore fetchSheetDataJson:", error);
    return [];
  }
}

// =====================
// LOGHI CLUB (tuoi)
// =====================
const CLUB_LOGOS = {
  Milan: "img/loghi/milan.png",
  Napoli: "img/loghi/napoli.png",
  Inter: "img/loghi/inter.png",
  Roma: "img/loghi/roma.png",
  Bologna: "img/loghi/bologna.png",
  Como: "img/loghi/como.png",
  Juventus: "img/loghi/juventus.png",
  Sassuolo: "img/loghi/sassuolo.png",
  Cremonese: "img/loghi/cremonese.png",
  Lazio: "img/loghi/lazio.png",
  Udinese: "img/loghi/udinese.png",
  Cagliari: "img/loghi/cagliari.png",
  Parma: "img/loghi/parma.png",
  Genoa: "img/loghi/genoa.png",
  Verona: "img/loghi/verona.png",
  Fiorentina: "img/loghi/fiorentina.png",
  Pisa: "img/loghi/pisa.png",
  Atalanta: "img/loghi/atalanta.png",
  Lecce: "img/loghi/lecce.png",
  Torino: "img/loghi/torino.png",
};

// =====================
// HOME: CLASSIFICA / MARCATORI / INFORTUNATI (preview)
// =====================
async function populateClassifica() {
  const data = await fetchSheetDataJson(SHEET_NAMES.classifica);
  const tbody = document.getElementById("classifica-body");
  if (!tbody) return;
  if (!Array.isArray(data) || !data.length) return;

  tbody.innerHTML = "";

  data
    .sort((a, b) => Number(a["Posizione"]) - Number(b["Posizione"]))
    .slice(0, 10)
    .forEach(row => {
      const tr = document.createElement("tr");

      const pos = Number(row["Posizione"]);
      const squadra = row["Squadra"] || "-";

      let zonaHTML = "";
      if (pos >= 1 && pos <= 4) {
        zonaHTML = `<div class="zona-badge zona-champions" title="Champions League"><img src="img/icon-cl-champions.png" alt="Champions League"></div>`;
      } else if (pos >= 5 && pos <= 6) {
        zonaHTML = `<div class="zona-badge zona-europa" title="Europa League"><img src="img/icon-el-europa.png" alt="Europa League"></div>`;
      } else if (pos === 7) {
        zonaHTML = `<div class="zona-badge zona-conference" title="Conference League"><img src="img/icon-conf-conference.png" alt="Conference League"></div>`;
      } else if (pos >= 18) {
        zonaHTML = `<div class="zona-badge zona-relegation" title="Retrocessione"><span>↓</span></div>`;
      }

      const logoUrl = CLUB_LOGOS[squadra];
      const teamHTML = logoUrl
        ? `<div class="table-team"><img src="${logoUrl}" alt="${squadra}" class="table-logo"><span><strong>${squadra}</strong></span></div>`
        : `<strong>${squadra}</strong>`;

      tr.innerHTML = `
        <td>${row["Posizione"] || "-"}</td>
        <td>${zonaHTML}</td>
        <td>${teamHTML}</td>
        <td>${row["PG"] || "-"}</td>
        <td>${row["xG"] || "-"}</td>
        <td>${row["Punti"] || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
}

async function populateMarcatori() {
  const data = await fetchSheetDataJson(SHEET_NAMES.classificaMarcatori);
  const tbody = document.getElementById("marcatori-body");
  if (!tbody) return;
  if (!Array.isArray(data) || !data.length) return;

  tbody.innerHTML = "";

  data
    .filter(r => r["Posizione"])
    .sort((a, b) => Number(a["Posizione"]) - Number(b["Posizione"]))
    .slice(0, 10)
    .forEach(row => {
      const tr = document.createElement("tr");

      const giocatore = row["Nome Giocatore"] || row["Giocatore"] || "-";
      const club = row["Squadra"] || row["Club"] || "-";
      const gol = row["Gol"] || "-";

      const logoUrl = CLUB_LOGOS[club];
      const clubHTML = logoUrl
        ? `<div class="table-team"><img src="${logoUrl}" alt="${club}" class="table-logo"><span>${club}</span></div>`
        : club;

      tr.innerHTML = `
        <td>${row["Posizione"] || "-"}</td>
        <td><strong>${giocatore}</strong></td>
        <td>${clubHTML}</td>
        <td>${gol}</td>
      `;
      tbody.appendChild(tr);
    });
}

async function populateInfortunati() {
  const data = await fetchSheetDataJson(SHEET_NAMES.infortunati);
  const tbody = document.getElementById("infortunati-body");
  if (!tbody) return;
  if (!Array.isArray(data) || !data.length) return;

  const rows = data.filter(r => (r["Giocatore"] || "").trim() && (r["Giocatore"] || "").trim().toLowerCase() !== "giocatore");
  tbody.innerHTML = "";

  rows.slice(0, 10).forEach(row => {
    const tr = document.createElement("tr");
    tr.className = "clickable";

    const giocatore = row["Giocatore"] || "-";
    const club = row["Club"] || "-";
    const rientro = row["Rientro Previsto"] || "-";
    const tipo = row["Tipo Infortunio"] || "-";

    const logoUrl = CLUB_LOGOS[club];
    const clubHTML = logoUrl
      ? `<div class="table-team"><img src="${logoUrl}" alt="${club}" class="table-logo"><span>${club}</span></div>`
      : club;

    tr.innerHTML = `
      <td><strong>${giocatore}</strong></td>
      <td>${clubHTML}</td>
      <td>${rientro}</td>
      <td>${tipo}</td>
    `;

    tr.addEventListener("click", () => openInfortunioModal(row));
    tbody.appendChild(tr);
  });
}

function openInfortunioModal(row) {
  const modal = document.getElementById("infortunio-modal");
  if (!modal) return;

  const giocatore = row["Giocatore"] || "-";
  const club = row["Club"] || "-";

  const giEl = document.getElementById("modal-giocatore");
  const clubEl = document.getElementById("modal-club");
  const stEl = document.getElementById("modal-status");
  const tiEl = document.getElementById("modal-infortunio");
  const riEl = document.getElementById("modal-ritorno");

  if (giEl) giEl.textContent = giocatore;
  if (clubEl) clubEl.textContent = club;
  if (stEl) stEl.textContent = row["Status"] || "-";
  if (tiEl) tiEl.textContent = row["Tipo Infortunio"] || "-";
  if (riEl) riEl.textContent = row["Rientro Previsto"] || "-";

  modal.classList.add("active");
}

// =====================
// PREVISIONI (analisi + pronostici)
// =====================
async function populateAnalisiFantacalcio(selectedGiornata = null) {
  const data = await fetchSheetDataJson(SHEET_NAMES.analisiFantacalcio);
  const tbody = document.getElementById("pred-fanta-body");
  const select = document.getElementById("select-giornata-fanta");
  if (!tbody || !Array.isArray(data) || !data.length) return;

  const giornate = Array.from(new Set(data.map(r => r["Giornata"]).filter(Boolean)))
    .sort((a, b) => Number(a) - Number(b));

  if (select && select.options.length === 0) {
    giornate.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = `Giornata ${g}`;
      select.appendChild(opt);
    });
    select.onchange = () => populateAnalisiFantacalcio(select.value);
  }

  const giornataCorrente = selectedGiornata || (giornate.length ? giornate[giornate.length - 1] : null);
  if (!giornataCorrente) return;
  if (select) select.value = String(giornataCorrente);

  const filtrati = data.filter(r => String(r["Giornata"]) === String(giornataCorrente));
  tbody.innerHTML = "";

  filtrati.forEach(row => {
    const tr = document.createElement("tr");
    tr.classList.add("clickable");

    const casa = row["SquadraCasa"] || row["Squadra Casa"] || "-";
    const trasferta = row["SquadraTrasferta"] || row["Squadra Trasferta"] || "-";
    const orario = row["Orario"] || "-";
    const consigliati = row["Consigliati"] || "-";
    const daEvitare = row["Da Evitare"] || row["DaEvitare"] || "-";

    const logoCasa = CLUB_LOGOS[casa];
    const logoTrasferta = CLUB_LOGOS[trasferta];

    tr.innerHTML = `
      <td>
        <div class="pred-match-cell">
          <div class="pred-match-cell-logos">
            ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ""}
            ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ""}
          </div>
          <div class="pred-match-cell-names">
            <span><strong>${casa}</strong> vs <strong>${trasferta}</strong></span>
          </div>
        </div>
      </td>
      <td>${orario}</td>
      <td>${consigliati}</td>
      <td>${daEvitare}</td>
    `;

    tr.addEventListener("click", () => openFantaMatchModal(row));
    tbody.appendChild(tr);
  });
}

function openFantaMatchModal(row) {
  const modal = document.getElementById("pred-fanta-modal");
  const body = document.getElementById("pred-fanta-modal-body");
  if (!modal || !body) return;

  const casa = row["SquadraCasa"] || "-";
  const trasferta = row["SquadraTrasferta"] || "-";
  const previsione = row["PrevisioneRisultato"] || row["Previsione Risultato"] || "-";
  const analisi = row["AnalisiTattica"] || row["Analisi Tattica"] || "-";

  const consCasa = row["ConsigliatiCasa"] || row["Consigliati"] || "-";
  const consTrasf = row["ConsigliatiTrasferta"] || "-";
  const evitaCasa = row["EvitaCasa"] || row["Da Evitare"] || "-";
  const evitaTrasf = row["EvitaTrasferta"] || "-";

  const logoCasa = CLUB_LOGOS[casa];
  const logoTrasferta = CLUB_LOGOS[trasferta];

  body.innerHTML = `
    <div class="pred-modal-header">
      <div class="pred-modal-logos">
        ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ""}
        ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ""}
      </div>
      <div class="pred-modal-title-block">
        <h2>${casa} vs ${trasferta}</h2>
        <p class="pred-modal-subtitle">Previsione risultato: <strong>${previsione}</strong></p>
      </div>
    </div>

    <div class="pred-modal-section">
      <h3>Analisi tattica</h3>
      <p>${analisi}</p>
    </div>

    <div class="pred-modal-grid">
      <div class="pred-modal-col">
        <h4>${casa} — Consigliati</h4>
        <p>${consCasa}</p>
        <h4>${casa} — Da evitare</h4>
        <p>${evitaCasa}</p>
      </div>
      <div class="pred-modal-col">
        <h4>${trasferta} — Consigliati</h4>
        <p>${consTrasf}</p>
        <h4>${trasferta} — Da evitare</h4>
        <p>${evitaTrasf}</p>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

async function populatePronostici(selectedGiornata = null) {
  const data = await fetchSheetDataJson(SHEET_NAMES.pronostici);
  const tbody = document.getElementById("pred-prono-body");
  const select = document.getElementById("select-giornata-prono");
  if (!tbody || !Array.isArray(data) || !data.length) return;

  const giornate = Array.from(new Set(data.map(r => r["Giornata"]).filter(Boolean)))
    .sort((a, b) => Number(a) - Number(b));

  if (select && select.options.length === 0) {
    giornate.forEach(g => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = `Giornata ${g}`;
      select.appendChild(opt);
    });
    select.onchange = () => populatePronostici(select.value);
  }

  const giornataCorrente = selectedGiornata || (giornate.length ? giornate[giornate.length - 1] : null);
  if (!giornataCorrente) return;
  if (select) select.value = String(giornataCorrente);

  const filtrati = data.filter(r => String(r["Giornata"]) === String(giornataCorrente));
  tbody.innerHTML = "";

  filtrati.forEach(row => {
    const tr = document.createElement("tr");
    tr.classList.add("clickable");

    const casa = row["SquadraCasa"] || "-";
    const trasferta = row["SquadraTrasferta"] || "-";
    const orario = row["Orario"] || "-";
    const esito = row["EsitoPrincipale"] || row["Esito Principale"] || "-";
    const conf = row["Confidenza"] || "0";

    const logoCasa = CLUB_LOGOS[casa];
    const logoTrasferta = CLUB_LOGOS[trasferta];

    tr.innerHTML = `
      <td>
        <div class="pred-match-cell">
          <div class="pred-match-cell-logos">
            ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ""}
            ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ""}
          </div>
          <div class="pred-match-cell-names">
            <span><strong>${casa}</strong> vs <strong>${trasferta}</strong></span>
          </div>
        </div>
      </td>
      <td>${orario}</td>
      <td>${esito}</td>
      <td>${conf}</td>
    `;

    tr.addEventListener("click", () => openPronoMatchModal(row));
    tbody.appendChild(tr);
  });
}

function openPronoMatchModal(row) {
  const modal = document.getElementById("pred-prono-modal");
  const body = document.getElementById("pred-prono-modal-body");
  if (!modal || !body) return;

  const casa = row["SquadraCasa"] || "-";
  const trasferta = row["SquadraTrasferta"] || "-";
  const giornata = row["Giornata"] || "-";
  const orario = row["Orario"] || "-";
  const esito = row["EsitoPrincipale"] || row["Esito Principale"] || "-";
  const alt1 = row["EsitoSecondario1"] || row["Esito Secondario 1"] || "";
  const alt2 = row["EsitoSecondario2"] || row["Esito Secondario 2"] || "";
  const motivazione = row["Motivazione"] || "-";

  const conf = Number(row["Confidenza"] || 0);
  const maxStars = 5;
  const confNum = Math.max(0, Math.min(conf, maxStars));
  const stars = "★".repeat(confNum) + "☆".repeat(maxStars - confNum);

  const logoCasa = CLUB_LOGOS[casa];
  const logoTrasferta = CLUB_LOGOS[trasferta];

  body.innerHTML = `
    <div class="pred-modal-header">
      <div class="pred-modal-logos">
        ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ""}
        ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ""}
      </div>
      <div class="pred-modal-title-block">
        <h2>${casa} vs ${trasferta}</h2>
        <p class="pred-modal-subtitle">Giornata ${giornata} · ${orario}</p>
      </div>
    </div>

    <div class="pred-modal-section pred-prono-main">
      <div class="pred-prono-main-esito">
        <span class="pred-prono-label">Esito principale</span>
        <p class="pred-prono-esito">${esito}</p>
      </div>
      <div class="pred-prono-main-conf">
        <span class="pred-prono-label">Confidenza</span>
        <p class="pred-prono-stars">${stars} <span class="pred-prono-conf-num">${confNum}/5</span></p>
      </div>
    </div>

    ${(alt1 || alt2) ? `
      <div class="pred-modal-section">
        <h3>Altri esiti considerati</h3>
        <ul class="pred-prono-alt-list">
          ${alt1 ? `<li>${alt1}</li>` : ""}
          ${alt2 ? `<li>${alt2}</li>` : ""}
        </ul>
      </div>
    ` : ""}

    <div class="pred-modal-section">
      <h3>Motivazione</h3>
      <p>${motivazione}</p>
    </div>
  `;

  modal.classList.add("active");
}

// =====================
// UI: Tabs dashboard (vecchie) + navbar mobile
// =====================
function setupDashboardTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");
  if (!tabs.length || !contents.length) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      const tabName = e.currentTarget.dataset.tab;

      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      e.currentTarget.classList.add("active");
      const tabContent = document.getElementById(tabName);
      if (tabContent) tabContent.classList.add("active");
    });
  });
}

function setupMobileNavbar() {
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  if (!navToggle || !navLinks) return;

  navToggle.style.pointerEvents = "auto";

  const toggleMenu = (e) => {
    if (e) e.preventDefault();
    const isOpen = navLinks.classList.toggle("nav-open");
    navToggle.classList.toggle("nav-open", isOpen);
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  };

  navToggle.addEventListener("click", toggleMenu);
  navToggle.addEventListener("touchend", (e) => { e.preventDefault(); toggleMenu(e); });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("nav-open");
      navToggle.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// =====================
// MODAL CLOSE HANDLER (globale)
// =====================
function setupGlobalModalClose() {
  document.addEventListener("click", (e) => {
    const ids = [
      "news-modal",
      "infortunio-modal",
      "classifica-modal",
      "marcatori-modal",
      "infortunati-modal",
      "pred-fanta-modal",
      "pred-prono-modal",
      "join-modal",
    ];

    ids.forEach(id => {
      const m = document.getElementById(id);
      if (m && e.target === m) m.classList.remove("active");
    });

    if (e.target && e.target.classList && e.target.classList.contains("modal-close")) {
      const parentModal = e.target.closest(".modal");
      if (parentModal) parentModal.classList.remove("active");
    }
  });
}

// =====================
// FULL TABLE MODALS (classifica + marcatori)
// =====================
async function populateClassificaFull() {
  const data = await fetchSheetDataJson(SHEET_NAMES.classifica);
  const tbody = document.getElementById("classifica-full-body");
  if (!tbody || !Array.isArray(data) || !data.length) return;

  tbody.innerHTML = "";
  data
    .sort((a, b) => Number(a["Posizione"]) - Number(b["Posizione"]))
    .forEach(row => {
      const tr = document.createElement("tr");
      const pos = Number(row["Posizione"]);
      const squadra = row["Squadra"] || "-";

      let zonaHTML = "";
      if (pos >= 1 && pos <= 4) {
        zonaHTML = `<div class="zona-badge zona-champions" title="Champions League"><img src="img/icon-cl-champions.png" alt="Champions League"></div>`;
      } else if (pos >= 5 && pos <= 6) {
        zonaHTML = `<div class="zona-badge zona-europa" title="Europa League"><img src="img/icon-el-europa.png" alt="Europa League"></div>`;
      } else if (pos === 7) {
        zonaHTML = `<div class="zona-badge zona-conference" title="Conference League"><img src="img/icon-conf-conference.png" alt="Conference League"></div>`;
      } else if (pos >= 18) {
        zonaHTML = `<div class="zona-badge zona-relegation" title="Retrocessione"><span>↓</span></div>`;
      }

      const logoUrl = CLUB_LOGOS[squadra];
      const teamHTML = logoUrl
        ? `<div class="table-team"><img src="${logoUrl}" alt="${squadra}" class="table-logo"><span><strong>${squadra}</strong></span></div>`
        : `<strong>${squadra}</strong>`;

      tr.innerHTML = `
        <td>${row["Posizione"] || "-"}</td>
        <td>${zonaHTML}</td>
        <td>${teamHTML}</td>
        <td>${row["PG"] || "-"}</td>
        <td>${row["xG"] || "-"}</td>
        <td>${row["Punti"] || "-"}</td>
      `;
      tbody.appendChild(tr);
    });
}

async function populateMarcatoriFull() {
  const data = await fetchSheetDataJson(SHEET_NAMES.classificaMarcatori);
  const tbody = document.getElementById("marcatori-full-body");
  if (!tbody || !Array.isArray(data) || !data.length) return;

  tbody.innerHTML = "";
  data
    .filter(r => r["Posizione"])
    .sort((a, b) => Number(a["Posizione"]) - Number(b["Posizione"]))
    .forEach(row => {
      const tr = document.createElement("tr");
      const giocatore = row["Nome Giocatore"] || row["Giocatore"] || "-";
      const club = row["Squadra"] || row["Club"] || "-";
      const gol = row["Gol"] || "-";

      const logoUrl = CLUB_LOGOS[club];
      const clubHTML = logoUrl
        ? `<div class="table-team"><img src="${logoUrl}" alt="${club}" class="table-logo"><span>${club}</span></div>`
        : club;

      tr.innerHTML = `
        <td>${row["Posizione"] || "-"}</td>
        <td><strong>${giocatore}</strong></td>
        <td>${clubHTML}</td>
        <td>${gol}</td>
      `;
      tbody.appendChild(tr);
    });
}

function setupFullTablesModals() {
  const btnClassifica = document.getElementById("open-full-classifica");
  const btnMarcatori = document.getElementById("open-full-marcatori");

  if (btnClassifica) {
    btnClassifica.addEventListener("click", async (e) => {
      if (e) e.preventDefault();
      document.getElementById("classifica-modal")?.classList.add("active");
      await populateClassificaFull();
    });
  }

  if (btnMarcatori) {
    btnMarcatori.addEventListener("click", async (e) => {
      if (e) e.preventDefault();
      document.getElementById("marcatori-modal")?.classList.add("active");
      await populateMarcatoriFull();
    });
  }

  const btnClassificaM = document.getElementById("open-full-classifica-mobile");
  const btnMarcatoriM = document.getElementById("open-full-marcatori-mobile");

  if (btnClassificaM && btnClassifica) {
    btnClassificaM.addEventListener("click", (e) => { e.preventDefault(); btnClassifica.click(); });
  }
  if (btnMarcatoriM && btnMarcatori) {
    btnMarcatoriM.addEventListener("click", (e) => { e.preventDefault(); btnMarcatori.click(); });
  }
}

// =====================
// NEON HOME: Results + Compare + Assist — CLEAN
// =====================
function neonHomeInit() {
  const isHome =
    /(^|\/)index\.html$/.test(location.pathname) ||
    location.pathname === "/" ||
    location.pathname === "";

  if (!isHome) return;

  const $ = (id) => document.getElementById(id);

  const els = {
    btnCur: $("btn-matchday-current"),
    btnPrev: $("btn-matchday-prev"),
    status: $("matchday-status-text"),
    track: $("results-carousel-track"),
    prevArrow: $("results-prev"),
    nextArrow: $("results-next"),

    aSel: $("player-a-select"),
    bSel: $("player-b-select"),
    btnCompare: $("btn-compare"),
    kpis: $("compare-kpis"),
    radar: $("player-radar"),
  };

  if (!els.track || !els.aSel || !els.bSel || !els.radar) return;

  let currentMatchday = null;
  let selectedMatchday = null;
  let radarChart = null;

  function setMatchdayButtons() {
    if (!els.btnCur || !els.btnPrev) return;
    const isCur = selectedMatchday === currentMatchday;
    els.btnCur.classList.toggle("neo-pill-active", isCur);
    els.btnPrev.classList.toggle("neo-pill-active", !isCur);
  }

  function pickPreviousMatchday() {
    if (Number.isFinite(currentMatchday)) return Math.max(1, currentMatchday - 1);
    return null;
  }

  async function loadConfigMatchday() {
    try {
      const rows = await fetchSheetDataJson(SHEET_NAMES.config);

      const map = {};
      rows.forEach((r) => {
        const k = String(r.key || r.Key || r.KEY || "").trim();
        const v = r.value ?? r.Value ?? r.VALUE;
        if (k) map[k] = v;
      });

      const cm = parseInt(map.current_matchday, 10);
      if (!Number.isFinite(cm)) throw new Error("Config: current_matchday non valido");

      currentMatchday = cm;
      selectedMatchday = cm;

      const status = String(map.matchday_status || "").trim();
      els.status.textContent = status ? `Giornata ${cm} • ${status}` : `Giornata ${cm}`;
      setMatchdayButtons();
    } catch (e) {
      console.error("Errore Config matchday:", e);
      els.status.textContent = "Config giornata non disponibile";
      currentMatchday = null;
      selectedMatchday = null;
    }
  }

  function renderResultsSkeleton(text) {
    els.track.innerHTML = `<div class="neo-card neo-card-skeleton">${text}</div>`;
  }

  function mkResultCard({ home, away, homeGoals, awayGoals, badgeText, badgeClass }) {
    const safe = (s) => String(s ?? "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

    const LOGOS =
      (typeof CLUB_LOGOS !== "undefined" && CLUB_LOGOS) ||
      (typeof CLUBLOGOS !== "undefined" && CLUBLOGOS) ||
      {};

    const homeLogo = LOGOS[home] || "";
    const awayLogo = LOGOS[away] || "";

    const homeLogoHTML = homeLogo ? `<img class="neo-team-logo" src="${homeLogo}" alt="${safe(home)}" loading="lazy">` : "";
    const awayLogoHTML = awayLogo ? `<img class="neo-team-logo" src="${awayLogo}" alt="${safe(away)}" loading="lazy">` : "";

    return `
      <article class="neo-card neo-match-card">
        <div class="neo-match-head">
          <span class="neo-badge ${badgeClass || ""}">${safe(badgeText || "")}</span>
          <div class="neo-score">${safe(homeGoals)} - ${safe(awayGoals)}</div>
        </div>

        <div class="neo-match-teams">
          <div class="neo-team">
            ${homeLogoHTML}
            <span class="neo-team-name">${safe(home)}</span>
          </div>
          <span class="neo-vs">vs</span>
          <div class="neo-team">
            ${awayLogoHTML}
            <span class="neo-team-name">${safe(away)}</span>
          </div>
        </div>
      </article>
    `;
  }

  async function loadResultsForMatchday(matchdayWanted) {
    try {
      renderResultsSkeleton("Carico i risultati…");
      const rows = await fetchSheetDataJson(SHEET_NAMES.risultatiGiornata);

      const normalized = rows
        .map((r) => ({
          matchday: parseInt(r.Giornata ?? r.giornata ?? r.Matchday ?? r.matchday, 10),
          home: r.HomeTeam ?? r.home ?? r.Casa ?? r.SquadraCasa ?? r.Home,
          away: r.AwayTeam ?? r.away ?? r.Trasferta ?? r.SquadraTrasferta ?? r.Away,
          homeGoals: r.HomeGoals ?? r.homeGoals ?? r.GolCasa ?? r.GolHome ?? r.GFHome ?? "-",
          awayGoals: r.AwayGoals ?? r.awayGoals ?? r.GolTrasferta ?? r.GolAway ?? r.GFAway ?? "-",
          status: r.Status ?? r.status ?? "",
        }))
        .filter((x) => Number.isFinite(x.matchday));

      let md = matchdayWanted;
      if (!Number.isFinite(md)) {
        md = normalized.reduce((m, x) => Math.max(m, x.matchday), 0) || 1;
        selectedMatchday = md;
        els.status.textContent = `Giornata ${md}`;
        setMatchdayButtons();
      }

      const list = normalized.filter((x) => x.matchday === md);
      if (!list.length) {
        renderResultsSkeleton(`Nessun risultato per giornata ${md}.`);
        return;
      }

      els.track.innerHTML = list
        .map((x) =>
          mkResultCard({
            home: x.home,
            away: x.away,
            homeGoals: x.homeGoals,
            awayGoals: x.awayGoals,
            badgeText: x.status ? x.status : `Giornata ${md}`,
            badgeClass: String(x.status).toUpperCase().includes("LIVE") ? "live" : "",
          })
        )
        .join("");
    } catch (e) {
      console.error("Errore risultati:", e);
      renderResultsSkeleton("Errore caricamento risultati.");
    }
  }

  function hookCarouselArrows() {
    if (!els.prevArrow || !els.nextArrow) return;

    const scrollByCard = (dir) => {
      const card = els.track.querySelector(".neo-match-card");
      const dx = card ? card.getBoundingClientRect().width + 12 : 320;
      els.track.scrollBy({ left: dir * dx, behavior: "smooth" });
    };

    els.prevArrow.addEventListener("click", () => scrollByCard(-1));
    els.nextArrow.addEventListener("click", () => scrollByCard(1));
  }

  function fillAssistTables(rows) {
  const bodies = [
    document.getElementById("assist-body"),
    document.getElementById("assist-body-mobile"),
  ].filter(Boolean);

  bodies.forEach((tbody) => {
    tbody.innerHTML = "";

    rows.slice(0, 15).forEach((r, idx) => {
      const tr = document.createElement("tr");

      const club = r.club || "-";
      const logoUrl = CLUB_LOGOS?.[club];
      const clubHTML = logoUrl
        ? `<div class="table-team"><img src="${logoUrl}" alt="${club}" class="table-logo"><span>${club}</span></div>`
        : club;

      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td><strong>${r.player}</strong></td>
        <td>${clubHTML}</td>
        <td>${r.assist}</td>
      `;

      tbody.appendChild(tr);
    });
  });
}

  function normalize(value, max) {
    const v = Number(value) || 0;
    const m = Number(max) || 1;
    return Math.max(0, Math.min(100, Math.round((v / m) * 100)));
  }

  function buildRadarData(p, maxG, maxA) {
    const g = Number(p.gol) || 0;
    const a = Number(p.assist) || 0;

    const gN = normalize(g, maxG);
    const aN = normalize(a, maxA);
    const imp = normalize(g + a, maxG + maxA);
    const bonusIdx = normalize((0.7 * g) + (0.3 * a), (0.7 * maxG) + (0.3 * maxA));

    return {
      labels: ["Gol", "Assist", "Attacco", "Creatività", "Impatto", "Bonus"],
      values: [gN, aN, gN, aN, imp, bonusIdx],
    };
  }

  function renderCompareKpis(A, B) {
    const safe = (s) => String(s ?? "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    els.kpis.innerHTML = `
      <div class="neo-mini-card">
        <div style="font-weight:700; margin-bottom:6px;">${safe(A.player)} (${safe(A.club)})</div>
        <div>Gol: <strong>${safe(A.gol)}</strong> · Assist: <strong>${safe(A.assist)}</strong></div>
      </div>
      <div class="neo-mini-card">
        <div style="font-weight:700; margin-bottom:6px;">${safe(B.player)} (${safe(B.club)})</div>
        <div>Gol: <strong>${safe(B.gol)}</strong> · Assist: <strong>${safe(B.assist)}</strong></div>
      </div>
    `;
  }

  function renderRadar(A, B, maxG, maxA) {
    if (typeof Chart === "undefined") return;

    const aData = buildRadarData(A, maxG, maxA);
    const bData = buildRadarData(B, maxG, maxA);

    const ctx = els.radar.getContext("2d");
    if (radarChart) radarChart.destroy();

    radarChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: aData.labels,
        datasets: [
          {
            label: A.player,
            data: aData.values,
            fill: true,
            backgroundColor: "rgba(102,247,255,0.14)",
            borderColor: "rgba(102,247,255,0.85)",
            pointBackgroundColor: "rgba(102,247,255,0.95)",
            pointRadius: 2,
            borderWidth: 2,
          },
          {
            label: B.player,
            data: bData.values,
            fill: true,
            backgroundColor: "rgba(176,108,255,0.12)",
            borderColor: "rgba(176,108,255,0.85)",
            pointBackgroundColor: "rgba(176,108,255,0.95)",
            pointRadius: 2,
            borderWidth: 2,
          },
        ],
      },
      options: {
        plugins: { legend: { labels: { color: "#eaf2ff" } } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: "rgba(234,242,255,0.10)" },
            angleLines: { color: "rgba(234,242,255,0.10)" },
            pointLabels: { color: "rgba(234,242,255,0.80)", font: { size: 12 } },
          },
        },
      },
    });
  }

  // =====================
  // PICKER UI (active)
  // =====================
  const LOGOS =
    (typeof CLUB_LOGOS !== "undefined" && CLUB_LOGOS) ||
    (typeof CLUBLOGOS !== "undefined" && CLUBLOGOS) ||
    {};

  const pick = {
    wrap: document.getElementById("neo-player-picker"),
    title: document.getElementById("neo-picker-title"),
    search: document.getElementById("neo-picker-search"),
    list: document.getElementById("neo-picker-list"),

    aBtn: document.getElementById("pick-a"),
    bBtn: document.getElementById("pick-b"),

    aLogo: document.getElementById("pick-a-logo"),
    bLogo: document.getElementById("pick-b-logo"),
    aName: document.getElementById("pick-a-name"),
    bName: document.getElementById("pick-b-name"),
    aSub: document.getElementById("pick-a-sub"),
    bSub: document.getElementById("pick-b-sub"),
    aStats: document.getElementById("pick-a-stats"),
    bStats: document.getElementById("pick-b-stats"),
  };

  let pickingTarget = "A";
  let ALL_PLAYERS = [];

  function clubLogoHTML(club) {
    const url = LOGOS?.[club];
    return url ? `<img src="${url}" alt="${club}" loading="lazy">` : "";
  }

  function chipsHTML(p) {
    if (!p) return "";
    return `
      <span class="neo-stat-chip">Gol <strong>${p.gol || 0}</strong></span>
      <span class="neo-stat-chip">Assist <strong>${p.assist || 0}</strong></span>
    `;
  }

  function paintCards(A, B) {
    if (pick.aLogo) pick.aLogo.innerHTML = clubLogoHTML(A?.club);
    if (pick.bLogo) pick.bLogo.innerHTML = clubLogoHTML(B?.club);

    if (pick.aName) pick.aName.textContent = A?.player || "Seleziona";
    if (pick.bName) pick.bName.textContent = B?.player || "Seleziona";

    if (pick.aSub) pick.aSub.textContent = A?.club ? A.club : "Clicca per scegliere";
    if (pick.bSub) pick.bSub.textContent = B?.club ? B.club : "Clicca per scegliere";

    if (pick.aStats) pick.aStats.innerHTML = chipsHTML(A);
    if (pick.bStats) pick.bStats.innerHTML = chipsHTML(B);
  }

  function openPicker(target) {
    if (!pick.wrap || !pick.list) return;
    pickingTarget = target;

    if (pick.title) pick.title.textContent = target === "A" ? "Scegli giocatore A" : "Scegli giocatore B";

    pick.wrap.classList.add("active");
    pick.wrap.setAttribute("aria-hidden", "false");

    if (pick.search) {
      pick.search.value = "";
      pick.search.focus();
    }

    renderPickerList("");
  }

  function closePicker() {
    if (!pick.wrap) return;
    pick.wrap.classList.remove("active");
    pick.wrap.setAttribute("aria-hidden", "true");
  }

  function renderPickerList(q) {
    if (!pick.list) return;
    const query = String(q || "").trim().toLowerCase();

    const filtered = !query
      ? ALL_PLAYERS
      : ALL_PLAYERS.filter((p) =>
          (p.player || "").toLowerCase().includes(query) ||
          String(p.club || "").toLowerCase().includes(query)
        );

    pick.list.innerHTML = filtered
      .slice(0, 120)
      .map(
        (p) => `
        <button type="button" class="neo-picker-item" data-player="${encodeURIComponent(p.player)}">
          <div class="neo-picker-item-logo">${clubLogoHTML(p.club)}</div>
          <div class="neo-picker-item-main">
            <div class="neo-picker-item-name">${p.player}</div>
            <div class="neo-picker-item-sub">${p.club || "-"}</div>
          </div>
          <div class="neo-picker-item-badge">${p.gol || 0}G • ${p.assist || 0}A</div>
        </button>
      `
      )
      .join("");

    pick.list.querySelectorAll(".neo-picker-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = decodeURIComponent(btn.getAttribute("data-player") || "");
        const idx = ALL_PLAYERS.findIndex((x) => x.player === name);
        if (idx < 0) return;

        if (pickingTarget === "A") els.aSel.selectedIndex = idx;
        else els.bSel.selectedIndex = idx;

        els.aSel.dispatchEvent(new Event("change", { bubbles: true }));
        els.bSel.dispatchEvent(new Event("change", { bubbles: true }));

        closePicker();
      });
    });
  }

  pick.aBtn?.addEventListener("click", () => openPicker("A"));
  pick.bBtn?.addEventListener("click", () => openPicker("B"));
  pick.search?.addEventListener("input", (e) => renderPickerList(e.target.value));

  const cardA = pick.aBtn?.closest(".neo-pick-card") || pick.aBtn?.parentElement;
const cardB = pick.bBtn?.closest(".neo-pick-card") || pick.bBtn?.parentElement;

[ [cardA, "A"], [cardB, "B"] ].forEach(([el, t]) => {
  if (!el) return;
  el.style.cursor = "pointer";
  el.addEventListener("click", () => openPicker(t));
});


    // Rende cliccabile tutta la card (non solo il bottone interno)
  const cardA = document.getElementById("pick-a-card") || pick.aBtn?.closest(".neo-pick-card") || pick.aBtn?.closest(".neo-card") || pick.aBtn;
  const cardB = document.getElementById("pick-b-card") || pick.bBtn?.closest(".neo-pick-card") || pick.bBtn?.closest(".neo-card") || pick.bBtn;

  const makeClickable = (el, target) => {
    if (!el) return;
    el.style.cursor = "pointer";
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");

    el.addEventListener("click", () => openPicker(target));

    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openPicker(target);
      }
    });

    // Effetto hover/active stile bottone (inline così non dipende dal CSS)
    el.addEventListener("mouseenter", () => el.classList.add("neo-hover"));
    el.addEventListener("mouseleave", () => el.classList.remove("neo-hover"));
    el.addEventListener("mousedown", () => el.classList.add("neo-pressed"));
    el.addEventListener("mouseup", () => el.classList.remove("neo-pressed"));
  };

  makeClickable(cardA, "A");
  makeClickable(cardB, "B");

  // Inietta stile hover/pressed se non esiste già nel CSS
  if (!document.getElementById("neo-inline-hover-style")) {
    const st = document.createElement("style");
    st.id = "neo-inline-hover-style";
    st.textContent = `
      .neo-hover { transform: translateY(-1px); filter: brightness(1.06); }
      .neo-pressed { transform: translateY(0px) scale(0.99); filter: brightness(0.98); }
    `;
    document.head.appendChild(st);
  }


  pick.wrap?.addEventListener("click", (e) => {
    const el = e.target;
    if (el?.getAttribute?.("data-close") === "1") closePicker();
    if (el?.dataset?.close === "1") closePicker();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePicker();
  });

  async function loadPlayersForCompare() {
    try {
      const [rosaRows, golRows, assistRows] = await Promise.all([
        fetchSheetDataJson(SHEET_NAMES.rosaSerieA),
        fetchSheetDataJson(SHEET_NAMES.classificaMarcatori),
        fetchSheetDataJson(SHEET_NAMES.classificaAssist),
      ]);

      const map = new Map();

      (rosaRows || []).forEach((r) => {
        const player = String(r.Giocatore ?? r.Player ?? r.Nome ?? "").trim();
        if (!player) return;
        const club = String(r.Squadra ?? r.Club ?? "").trim();
        map.set(player, { player, club, gol: 0, assist: 0 });
      });

      (golRows || []).forEach((r) => {
        const player = String(r.Giocatore ?? r["Nome Giocatore"] ?? r.Player ?? r.player ?? "").trim();
        if (!player) return;
        const club = String(r.Club ?? r.Squadra ?? r.club ?? r.squadra ?? "").trim();
        const gol = Number(r.Gol ?? r.gol ?? 0) || 0;

        if (!map.has(player)) map.set(player, { player, club, gol: 0, assist: 0 });
        const obj = map.get(player);
        obj.gol = gol;
        if (!obj.club && club) obj.club = club;
      });

      (assistRows || []).forEach((r) => {
        const player = String(r.Giocatore ?? r["Nome Giocatore"] ?? r.Player ?? r.player ?? "").trim();
        if (!player) return;
        const club = String(r.Club ?? r.Squadra ?? r.club ?? r.squadra ?? "").trim();
        const assist = Number(r.Assist ?? r.assist ?? 0) || 0;

        if (!map.has(player)) map.set(player, { player, club, gol: 0, assist: 0 });
        const obj = map.get(player);
        obj.assist = assist;
        if (!obj.club && club) obj.club = club;
      });

      const players = Array.from(map.values()).sort((a, b) => a.player.localeCompare(b.player, "it"));

      if (!players.length) {
        els.kpis.innerHTML = `<div class="neo-mini-card">Nessun giocatore trovato.</div>`;
        return;
      }

      ALL_PLAYERS = players;

      const maxG = Math.max(1, ...players.map((p) => p.gol || 0));
      const maxA = Math.max(1, ...players.map((p) => p.assist || 0));

      const opt = players.map((p) => `<option value="${encodeURIComponent(p.player)}">${p.player}</option>`).join("");

      els.aSel.innerHTML = opt;
      els.bSel.innerHTML = opt;

      els.aSel.selectedIndex = 0;
      els.bSel.selectedIndex = Math.min(1, players.length - 1);

      function getSelected(sel) {
        const name = decodeURIComponent(sel.value || "");
        return players.find((p) => p.player === name) || players[0];
      }

      const doCompare = () => {
        const A = getSelected(els.aSel);
        const B = getSelected(els.bSel);
        renderCompareKpis(A, B);
        renderRadar(A, B, maxG, maxA);
        paintCards(A, B);
      };

      els.btnCompare?.addEventListener("click", doCompare);
      els.aSel.addEventListener("change", doCompare);
      els.bSel.addEventListener("change", doCompare);

      doCompare();
      renderPickerList("");

      fillAssistTables(
        players
          .slice()
          .sort((a, b) => (b.assist - a.assist) || (b.gol - a.gol) || a.player.localeCompare(b.player, "it"))
          .map((p) => ({ player: p.player, club: p.club || "-", assist: p.assist || 0 }))
      );
    } catch (e) {
      console.error("Errore comparatore:", e);
      els.kpis.innerHTML = `<div class="neo-mini-card">Errore caricamento giocatori.</div>`;
    }
  }

  function hookNeoTabs() {
    document.querySelectorAll(".neo-tabs .neo-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const wrap = btn.closest(".neo-card") || btn.closest("aside") || document;
        const tabName = btn.getAttribute("data-neo-tab");

        btn.parentElement.querySelectorAll(".neo-tab").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const map = {
          classifica: "neo-panel-classifica",
          marcatori: "neo-panel-marcatori",
          assist: "neo-panel-assist",
          "m-classifica": "neo-panel-m-classifica",
          "m-marcatori": "neo-panel-m-marcatori",
          "m-assist": "neo-panel-m-assist",
        };

        const panelId = map[tabName];
        if (!panelId) return;

        wrap.querySelectorAll(".neo-panel").forEach((p) => p.classList.remove("active"));
        const panel = wrap.querySelector("#" + panelId) || document.getElementById(panelId);
        if (panel) panel.classList.add("active");
      });
    });
  }

  function hookMatchdayButtons() {
    els.btnCur?.addEventListener("click", async () => {
      if (!Number.isFinite(currentMatchday)) return;
      selectedMatchday = currentMatchday;
      setMatchdayButtons();
      els.status.textContent = `Giornata ${selectedMatchday}`;
      await loadResultsForMatchday(selectedMatchday);
    });

    els.btnPrev?.addEventListener("click", async () => {
      const prev = pickPreviousMatchday();
      if (!Number.isFinite(prev)) return;
      selectedMatchday = prev;
      setMatchdayButtons();
      els.status.textContent = `Giornata ${selectedMatchday}`;
      await loadResultsForMatchday(selectedMatchday);
    });
  }

  hookCarouselArrows();
  hookNeoTabs();
  hookMatchdayButtons();

   // Hover/pressed anche sui bottoni classici (pill)
  [els.btnCur, els.btnPrev].filter(Boolean).forEach((b) => {
    b.style.cursor = "pointer";
    b.addEventListener("mouseenter", () => b.classList.add("neo-hover"));
    b.addEventListener("mouseleave", () => b.classList.remove("neo-hover"));
    b.addEventListener("mousedown", () => b.classList.add("neo-pressed"));
    b.addEventListener("mouseup", () => b.classList.remove("neo-pressed"));
  });

  (async () => {
    await loadConfigMatchday();
    await loadResultsForMatchday(selectedMatchday);
    await loadPlayersForCompare();
  })();
}

// =====================
// INIT (UNA SOLA VOLTA)
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  initHeroSlider();
  setupMobileNavbar();
  setupDashboardTabs();
  setupGlobalModalClose();
  setupFullTablesModals();

  const path = window.location.pathname.toLowerCase();

  // Home
  if (path === "/" || path.endsWith("/index.html") || path.endsWith("index.html")) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
    neonHomeInit();
  }

  // Previsioni
  if (path.includes("predictions")) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
    await populateAnalisiFantacalcio();
    await populatePronostici();
  }
});






