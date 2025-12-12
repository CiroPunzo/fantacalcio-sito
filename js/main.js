// ===== HERO SLIDER =====
let currentHeroSlide = 0;
let autoRotateInterval;

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    
    if (slides.length === 0) return;
    
    slides[0].classList.add('active');
    dots[0].classList.add('active');
    
    autoRotateInterval = setInterval(() => {
        nextHeroSlide();
    }, 5000);
}

function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const totalSlides = slides.length;
    
    if (index >= totalSlides) index = 0;
    if (index < 0) index = totalSlides - 1;
    
    currentHeroSlide = index;
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextHeroSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    currentHeroSlide++;
    if (currentHeroSlide >= slides.length) currentHeroSlide = 0;
    showHeroSlide(currentHeroSlide);
}

function prevHeroSlide() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;
    currentHeroSlide--;
    if (currentHeroSlide < 0) currentHeroSlide = slides.length - 1;
    showHeroSlide(currentHeroSlide);
}

function goToHeroSlide(index) {
    showHeroSlide(index);
    clearInterval(autoRotateInterval);
    autoRotateInterval = setInterval(() => {
        nextHeroSlide();
    }, 5000);
}

// ===== MOBILE NAV =====
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('nav-open');
    }
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
    marcatori: 'Marcatori',
    prezzi: 'FVP',
    infortunati: 'Infortunati'
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
                obj[col] = row.c[idx]?.v ?? '';
            });
            return obj;
        });

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
    'Torino': 'img/loghi/torino.png',
    
};

async function populateClassifica() {
    const data = await fetchSheetDataJson(SHEET_NAMES.classifica);
    const tbody = document.getElementById('classifica-body');
    if (!tbody) return;
    if (!Array.isArray(data) || data.length === 0) return;

    tbody.innerHTML = '';

    // mostriamo solo le prime 10 in preview
    data
        .sort((a, b) => Number(a['Posizione']) - Number(b['Posizione']))
        .slice(0, 10)
        .forEach(row => {
            const tr = document.createElement('tr');

            const pos = Number(row['Posizione']);
            const squadra = row['Squadra'] || '-';

            // ZONA (Champions / EL / Conference / Retrocessione)
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

            // LOGO dalle risorse locali
            const logoUrl = CLUB_LOGOS[squadra] || '';
            const logoHTML = logoUrl
                ? `<div class="logo-cell">
                        <div class="logo-pill">
                            <img src="${logoUrl}" alt="${squadra}">
                        </div>
                   </div>`
                : '-';

            tr.innerHTML = `
                <td>${row['Posizione'] || '-'}</td>
                <td>${zonaHTML}</td>
                <td>${logoHTML}</td>
                <td><strong>${squadra}</strong></td>
                <td>${row['PG'] || '-'}</td>
                <td>${row['xG'] || '-'}</td>
                <td>${row['Punti'] || '-'}</td>
            `;
            tbody.appendChild(tr);
        });

    console.log('Classifica populated', data);
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

            // stessa logica ZONA
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
            const logoHTML = logoUrl
                ? `<div class="logo-cell">
                        <div class="logo-pill">
                            <img src="${logoUrl}" alt="${squadra}">
                        </div>
                   </div>`
                : '-';

            tr.innerHTML = `
                <td>${row['Posizione'] || '-'}</td>
                <td>${zonaHTML}</td>
                <td>${logoHTML}</td>
                <td><strong>${squadra}</strong></td>
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
    if (!tbody) {
        console.warn('Elemento #marcatori-body non trovato');
        return;
    }
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('Nessun dato Marcatori', data);
        return;
    }

    tbody.innerHTML = '';

    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');

        let clubHTML = `${row['Club'] || '-'}`;
        if (row['Logo']) {
            clubHTML = `
                <div class="table-team">
                    <img src="${row['Logo']}" alt="${row['Club']}" class="table-logo">
                    <span>${row['Club'] || '-'}</span>
                </div>
            `;
        }

        tr.innerHTML = `
            <td>${row['Posizione'] || '-'}</td>
            <td><strong>${row['Giocatore'] || '-'}</strong></td>
            <td>${clubHTML}</td>
            <td>${row['Gol'] || '-'}</td>
            <td>${row['xG'] || '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    console.log('Marcatori populated', data);
}

async function populatePrezzi() {
    const data = await fetchSheetDataJson(SHEET_NAMES.prezzi);
    const tbody = document.getElementById('prezzi-body');
    if (!tbody) {
        console.warn('Elemento #prezzi-body non trovato');
        return;
    }
    if (!Array.isArray(data) || data.length === 0) {
        console.warn('Nessun dato Prezzi (FVP)', data);
        return;
    }

    tbody.innerHTML = '';

    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row['Giocatore'] || '-'}</strong></td>
            <td>${row['Ruolo'] || '-'}</td>
            <td>${row['Prezzo Attuale'] || '-'}</td>
            <td>${row['Prezzo Consigliato'] || '-'}</td>
            <td>${row['Nota'] || '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    console.log('Prezzi populated', data);
}

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

    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'clickable';

        let clubHTML = `${row['Club'] || '-'}`;
        if (row['Logo']) {
            clubHTML = `
                <div class="table-team">
                    <img src="${row['Logo']}" alt="${row['Club']}" class="table-logo">
                    <span>${row['Club'] || '-'}</span>
                </div>
            `;
        }

        tr.innerHTML = `
            <td><strong>${row['Giocatore'] || '-'}</strong></td>
            <td>${clubHTML}</td>
            <td>${row['Status'] || '-'}</td>
            <td>${row['Giorni Recupero'] || '-'} gg</td>
        `;

        tr.addEventListener('click', () => openInjuryModal(row));
        tbody.appendChild(tr);
    });

    console.log('Infortunati populated', data);
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

    if (g) g.textContent = data['Giocatore'] || 'N/A';
    if (c) c.textContent = data['Club'] || 'N/A';
    if (s) s.textContent = data['Status'] || 'N/A';
    if (t) t.textContent = data['Tipo Infortunio'] || 'N/A';
    if (r) r.textContent = (data['Giorni Recupero'] || 'N/A') + ' giorni';

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

    if (newsModal && e.target === newsModal) {
        closeNewsModal();
    }

    if (injuryModal && e.target === injuryModal) {
        closeInjuryModal();
    }

    if (e.target.classList.contains('modal-close')) {
        if (e.target.closest('#news-modal')) closeNewsModal();
        if (e.target.closest('#infortunio-modal')) closeInjuryModal();
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function() {
    initHeroSlider();
    setupDashboardTabs();
    await populateClassifica();
    await populateMarcatori();
    await populatePrezzi();
    await populateInfortunati();
    console.log('Site initialized');
});




