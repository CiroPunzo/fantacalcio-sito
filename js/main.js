// =====================
// HERO SLIDER
// =====================
let currentHeroSlide = 0;
let autoRotateInterval;

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length === 0 || dots.length === 0) return;

  slides.forEach(slide => slide.classList.remove('active'));
  slides[0].classList.add('active');

  dots.forEach(dot => dot.classList.remove('active'));
  dots[0].classList.add('active');

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToHeroSlide(index));
  });

  autoRotateInterval = setInterval(() => nextHeroSlide(), 5000);

  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    let touchStartX = 0;
    let touchEndX = 0;

    heroSlider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    heroSlider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      const threshold = 50;

      if (Math.abs(diff) < threshold) return;

      clearInterval(autoRotateInterval);
      if (diff < 0) nextHeroSlide();
      else prevHeroSlide();

      autoRotateInterval = setInterval(() => nextHeroSlide(), 5000);
    }, { passive: true });
  }
}

function showHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const total = slides.length;
  if (total === 0) return;

  if (index >= total) index = 0;
  if (index < 0) index = total - 1;
  currentHeroSlide = index;

  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');

  dots.forEach(dot => dot.classList.remove('active'));
  if (dots[index]) dots[index].classList.add('active');
}

function nextHeroSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;
  showHeroSlide(currentHeroSlide + 1);
}

function prevHeroSlide() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;
  showHeroSlide(currentHeroSlide - 1);
}

function goToHeroSlide(index) {
  clearInterval(autoRotateInterval);
  showHeroSlide(index);
  autoRotateInterval = setInterval(() => nextHeroSlide(), 5000);
}

// =====================
// NEWS MODAL
// =====================
function openNewsModal(data) {
  const modal = document.getElementById('news-modal');
  if (!modal) return;

  const titleEl = document.getElementById('modal-title');
  const subtitleEl = document.getElementById('modal-subtitle');
  const imageEl = document.getElementById('modal-image');
  const contentEl = document.getElementById('modal-content');

  if (titleEl) titleEl.textContent = data.title || '';
  if (subtitleEl) subtitleEl.textContent = data.subtitle || '';
  if (imageEl) imageEl.src = data.image || '';
  if (contentEl) contentEl.textContent = data.content || '';

  modal.classList.add('active');
}

function closeNewsModal() {
  const modal = document.getElementById('news-modal');
  if (modal) modal.classList.remove('active');
}

// =====================
// GOOGLE SHEETS CONFIG
// =====================
const SHEET_ID = '1ujW6Mth_rdRfsXQCI16cnW5oIg9djjVZnpffPhi7f48';

const SHEET_NAMES = {
  classifica: 'Classifica!A2:E',
  marcatori: 'ClassificaMarcatori',
  infortunati: 'Infortunati',
  analisiFantacalcio: 'AnalisiFantacalcio',
  pronostici: 'Pronostici',
  risultatiGiornata: 'RisultatiGiornata',
  playerPicks: 'PlayerPicks'
};

async function fetchSheetDataJson(sheetName) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url);
    const text = await response.text();

    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('Impossibile trovare JSON nella risposta di Google Sheets');
      console.log('Response text:', text);
      return [];
    }

    const jsonString = text.substring(jsonStart, jsonEnd + 1);
    const json = JSON.parse(jsonString);

    const cols = json.table.cols.map(col => col.label || '');
    const rows = json.table.rows.map(row => {
      const obj = {};
      cols.forEach((col, idx) => {
        obj[col || idx] = row.c[idx]?.v ?? '';
      });
      return obj;
    });

    rows._cols = cols;
    return rows;
  } catch (error) {
    console.error('Errore fetchSheetDataJson:', error);
    return [];
  }
}

// =====================
// LOGHI CLUB
// =====================
const CLUB_LOGOS = {
  'Milan': 'img/loghi/milan.png',
  'Napoli': 'img/loghi/napoli.png',
  'Inter': 'img/loghi/inter.png',
  'Roma': 'img/loghi/roma.png',
  'Bologna': 'img/loghi/bologna.png',
  'Como': 'img/loghi/como.png',
  'Juventus': 'img/loghi/juventus.png',
  'Sassuolo': 'img/loghi/sassuolo.png',
  'Cremonese': 'img/loghi/cremonese.png',
  'Lazio': 'img/loghi/lazio.png',
  'Udinese': 'img/loghi/udinese.png',
  'Cagliari': 'img/loghi/cagliari.png',
  'Parma': 'img/loghi/parma.png',
  'Genoa': 'img/loghi/genoa.png',
  'Verona': 'img/loghi/verona.png',
  'Fiorentina': 'img/loghi/fiorentina.png',
  'Pisa': 'img/loghi/pisa.png',
  'Atalanta': 'img/loghi/atalanta.png',
  'Lecce': 'img/loghi/lecce.png',
  'Torino': 'img/loghi/torino.png'
};

// =====================
// CLASSIFICA / MARCATORI / INFORTUNATI
// (le tue funzioni sono già ok: le tengo identiche nel tuo file reale)
// Qui sotto metto versioni "safe" che non rompono nulla.
// =====================
async function populateClassifica() {
  const data = await fetchSheetDataJson(SHEET_NAMES.classifica);
  const tbody = document.getElementById('classifica-body');
  if (!tbody) return;
  if (!Array.isArray(data) || data.length === 0) return;

  tbody.innerHTML = '';

  data
    .sort((a, b) => Number(a['Posizione']) - Number(b['Posizione']))
    .slice(0, 10)
    .forEach(row => {
      const tr = document.createElement('tr');
      const pos = Number(row['Posizione']);
      const squadra = row['Squadra'] || '-';

      let zonaHTML = '';
      if (pos >= 1 && pos <= 4) zonaHTML = `<div class="zona-badge zona-champions" title="Champions League"><img src="img/icon-cl-champions.png" alt="Champions League"></div>`;
      else if (pos >= 5 && pos <= 6) zonaHTML = `<div class="zona-badge zona-europa" title="Europa League"><img src="img/icon-el-europa.png" alt="Europa League"></div>`;
      else if (pos === 7) zonaHTML = `<div class="zona-badge zona-conference" title="Conference League"><img src="img/icon-conf-conference.png" alt="Conference League"></div>`;
      else if (pos >= 18) zonaHTML = `<div class="zona-badge zona-relegation" title="Retrocessione"><span></span></div>`;

      const logoUrl = CLUB_LOGOS[squadra] || '';
      tr.innerHTML = `
        <td>${row['Posizione'] || '-'}</td>
        <td>${zonaHTML}</td>
        <td>
          <div class="table-team">
            ${logoUrl ? `<img src="${logoUrl}" alt="${squadra}" class="table-logo">` : ''}
            <span><strong>${squadra}</strong></span>
          </div>
        </td>
        <td>${row['PG'] || '-'}</td>
        <td>${row['xG'] || '-'}</td>
        <td>${row['Punti'] || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
}

async function populateMarcatori() {
  const data = await fetchSheetDataJson(SHEET_NAMES.marcatori);
  const tbody = document.getElementById('marcatori-body');
  if (!tbody) return;
  if (!Array.isArray(data) || data.length === 0) return;

  tbody.innerHTML = '';

  data
    .filter(row => row['Posizione'])
    .sort((a, b) => Number(a['Posizione']) - Number(b['Posizione']))
    .slice(0, 10)
    .forEach(row => {
      const tr = document.createElement('tr');
      const giocatore = row['Nome Giocatore'] || '-';
      const club = row['Squadra'] || '-';
      const gol = row['Gol'] || '-';

      const logoUrl = CLUB_LOGOS[club] || '';
      const clubHTML = logoUrl
        ? `<div class="table-team"><img src="${logoUrl}" alt="${club}" class="table-logo"><span>${club}</span></div>`
        : club;

      tr.innerHTML = `
        <td>${row['Posizione'] || '-'}</td>
        <td><strong>${giocatore}</strong></td>
        <td>${clubHTML}</td>
        <td>${gol}</td>
      `;
      tbody.appendChild(tr);
    });
}

async function populateInfortunati() {
  const data = await fetchSheetDataJson(SHEET_NAMES.infortunati);
  const tbody = document.getElementById('infortunati-body');
  if (!tbody) return;
  if (!Array.isArray(data) || data.length === 0) return;

  const rows = data.filter(row =>
    (row[0] || row['Giocatore']) && (row[0] !== 'Giocatore')
  );

  tbody.innerHTML = '';

  rows.slice(0, 10).forEach(row => {
    const tr = document.createElement('tr');
    tr.className = 'clickable';

    const giocatore = row[0] || row['Giocatore'] || '-';
    const club = row[1] || row['Club'] || '-';
    const rientro = row[2] || row['Rientro Previsto'] || '-';
    const tipo = row[3] || row['Tipo Infortunio'] || '-';

    const logoUrl = CLUB_LOGOS[club] || '';
    const clubHTML = logoUrl
      ? `<div class="table-team"><img src="${logoUrl}" alt="${club}" class="table-logo"><span>${club}</span></div>`
      : club;

    tr.innerHTML = `
      <td><strong>${giocatore}</strong></td>
      <td>${clubHTML}</td>
      <td>${rientro}</td>
      <td>${tipo}</td>
    `;

    tbody.appendChild(tr);
  });
}

// =====================
// PREVISIONI: ANALISI + PRONOSTICI (le tue funzioni vanno bene, le lasciamo)
// =====================
async function populateAnalisiFantacalcio(selectedGiornata = null) {
  const data = await fetchSheetDataJson(SHEET_NAMES.analisiFantacalcio);
  const tbody = document.getElementById('pred-fanta-body');
  const select = document.getElementById('select-giornata-fanta');

  if (!tbody || !Array.isArray(data) || data.length === 0) return;

  const giornate = Array.from(new Set(
    data.map(row => row['Giornata']).filter(g => g !== '')
  )).sort((a, b) => Number(a) - Number(b));

  if (select && select.options.length === 0) {
    giornate.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = `Giornata ${g}`;
      select.appendChild(opt);
    });
    select.onchange = () => populateAnalisiFantacalcio(select.value);
  }

  const giornataCorrente = selectedGiornata || (giornate.length ? giornate[giornate.length - 1] : null);
  if (!giornataCorrente) return;

  if (select) select.value = String(giornataCorrente);

  const filtrati = data.filter(row => String(row['Giornata']) === String(giornataCorrente));
  tbody.innerHTML = '';

  filtrati.forEach(row => {
    const tr = document.createElement('tr');
    tr.classList.add('clickable');

    const casa = row['SquadraCasa'] || '-';
    const trasferta = row['SquadraTrasferta'] || '-';
    const orario = row['Orario'] || '-';
    const consigliati = row['Consigliati'] || '-';
    const daEvitare = row['DaEvitare'] || row['Da Evitare'] || '-';

    const logoCasa = CLUB_LOGOS[casa] || '';
    const logoTrasferta = CLUB_LOGOS[trasferta] || '';

    tr.innerHTML = `
      <td>
        <div class="pred-match-cell">
          <div class="pred-match-cell-logos">
            ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ''}
            ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ''}
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

    tr.addEventListener('click', () => openFantaMatchModal(row));
    tbody.appendChild(tr);
  });
}

function openFantaMatchModal(row) {
  const modal = document.getElementById('pred-fanta-modal');
  const body = document.getElementById('pred-fanta-modal-body');
  if (!modal || !body) return;

  const casa = row['SquadraCasa'] || '-';
  const trasferta = row['SquadraTrasferta'] || '-';
  const previsione = row['PrevisioneRisultato'] || '-';
  const analisi = row['AnalisiTattica'] || '-';

  const consCasa = row['ConsigliatiCasa'] || row['Consigliati'] || '-';
  const consTrasf = row['ConsigliatiTrasferta'] || '-';
  const evitaCasa = row['EvitaCasa'] || row['DaEvitare'] || '-';
  const evitaTrasf = row['EvitaTrasferta'] || '-';

  const logoCasa = CLUB_LOGOS[casa] || '';
  const logoTrasferta = CLUB_LOGOS[trasferta] || '';

  body.innerHTML = `
    <div class="pred-modal-header">
      <div class="pred-modal-logos">
        ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ''}
        ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ''}
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
        <h4>${casa} – Consigliati</h4>
        <p>${consCasa}</p>
        <h4>${casa} – Da evitare</h4>
        <p>${evitaCasa}</p>
      </div>
      <div class="pred-modal-col">
        <h4>${trasferta} – Consigliati</h4>
        <p>${consTrasf}</p>
        <h4>${trasferta} – Da evitare</h4>
        <p>${evitaTrasf}</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

async function populatePronostici(selectedGiornata = null) {
  const data = await fetchSheetDataJson(SHEET_NAMES.pronostici);
  const tbody = document.getElementById('pred-prono-body');
  const select = document.getElementById('select-giornata-prono');

  if (!tbody || !Array.isArray(data) || data.length === 0) return;

  const giornate = Array.from(new Set(
    data.map(row => row['Giornata']).filter(g => g !== '')
  )).sort((a, b) => Number(a) - Number(b));

  if (select && select.options.length === 0) {
    giornate.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = `Giornata ${g}`;
      select.appendChild(opt);
    });
    select.onchange = () => populatePronostici(select.value);
  }

  const giornataCorrente = selectedGiornata || (giornate.length ? giornate[giornate.length - 1] : null);
  if (!giornataCorrente) return;

  if (select) select.value = String(giornataCorrente);

  const filtrati = data.filter(row => String(row['Giornata']) === String(giornataCorrente));
  tbody.innerHTML = '';

  filtrati.forEach(row => {
    const tr = document.createElement('tr');
    tr.classList.add('clickable');

    const casa = row['SquadraCasa'] || '-';
    const trasferta = row['SquadraTrasferta'] || '-';
    const orario = row['Orario'] || '-';
    const esito = row['EsitoPrincipale'] || '-';
    const conf = row['Confidenza'] || '-';

    const logoCasa = CLUB_LOGOS[casa] || '';
    const logoTrasferta = CLUB_LOGOS[trasferta] || '';

    tr.innerHTML = `
      <td>
        <div class="pred-match-cell">
          <div class="pred-match-cell-logos">
            ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ''}
            ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ''}
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

    tr.addEventListener('click', () => openPronoMatchModal(row));
    tbody.appendChild(tr);
  });
}

function openPronoMatchModal(row) {
  const modal = document.getElementById('pred-prono-modal');
  const body = document.getElementById('pred-prono-modal-body');
  if (!modal || !body) return;

  const casa = row['SquadraCasa'] || '-';
  const trasferta = row['SquadraTrasferta'] || '-';
  const giornata = row['Giornata'] || '-';
  const orario = row['Orario'] || '-';
  const esito = row['EsitoPrincipale'] || '-';
  const alt1 = row['EsitoSecondario1'] || '';
  const alt2 = row['EsitoSecondario2'] || '';
  const conf = row['Confidenza'] || '0';
  const motivazione = row['Motivazione'] || '-';

  const logoCasa = CLUB_LOGOS[casa] || '';
  const logoTrasferta = CLUB_LOGOS[trasferta] || '';

  const maxStars = 5;
  const confNum = Number(conf) || 0;
  const stars = '★'.repeat(Math.max(0, Math.min(confNum, maxStars))) +
    '☆'.repeat(Math.max(0, maxStars - Math.min(confNum, maxStars)));

  body.innerHTML = `
    <div class="pred-modal-header">
      <div class="pred-modal-logos">
        ${logoCasa ? `<img src="${logoCasa}" alt="${casa}">` : ''}
        ${logoTrasferta ? `<img src="${logoTrasferta}" alt="${trasferta}">` : ''}
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
        <p class="pred-prono-stars">${stars} <span class="pred-prono-conf-num">${conf}/5</span></p>
      </div>
    </div>

    ${(alt1 || alt2) ? `
      <div class="pred-modal-section">
        <h3>Altri esiti considerati</h3>
        <ul class="pred-prono-alt-list">
          ${alt1 ? `<li>${alt1}</li>` : ''}
          ${alt2 ? `<li>${alt2}</li>` : ''}
        </ul>
      </div>
    ` : ''}

    <div class="pred-modal-section">
      <h3>Motivazione</h3>
      <p>${motivazione}</p>
    </div>
  `;

  modal.classList.add('active');
}

function openFirstFantaMatchInTable() {
  const tbody = document.getElementById('pred-fanta-body');
  if (!tbody) return;
  const firstRow = tbody.querySelector('tr');
  if (!firstRow) return;
  firstRow.click();
}

function openFirstPronoMatchInTable() {
  const tbody = document.getElementById('pred-prono-body');
  if (!tbody) return;
  const firstRow = tbody.querySelector('tr');
  if (!firstRow) return;
  firstRow.click();
}

// =====================
// PREVISIONI: TOPBAR ROUND + PICKS + MATCH CAROUSEL
// =====================
let CURRENT_PRED_ROUND = null;

function getUniqueRoundsFromRows(rows, fieldName = "Giornata") {
  const nums = (rows || [])
    .map(r => Number(r[fieldName]))
    .filter(n => Number.isFinite(n) && n >= 1 && n <= 38);
  return Array.from(new Set(nums)).sort((a, b) => a - b);
}

function normalizePickType(type) {
  const t = String(type || "").trim().toLowerCase();
  if (t === "certezza") return "Certezza";
  if (t === "scommessa") return "Scommessa";
  if (t === "da evitare" || t === "evitare") return "Da Evitare";
  return "";
}

function pickTypeToClass(type) {
  const t = normalizePickType(type);
  if (t === "Certezza") return "certezza";
  if (t === "Scommessa") return "scommessa";
  if (t === "Da Evitare") return "evitare";
  return "";
}

async function populateGlobalRoundSelect() {
  const selectGlobal = document.getElementById("select-giornata-global");
  if (!selectGlobal) return;

  const fantaData = await fetchSheetDataJson(SHEET_NAMES.analisiFantacalcio);
  if (!Array.isArray(fantaData) || !fantaData.length) return;

  // Una riga è "pubblicata" se:
  // - ha una Giornata valida
  // - la colonna Consigliati non è vuota (quindi l'hai compilata davvero)
  const publishedRows = fantaData.filter(r => {
    const g = Number(r.Giornata);
    const cons = String(r.Consigliati || "").trim();
    return Number.isFinite(g) && g >= 1 && g <= 38 && cons !== "";
  });

  // Giorni che hanno almeno 1 riga pubblicata
  const rounds = Array.from(new Set(
    publishedRows.map(r => Number(r.Giornata))
  )).sort((a, b) => a - b);

  if (!rounds.length) return;

  // Popola select SOLO con le giornate pubblicate
  selectGlobal.innerHTML = "";
  rounds.forEach(r => {
    const opt = document.createElement("option");
    opt.value = String(r);
    opt.textContent = `Giornata ${r}`;
    selectGlobal.appendChild(opt);
  });

  // Default = ultima giornata pubblicata (corrente)
  const defaultRound = rounds[rounds.length - 1];
  selectGlobal.value = String(defaultRound);

  selectGlobal.onchange = () => setPredictionsRound(selectGlobal.value);
  await setPredictionsRound(defaultRound);
}


async function setPredictionsRound(roundValue) {
  const r = Number(roundValue);
  if (!Number.isFinite(r)) return;
  CURRENT_PRED_ROUND = r;

  const roundLabel = document.getElementById("pred-round-label");
  const heroRound = document.getElementById("pred-hero-giornata");
  if (roundLabel) roundLabel.textContent = String(r);
  if (heroRound) heroRound.textContent = `Giornata ${r}`;

  const fantaSel = document.getElementById("select-giornata-fanta");
  const pronoSel = document.getElementById("select-giornata-prono");
  if (fantaSel) fantaSel.value = String(r);
  if (pronoSel) pronoSel.value = String(r);

  await populateAnalisiFantacalcio(String(r));
  await populatePronostici(String(r));
  await renderPlayerPicks(String(r));
  await renderMatchCarouselFromFanta(String(r));
}

async function renderPlayerPicks(roundValue) {
  const container = document.getElementById("pred-hero-picks");
  if (!container) return;

  const data = await fetchSheetDataJson(SHEET_NAMES.playerPicks);
  if (!Array.isArray(data) || !data.length) return;

  const rows = data
    .filter(r => Number(r.Giornata) === Number(roundValue))
    .map(r => ({
      tipo: normalizePickType(r.Tipo),
      giocatore: r.Giocatore || "-",
      motivazione: r.Motivazione || "",
      immagine: r.Immagine || ""
    }))
    .filter(r => r.tipo);

  const order = ["Certezza", "Scommessa", "Da Evitare"];
  const byType = {};
  rows.forEach(r => (byType[r.tipo] = r));

  container.innerHTML = "";

  order.forEach(tipo => {
    const item = byType[tipo] || { tipo, giocatore: "-", motivazione: "", immagine: "" };
    const cls = pickTypeToClass(tipo);

    const imgHTML = item.immagine
      ? `<div class="pred-hero-media"><img src="${item.immagine}" alt="${item.giocatore}" loading="lazy"></div>`
      : "";

    const card = document.createElement("article");
    card.className = `pred-hero-card ${cls}`;
    card.innerHTML = `
      ${imgHTML}
      <div class="pred-hero-card-inner">
        <div class="pred-hero-card-top">
          <span class="pred-hero-chip">${tipo === "Da Evitare" ? "Da evitare" : "La " + tipo}</span>
        </div>
        <div class="pred-hero-card-body">
          <h2 class="pred-hero-player">${item.giocatore}</h2>
          <p class="pred-hero-reason">${item.motivazione}</p>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function renderMatchCarouselFromFanta(roundValue) {
  const track = document.getElementById("pred-match-track");
  if (!track) return;

  const fantaData = await fetchSheetDataJson(SHEET_NAMES.analisiFantacalcio);
  if (!Array.isArray(fantaData) || !fantaData.length) return;

  const rows = fantaData
    .filter(r => String(r.Giornata) === String(roundValue))
    .slice(0, 10);

  track.innerHTML = "";

  rows.forEach(row => {
    const casa = row.SquadraCasa || row['SquadraCasa'] || "-";
    const trasferta = row.SquadraTrasferta || row['SquadraTrasferta'] || "-";

    const logoCasa = CLUB_LOGOS[casa];
    const logoTrasferta = CLUB_LOGOS[trasferta];

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pred-match-pill";

    btn.innerHTML = `
      <span class="pred-match-pill-side">
        ${logoCasa ? `<img class="pred-match-pill-logo" src="${logoCasa}" alt="${casa}">` : ""}
        <span class="pred-match-pill-team">${casa}</span>
      </span>
      <span class="pred-match-pill-vs">vs</span>
      <span class="pred-match-pill-side">
        ${logoTrasferta ? `<img class="pred-match-pill-logo" src="${logoTrasferta}" alt="${trasferta}">` : ""}
        <span class="pred-match-pill-team">${trasferta}</span>
      </span>
    `;

    btn.addEventListener("click", () => openFantaMatchModal(row));
    track.appendChild(btn);
  });
}

// =====================
// UI: Tabs + navbar mobile (se presenti nel tuo sito)
// =====================
function setupDashboardTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');
  if (!tabs.length || !contents.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const tabName = e.currentTarget.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const tabContent = document.getElementById(tabName);
      if (tabContent) tabContent.classList.add('active');
    });
  });
}

function setupMobileNavbar() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!navToggle || !navLinks) return;

  navToggle.style.pointerEvents = 'auto';

  const toggleMenu = (e) => {
    if (e) e.preventDefault();
    const isOpen = navLinks.classList.toggle('nav-open');
    navToggle.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  navToggle.addEventListener('click', toggleMenu);
  navToggle.addEventListener('touchend', (e) => { e.preventDefault(); toggleMenu(e); });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-open');
      navToggle.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// =====================
// MODAL CLOSE HANDLER
// =====================
document.addEventListener('click', function (e) {
  const newsModal = document.getElementById('news-modal');
  const injuryModal = document.getElementById('infortunio-modal');
  const classificaModal = document.getElementById('classifica-modal');
  const marcatoriModal = document.getElementById('marcatori-modal');
  const infortunatiFullModal = document.getElementById('infortunati-modal');
  const fantaModal = document.getElementById('pred-fanta-modal');
  const pronoModal = document.getElementById('pred-prono-modal');

  if (newsModal && e.target === newsModal) closeNewsModal();
  if (injuryModal && e.target === injuryModal) injuryModal.classList.remove('active');
  if (classificaModal && e.target === classificaModal) classificaModal.classList.remove('active');
  if (marcatoriModal && e.target === marcatoriModal) marcatoriModal.classList.remove('active');
  if (infortunatiFullModal && e.target === infortunatiFullModal) infortunatiFullModal.classList.remove('active');
  if (fantaModal && e.target === fantaModal) fantaModal.classList.remove('active');
  if (pronoModal && e.target === pronoModal) pronoModal.classList.remove('active');

  if (e.target.classList && e.target.classList.contains('modal-close')) {
    const parentModal = e.target.closest('.modal');
    if (parentModal) parentModal.classList.remove('active');
  }
});

// =====================
// INIT
// =====================
document.addEventListener('DOMContentLoaded', async function () {
  initHeroSlider();
  setupMobileNavbar();
  setupDashboardTabs();

  const path = window.location.pathname.toLowerCase();

  // Pagina Previsioni
  if (path.includes('predictions')) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();

    // IMPORTANTISSIMO: questa fa partire tutto il resto (fanta/prono/picks/carousel)
    await populateGlobalRoundSelect();
  }

  // Home
  if (path.endsWith('/') || path.endsWith('/index.html')) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
  }
});

  // ===== PRO FANTASY LEADS (Apps Script Web App) =====
// ===== PRO FANTASY LEADS (Apps Script Web App) =====
const LEADS_ENDPOINT = "https://script.google.com/macros/s/AKfycbxptgDb7fbF-qLo9dm0jMUGsX9RWF-FzVcjyydEXzBboWIk7Wm0LdWBVlYpyVpz9xwQ/exec";

function setLeadStatus(msg, isError = false) {
  const el = document.getElementById("lead-status");
  if (!el) return;
  el.style.display = "block";
  el.style.color = isError ? "rgba(255,120,120,0.95)" : "rgba(255,255,255,0.92)";
  el.textContent = msg;
}

function fileToPngBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function postLead(payload) {
  const res = await fetch(LEADS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Se Apps Script risponde non-JSON, qui esplode: lo vogliamo vedere.
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return { ok: false, error: "Risposta non JSON: " + text.slice(0, 120) }; }
}

async function fetchJoinList() {
  const res = await fetch(LEADS_ENDPOINT, { method: "GET" });
  return res.json();
}

function openModalById(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add("active");
}

function renderJoinRows(rows) {
  const tbody = document.getElementById("join-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  rows.slice().reverse().slice(0, 80).forEach(r => {
    const logoUrl = r["Logo"] || "";
    const squadra = r["Squadra"] || "-";
    const nome = r["Nome Partecipante"] || "-";
    const club = r["Club"] || "-";
    const isExclusive = String(club).toLowerCase().includes("exclusive");

    const logoHtml = logoUrl
      ? `<div class="logo-pill"><img src="${logoUrl}" alt="${squadra} logo"></div>`
      : `<div class="logo-pill"><span style="opacity:.7;">—</span></div>`;

    const clubHtml = isExclusive
      ? `<span class="badge-pill" style="border-color: rgba(184,149,107,0.65); color: #B8956B; background: rgba(184,149,107,0.10);">EXCLUSIVE</span>`
      : `<span class="badge-pill badge-soft">OPEN</span>`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="logo-cell">${logoHtml}</td>
      <td>${squadra}</td>
      <td>${nome}</td>
      <td>${clubHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function setupLeadForm() {
  const form = document.getElementById("lead-form");
  if (!form) return;

  const logoInput = document.getElementById("lead-logo");
  const preview = document.getElementById("lead-logo-preview");

  if (logoInput && preview) {
    logoInput.addEventListener("change", () => {
      const file = logoInput.files && logoInput.files[0];
      if (!file) { preview.style.display = "none"; return; }
      if (file.type !== "image/png") {
        setLeadStatus("Errore: carica solo un file PNG.", true);
        logoInput.value = "";
        preview.style.display = "none";
        return;
      }
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("lead-nome")?.value?.trim() || "";
    const squadra = document.getElementById("lead-squadra")?.value?.trim() || "";
    const email = document.getElementById("lead-email")?.value?.trim() || "";
    const whatsapp = document.getElementById("lead-whatsapp")?.value?.trim() || "";
    const club = document.getElementById("lead-club")?.value?.trim() || "Open";
    const consent = document.getElementById("lead-consent")?.checked;

    if (!consent) {
      setLeadStatus("Devi accettare la Privacy Policy per inviare la richiesta.", true);
      return;
    }

    setLeadStatus("Invio in corso...", false);

    let logoBase64 = "";
    const file = logoInput?.files?.[0];
    if (file) logoBase64 = await fileToPngBase64(file);

    const payload = {
      nome,
      squadra,
      telefono: whatsapp,
      email,
      club,
      logoBase64
    };

    const out = await postLead(payload);

    if (!out || !out.ok) {
      setLeadStatus("Errore invio: " + (out?.error || "riprova tra poco."), true);
      return;
    }

    form.reset();
    if (preview) preview.style.display = "none";
    setLeadStatus("Perfetto! Sei stato aggiunto alla lista.", false);
  });
}

function setupJoinModal() {
  const btn = document.getElementById("open-join-modal");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    openModalById("join-modal");
    const tbody = document.getElementById("join-body");
    if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="opacity:.75;">Caricamento...</td></tr>`;

    try {
      const data = await fetchJoinList();
      if (!data || !data.ok) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="color: rgba(255,120,120,0.95);">Errore: ${data?.error || "impossibile caricare."}</td></tr>`;
        return;
      }
      renderJoinRows(data.rows || []);
    } catch (err) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="color: rgba(255,120,120,0.95);">Errore rete: ${String(err)}</td></tr>`;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupLeadForm();
  setupJoinModal();
});


}








