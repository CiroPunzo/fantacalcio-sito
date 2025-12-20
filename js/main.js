// ===== HERO SLIDER =====
let currentHeroSlide = 0;
let autoRotateInterval;

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');

  if (slides.length === 0) return;

  // stato iniziale
  slides.forEach(slide => slide.classList.remove('active'));
  slides[0].classList.add('active');

  // sincronizza i dots: primo attivo
  dots.forEach(dot => dot.classList.remove('active'));
  if (dots[0]) dots[0].classList.add('active');

  // click sui dots (nuova struttura)
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToHeroSlide(index);
    });
  });

  // autoplay
  autoRotateInterval = setInterval(() => {
    nextHeroSlide();
  }, 5000);

  // swipe touch su mobile
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
      if (diff < 0) {
        nextHeroSlide();
      } else {
        prevHeroSlide();
      }
      autoRotateInterval = setInterval(() => {
        nextHeroSlide();
      }, 5000);
    }, { passive: true });
  }
}

function showHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const allDots = document.querySelectorAll('.hero-dot'); // tutti i dots di tutte le slide
  const total = slides.length;
  if (total === 0) return;

  if (index >= total) index = 0;
  if (index < 0) index = total - 1;
  currentHeroSlide = index;

  // attiva la slide corretta
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');

  // reset dots
  allDots.forEach(dot => dot.classList.remove('active'));
  // attiva solo il dot con lo stesso index
  if (allDots[index]) {
    allDots[index].classList.add('active');
  }
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
  autoRotateInterval = setInterval(() => {
    nextHeroSlide();
  }, 5000);
}

// inizializza a DOM pronto
document.addEventListener('DOMContentLoaded', initHeroSlider);



// ===== NAVBAR MOBILE (HAMBURGER) =====
function setupMobileNavbar() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!navToggle || !navLinks) return;

  // assicuriamoci che il bottone sia clickabile per Safari/iOS
  navToggle.style.pointerEvents = 'auto';

  const toggleMenu = (e) => {
    // per Safari mobile è più sicuro prevenire default su button
    if (e) e.preventDefault();

    const isOpen = navLinks.classList.toggle('nav-open');
    navToggle.classList.toggle('nav-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  // click “classico”
  navToggle.addEventListener('click', toggleMenu);

  // supporto esplicito touch per Safari iOS
  navToggle.addEventListener('touchend', (e) => {
    e.preventDefault();
    toggleMenu(e);
  });

  // chiudi il menu al click su un link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('nav-open');
      navToggle.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}


// ===== NEWS MODAL =====
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

// ===== GOOGLE SHEETS CONFIG =====
const SHEET_ID = '1ujW6Mth_rdRfsXQCI16cnW5oIg9djjVZnpffPhi7f48';

const SHEET_NAMES = {
    classifica: 'Classifica',
    marcatori: 'ClassificaMarcatori', // <-- classifica marcatori ordinata
    infortunati: 'Infortunati',
    analisiFantacalcio: 'AnalisiFantacalcio',
    pronostici: 'Pronostici',
    risultatiGiornata: 'RisultatiGiornata'
};

// Fetch + parse robusto da Google Sheets (gviz)
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

        // Salvo anche le colonne per usarle in debug o mapping
        rows._cols = cols;
        return rows;
    } catch (error) {
        console.error('Errore fetchSheetDataJson:', error);
        return [];
    }
}


// ===== POPOLAZIONE TABELLE =====
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

// ----- CLASSIFICA -----
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
            if (pos >= 1 && pos <= 4) {
                zonaHTML = `
                    <div class="zona-badge zona-champions" title="Champions League">
                        <img src="img/icon-cl-champions.png" alt="Champions League">
                    </div>
                `;
            } else if (pos >= 5 && pos <= 6) {
                zonaHTML = `
                    <div class="zona-badge zona-europa" title="Europa League">
                        <img src="img/icon-el-europa.png" alt="Europa League">
                    </div>
                `;
            } else if (pos === 7) {
                zonaHTML = `
                    <div class="zona-badge zona-conference" title="Conference League">
                        <img src="img/icon-conf-conference.png" alt="Conference League">
                    </div>
                `;
            } else if (pos >= 18) {
                zonaHTML = `
                    <div class="zona-badge zona-relegation" title="Retrocessione">
                        <span></span>
                    </div>
                `;
            }

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

async function populateFullClassificaModal() {
    const data = await fetchSheetDataJson(SHEET_NAMES.classifica);
    const tbody = document.getElementById('classifica-full-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) return;

    tbody.innerHTML = '';

    data
        .sort((a, b) => Number(a['Posizione']) - Number(b['Posizione']))
        .forEach(row => {
            const tr = document.createElement('tr');

            const pos = Number(row['Posizione']);
            const squadra = row['Squadra'] || '-';

            let zonaHTML = '';
            if (pos >= 1 && pos <= 4) {
                zonaHTML = `
                    <div class="zona-badge zona-champions" title="Champions League">
                        <img src="img/icon-cl-champions.png" alt="Champions League">
                    </div>
                `;
            } else if (pos >= 5 && pos <= 6) {
                zonaHTML = `
                    <div class="zona-badge zona-europa" title="Europa League">
                        <img src="img/icon-el-europa.png" alt="Europa League">
                    </div>
                `;
            } else if (pos === 7) {
                zonaHTML = `
                    <div class="zona-badge zona-conference" title="Conference League">
                        <img src="img/icon-conf-conference.png" alt="Conference League">
                    </div>
                `;
            } else if (pos >= 18) {
                zonaHTML = `
                    <div class="zona-badge zona-relegation" title="Retrocessione">
                        <span></span>
                    </div>
                `;
            }

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

// ----- MARCATORI (usa ClassificaMarcatori) -----
async function populateMarcatori() {
    const data = await fetchSheetDataJson(SHEET_NAMES.marcatori);
    const tbody = document.getElementById('marcatori-body');
    if (!tbody) {
        console.warn('Elemento #marcatori-body non trovato');
        return;
    }
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('Nessun dato Marcatori', data);
        return;
    }

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
                ? `<div class="table-team">
                        <img src="${logoUrl}" alt="${club}" class="table-logo">
                        <span>${club}</span>
                   </div>`
                : (club || '-');

            tr.innerHTML = `
                <td>${row['Posizione'] || '-'}</td>
                <td><strong>${giocatore}</strong></td>
                <td>${clubHTML}</td>
                <td>${gol}</td>
            `;
            tbody.appendChild(tr);
        });

    console.log('Marcatori populated', data);
}

async function populateFullMarcatoriModal() {
    const data = await fetchSheetDataJson(SHEET_NAMES.marcatori);
    const tbody = document.getElementById('marcatori-full-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) return;

    tbody.innerHTML = '';

    data
        .filter(row => row['Posizione'])
        .sort((a, b) => Number(a['Posizione']) - Number(b['Posizione']))
        .forEach(row => {
            const tr = document.createElement('tr');

            const giocatore = row['Nome Giocatore'] || '-';
            const club = row['Squadra'] || '-';
            const gol = row['Gol'] || '-';

            const logoUrl = CLUB_LOGOS[club] || '';
            const clubHTML = logoUrl
                ? `<div class="table-team">
                        <img src="${logoUrl}" alt="${club}" class="table-logo">
                        <span>${club}</span>
                   </div>`
                : (club || '-');

            tr.innerHTML = `
                <td>${row['Posizione'] || '-'}</td>
                <td><strong>${giocatore}</strong></td>
                <td>${clubHTML}</td>
                <td>${gol}</td>
            `;
            tbody.appendChild(tr);
        });
}

// ----- INFORTUNATI -----
// ----- INFORTUNATI -----
async function populateInfortunati() {
    const data = await fetchSheetDataJson(SHEET_NAMES.infortunati);
    const tbody = document.getElementById('infortunati-body');
    if (!tbody) {
        console.warn('Elemento #infortunati-body non trovato');
        return;
    }
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('Nessun dato Infortunati', data);
        return;
    }

    // data._cols contiene le intestazioni, data[0] è la prima riga (Giocatore / Club / ...)
    // quindi prendiamo solo le righe di dati vere
    const rows = data.filter(row =>
        (row[0] || row['Giocatore']) && (row[0] !== 'Giocatore')
    );

    tbody.innerHTML = '';

    // PREVIEW: primi 10
    rows
        .slice(0, 10)
        .forEach(row => {
            const tr = document.createElement('tr');
            tr.className = 'clickable';

            const giocatore = row[0] || row['Giocatore'] || '-';
            const club      = row[1] || row['Club'] || '-';
            const rientro   = row[2] || row['Rientro Previsto'] || '-';
            const tipo      = row[3] || row['Tipo Infortunio'] || '-';

            const logoUrl = CLUB_LOGOS[club] || '';
            const clubHTML = logoUrl
                ? `<div class="table-team">
                        <img src="${logoUrl}" alt="${club}" class="table-logo">
                        <span>${club}</span>
                   </div>`
                : (club || '-');

            tr.innerHTML = `
                <td><strong>${giocatore}</strong></td>
                <td>${clubHTML}</td>
                <td>${rientro}</td>
                <td>${tipo}</td>
            `;

            tr.addEventListener('click', () => openInjuryModal(row));
            tbody.appendChild(tr);
        });

    console.log('Infortunati populated (preview)', rows.length);
}

async function populateFullInfortunatiModal() {
    const data = await fetchSheetDataJson(SHEET_NAMES.infortunati);
    const tbody = document.getElementById('infortunati-full-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) return;

    const rows = data.filter(row =>
        (row[0] || row['Giocatore']) && (row[0] !== 'Giocatore')
    );

    tbody.innerHTML = '';

    rows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'clickable'; // <-- come nella preview

        const giocatore = row[0] || row['Giocatore'] || '-';
        const club      = row[1] || row['Club'] || '-';
        const rientro   = row[2] || row['Rientro Previsto'] || '-';
        const tipo      = row[3] || row['Tipo Infortunio'] || '-';

        const logoUrl = CLUB_LOGOS[club] || '';
        const clubHTML = logoUrl
            ? `<div class="table-team">
                    <img src="${logoUrl}" alt="${club}" class="table-logo">
                    <span>${club}</span>
               </div>`
            : (club || '-');

        tr.innerHTML = `
            <td><strong>${giocatore}</strong></td>
            <td>${clubHTML}</td>
            <td>${rientro}</td>
            <td>${tipo}</td>
        `;

        // <-- aggiungiamo anche qui l'apertura del modal
        tr.addEventListener('click', () => openInjuryModal(row));

        tbody.appendChild(tr);
    });

    console.log('Infortunati full populated', rows.length);
}


// ===== INFORTUNIO MODAL =====
function openInjuryModal(data) {
    const modal = document.getElementById('infortunio-modal');
    if (!modal) return;

    const g = document.getElementById('modal-giocatore');
    const c = document.getElementById('modal-club');
    const s = document.getElementById('modal-status');
    const t = document.getElementById('modal-infortunio');
    const r = document.getElementById('modal-ritorno');

    const giocatore = data[0] || data['Giocatore'] || 'N/A';
    const club      = data[1] || data['Club'] || 'N/A';
    const rientro   = data[2] || data['Rientro Previsto'] || 'N/A';
    const tipo      = data[3] || data['Tipo Infortunio'] || 'N/A';

    if (g) g.textContent = giocatore;
    if (c) c.textContent = club;
    if (s) s.textContent = 'Indisponibile';
    if (t) t.textContent = tipo;
    if (r) r.textContent = rientro;

    modal.classList.add('active');
}


function closeInjuryModal() {
    const modal = document.getElementById('infortunio-modal');
    if (modal) modal.classList.remove('active');
}

// ===== DASHBOARD TABS =====
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

// ===== MODAL CLOSE HANDLER GENERICO =====
document.addEventListener('click', function(e) {
    const newsModal = document.getElementById('news-modal');
    const injuryModal = document.getElementById('infortunio-modal');
    const classificaModal = document.getElementById('classifica-modal');
    const marcatoriModal = document.getElementById('marcatori-modal');
    const infortunatiFullModal = document.getElementById('infortunati-modal');
    const fantaModal = document.getElementById('pred-fanta-modal');
    const pronoModal = document.getElementById('pred-prono-modal');

    if (newsModal && e.target === newsModal) closeNewsModal();
    if (injuryModal && e.target === injuryModal) closeInjuryModal();
    if (classificaModal && e.target === classificaModal) classificaModal.classList.remove('active');
    if (marcatoriModal && e.target === marcatoriModal) marcatoriModal.classList.remove('active');
    if (infortunatiFullModal && e.target === infortunatiFullModal) infortunatiFullModal.classList.remove('active');
    if (fantaModal && e.target === fantaModal) fantaModal.classList.remove('active');
    if (pronoModal && e.target === pronoModal) pronoModal.classList.remove('active');

    if (e.target.classList.contains('modal-close')) {
        if (e.target.closest('#news-modal')) closeNewsModal();
        if (e.target.closest('#infortunio-modal')) closeInjuryModal();
        if (e.target.closest('#classifica-modal')) classificaModal.classList.remove('active');
        if (e.target.closest('#marcatori-modal')) marcatoriModal.classList.remove('active');
        if (e.target.closest('#infortunati-modal')) infortunatiFullModal.classList.remove('active');
        if (e.target.closest('#pred-fanta-modal')) fantaModal.classList.remove('active');
        if (e.target.closest('#pred-prono-modal')) pronoModal.classList.remove('active');
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
  // Slider + navbar + tabs sempre
  initHeroSlider();
  setupMobileNavbar();
  setupDashboardTabs();

  const path = window.location.pathname.toLowerCase();

  // HANDLER UNICO PER I LINK DI APERTURA MODALI FULL TABLE (vale ovunque compaiano)
  const fullClassificaBtn   = document.getElementById('open-full-classifica');
  const fullMarcatoriBtn    = document.getElementById('open-full-marcatori');
  const fullInfortunatiBtn  = document.getElementById('open-full-infortunati');

  if (fullClassificaBtn) {
    fullClassificaBtn.addEventListener('click', async (e) => {
      e.preventDefault();                          // blocca lo scroll in alto [web:47]
      await populateFullClassificaModal();
      const modal = document.getElementById('classifica-modal');
      if (modal) modal.classList.add('active');
    });
  }

  if (fullMarcatoriBtn) {
    fullMarcatoriBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await populateFullMarcatoriModal();
      const modal = document.getElementById('marcatori-modal');
      if (modal) modal.classList.add('active');
    });
  }

  if (fullInfortunatiBtn) {
    fullInfortunatiBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await populateFullInfortunatiModal();
      const modal = document.getElementById('infortunati-modal');
      if (modal) modal.classList.add('active');
    });
  }

  // PAGINA PREVISIONI
  if (path.includes('predictions')) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
    await populateAnalisiFantacalcio();
    await populatePronostici();

    const fullFantaBtn = document.getElementById('open-full-fanta');
    if (fullFantaBtn) {
      fullFantaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openFirstFantaMatchInTable();
      });
    }

    const fullPronoBtn = document.getElementById('open-full-prono');
    if (fullPronoBtn) {
      fullPronoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openFirstPronoMatchInTable();
      });
    }

    const heroGiornataEl = document.getElementById('pred-hero-giornata');
    const fantaData = await fetchSheetDataJson(SHEET_NAMES.analisiFantacalcio);
    if (heroGiornataEl && Array.isArray(fantaData) && fantaData.length) {
      const giornate = Array.from(new Set(
        fantaData.map(row => row['Giornata']).filter(g => g !== '')
      )).sort((a, b) => Number(a) - Number(b));
      if (giornate.length) {
        heroGiornataEl.textContent = giornate[giornate.length - 1];
      }
    }
  }

  // HOME
  if (path.endsWith('/') || path.endsWith('/index.html')) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
  }

  // PAGINA RISULTATI (track-record.html)
  if (path.includes('track-record') || path.includes('risultati')) {
    await populateRisultatiGiornata();
  }

  console.log('Site initialized');
});

document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');

  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
});




// ===== ANALISI FANTACALCIO (TAB PREVISIONI) =====
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
    }

    const giornataCorrente = selectedGiornata || (giornate.length ? giornate[giornate.length - 1] : null);
    if (!giornataCorrente) return;

    if (select) {
        select.value = giornataCorrente;
        select.onchange = () => {
            populateAnalisiFantacalcio(select.value);
        };
    }

    const filtrati = data.filter(row => String(row['Giornata']) === String(giornataCorrente));

    tbody.innerHTML = '';

    filtrati.forEach(row => {
        const tr = document.createElement('tr');
        tr.classList.add('clickable');

        const casa = row['SquadraCasa'] || '-';
        const trasferta = row['SquadraTrasferta'] || '-';
        const orario = row['Orario'] || '-';
        const consigliati = row['Consigliati'] || '-';
        const daEvitare = row['DaEvitare'] || '-';

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

// ===== PRONOSTICI (TAB PREVISIONI) =====
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
    }

    const giornataCorrente = selectedGiornata || (giornate.length ? giornate[giornate.length - 1] : null);
    if (!giornataCorrente) return;

    if (select) {
        select.value = giornataCorrente;
        select.onchange = () => {
            populatePronostici(select.value);
        };
    }

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

// ===== RISULTATI GIORNATA (PAGINA RISULTATI) =====
// ===== RISULTATI GIORNATA (PAGINA RISULTATI) =====
let RESULTS_DATA_CACHE = null;

async function populateRisultatiGiornata(selectedRound = 'all') {
  // 1. Prendo i dati (con cache)
  const data = RESULTS_DATA_CACHE ||
    await fetchSheetDataJson(SHEET_NAMES.risultatiGiornata);
  if (!Array.isArray(data) || data.length === 0) return;
  RESULTS_DATA_CACHE = data;

  const allRows = data.filter(row => row['Risultati']);
  if (allRows.length === 0) return;

  // 2. Lista giornate disponibili
  const rounds = Array.from(new Set(
    allRows.map(r => r['Risultati'])
  )).sort((a, b) => Number(a) - Number(b));

  // 3. Popolo il select solo la prima volta
  const selectEl = document.getElementById('results-giornata-select');
  if (selectEl && selectEl.options.length <= 1) {
    rounds.forEach(g => {
      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = `Giornata ${g}`;
      selectEl.appendChild(opt);
    });

    selectEl.onchange = () => {
      populateRisultatiGiornata(selectEl.value || 'all');
    };
  }

  // 4. Applico il filtro (all = tutte)
  const rows = (selectedRound === 'all')
    ? allRows
    : allRows.filter(r => String(r['Risultati']) === String(selectedRound));

  if (rows.length === 0) return;

  // 5. Calcolo medie sulle righe filtrate
  const accPronList = rows
    .map(r => Number(r['AccuracyPronostici']))
    .filter(v => !isNaN(v));
  const accFantaList = rows
    .map(r => Number(r['AccuracyFanta']))
    .filter(v => !isNaN(v));

  const avg = arr => arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

  const accPronAvg = avg(accPronList);
  const accFantaAvg = avg(accFantaList);

  // 6. Best round calcolato sul totale
  let bestRound = null;
  let bestAcc = -1;
  allRows.forEach(r => {
    const acc = Number(r['AccuracyPronostici']);
    if (!isNaN(acc) && acc > bestAcc) {
      bestAcc = acc;
      bestRound = r['Risultati'];
    }
  });

  // 7. Aggiorno badge hero
  const globalAccEl = document.getElementById('res-global-accuracy');
  const giornateCountEl = document.getElementById('res-giornate-count');
  const lastGiornataEl = document.getElementById('res-last-giornata');

  if (globalAccEl && accPronList.length) {
    const label = (selectedRound === 'all')
      ? 'Accuracy globale'
      : `Accuracy giornata ${selectedRound}`;
    globalAccEl.textContent = `${label}: ${accPronAvg.toFixed(1)}%`;
  }
  if (giornateCountEl) {
    const countLabel = (selectedRound === 'all')
      ? `Giornate analizzate: ${allRows.length}`
      : `Giornata selezionata: ${selectedRound}`;
    giornateCountEl.textContent = countLabel;
  }
  if (lastGiornataEl && rounds.length) {
    lastGiornataEl.textContent = rounds[rounds.length - 1];
  }

  // 8. Aggiorno KPI
  const kpiPronEl = document.getElementById('res-kpi-pronostici');
  const kpiFantaEl = document.getElementById('res-kpi-fanta');
  const kpiBestRoundEl = document.getElementById('res-kpi-best-round');
  const kpiBestRoundNoteEl = document.getElementById('res-kpi-best-round-note');

  if (kpiPronEl) kpiPronEl.textContent = accPronList.length ? `${accPronAvg.toFixed(1)}%` : '-';
  if (kpiFantaEl) kpiFantaEl.textContent = accFantaList.length ? `${accFantaAvg.toFixed(1)}%` : '-';
  if (kpiBestRoundEl) {
    kpiBestRoundEl.textContent = bestRound ? `Giornata ${bestRound}` : '-';
  }
  if (kpiBestRoundNoteEl && bestRound && bestAcc >= 0) {
    kpiBestRoundNoteEl.textContent = `Giornata ${bestRound} con ${bestAcc.toFixed(1)}% di accuracy pronostici.`;
  }

  // 9. Popolo tabella storico
  const tbody = document.getElementById('results-history-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  rows.sort((a, b) => Number(a['Risultati']) - Number(b['Risultati']))
    .forEach(r => {
      const tr = document.createElement('tr');

      const g = r['Risultati'] || '-';
      const accPron = r['AccuracyPronostici'] || '-';
      const accFanta = r['AccuracyFanta'] || '-';
      const bestMatch = r['MigliorMatch'] || '-';
      const worstMatch = r['PeggiorMatch'] || '-';

      if (String(g) === String(bestRound)) {
        tr.classList.add('results-best-round-row');
      }

      tr.innerHTML = `
        <td>${g}</td>
        <td>${accPron}%</td>
        <td>${accFanta}%</td>
        <td>${bestMatch}</td>
        <td>${worstMatch}</td>
      `;

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
    const conf = row['Confidenza'] || '-';
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
                <p class="pred-modal-subtitle">
                    Giornata ${giornata} · ${orario}
                </p>
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

        ${alt1 || alt2 ? `
        <div class="pred-modal-section">
            <h3>Altri esiti considerati</h3>
            <ul class="pred-prono-alt-list">
                ${alt1 ? `<li>${alt1}</li>` : ''}
                ${alt2 ? `<li>${alt2}</li>` : ''}
            </ul>
        </div>` : ''}

        <div class="pred-modal-section">
            <h3>Motivazione</h3>
            <p>${motivazione}</p>
        </div>
    `;

    modal.classList.add('active');
}

// ===== MODAL CLOSE HANDLER GENERICO =====
document.addEventListener('click', function(e) {
    const newsModal = document.getElementById('news-modal');
    const injuryModal = document.getElementById('infortunio-modal');
    const classificaModal = document.getElementById('classifica-modal');
    const marcatoriModal = document.getElementById('marcatori-modal');
    const infortunatiFullModal = document.getElementById('infortunati-modal');
    const fantaModal = document.getElementById('pred-fanta-modal');
    const pronoModal = document.getElementById('pred-prono-modal');

    if (newsModal && e.target === newsModal) closeNewsModal();
    if (injuryModal && e.target === injuryModal) closeInjuryModal();
    if (classificaModal && e.target === classificaModal) classificaModal.classList.remove('active');
    if (marcatoriModal && e.target === marcatoriModal) marcatoriModal.classList.remove('active');
    if (infortunatiFullModal && e.target === infortunatiFullModal) infortunatiFullModal.classList.remove('active');
    if (fantaModal && e.target === fantaModal) fantaModal.classList.remove('active');
    if (pronoModal && e.target === pronoModal) pronoModal.classList.remove('active');

    if (e.target.classList.contains('modal-close')) {
        if (e.target.closest('#news-modal')) closeNewsModal();
        if (e.target.closest('#infortunio-modal')) closeInjuryModal();
        if (e.target.closest('#classifica-modal')) classificaModal.classList.remove('active');
        if (e.target.closest('#marcatori-modal')) marcatoriModal.classList.remove('active');
        if (e.target.closest('#infortunati-modal')) infortunatiFullModal.classList.remove('active');
        if (e.target.closest('#pred-fanta-modal')) fantaModal.classList.remove('active');
        if (e.target.closest('#pred-prono-modal')) pronoModal.classList.remove('active');
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
  // Slider + navbar + tabs sempre
  initHeroSlider();
  setupMobileNavbar();
  setupDashboardTabs();

  const path = window.location.pathname.toLowerCase();

  // PAGINA PREVISIONI
  if (path.includes('predictions')) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
    await populateAnalisiFantacalcio();
    await populatePronostici();

    const fullClassificaBtn = document.getElementById('open-full-classifica');
    if (fullClassificaBtn) {
      fullClassificaBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await populateFullClassificaModal();
        const modal = document.getElementById('classifica-modal');
        if (modal) modal.classList.add('active');
      });
    }

    const fullMarcatoriBtn = document.getElementById('open-full-marcatori');
    if (fullMarcatoriBtn) {
      fullMarcatoriBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await populateFullMarcatoriModal();
        const modal = document.getElementById('marcatori-modal');
        if (modal) modal.classList.add('active');
      });
    }

    const fullInfortunatiBtn = document.getElementById('open-full-infortunati');
    if (fullInfortunatiBtn) {
      fullInfortunatiBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await populateFullInfortunatiModal();
        const modal = document.getElementById('infortunati-modal');
        if (modal) modal.classList.add('active');
      });
    }

    const fullFantaBtn = document.getElementById('open-full-fanta');
    if (fullFantaBtn) {
      fullFantaBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openFirstFantaMatchInTable();
      });
    }

    const fullPronoBtn = document.getElementById('open-full-prono');
    if (fullPronoBtn) {
      fullPronoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openFirstPronoMatchInTable();
      });
    }

    const heroGiornataEl = document.getElementById('pred-hero-giornata');
    const fantaData = await fetchSheetDataJson(SHEET_NAMES.analisiFantacalcio);
    if (heroGiornataEl && Array.isArray(fantaData) && fantaData.length) {
      const giornate = Array.from(new Set(
        fantaData.map(row => row['Giornata']).filter(g => g !== '')
      )).sort((a, b) => Number(a) - Number(b));
      if (giornate.length) {
        heroGiornataEl.textContent = giornate[giornate.length - 1];
      }
    }
  }

  // HOME
  if (path.endsWith('/') || path.endsWith('/index.html')) {
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
  }

  // PAGINA RISULTATI (track-record.html)
  if (path.includes('track-record') || path.includes('risultati')) {
    await populateRisultatiGiornata();
  }

  console.log('Site initialized');
});










