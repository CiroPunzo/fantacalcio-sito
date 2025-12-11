// ===== HERO SLIDER - FUNZIONANTE =====
let currentHeroSlide = 0;
let autoRotateInterval;

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    
    if (slides.length === 0) return;
    
    // Mostra la prima slide
    slides[0].classList.add('active');
    dots[0].classList.add('active');
    
    // Auto-rotate ogni 5 secondi
    autoRotateInterval = setInterval(() => {
        nextHeroSlide();
    }, 5000);
}

function showHeroSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    const totalSlides = slides.length;
    
    // Normalizza index
    if (index >= totalSlides) index = 0;
    if (index < 0) index = totalSlides - 1;
    
    currentHeroSlide = index;
    
    // Rimuovi active da tutti
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Aggiungi active al corrente
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextHeroSlide() {
    currentHeroSlide++;
    const slides = document.querySelectorAll('.hero-slide');
    if (currentHeroSlide >= slides.length) currentHeroSlide = 0;
    showHeroSlide(currentHeroSlide);
}

function prevHeroSlide() {
    currentHeroSlide--;
    const slides = document.querySelectorAll('.hero-slide');
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

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (navLinks) {
        navLinks.classList.toggle('nav-open');
    }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    initHeroSlider();
});


// ===== DASHBOARD DATA FETCHING =====

// GOOGLE SHEETS PUBLIC CSV EXPORT URL
// Formula: https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={SHEET_GID}

const SHEETS_CONFIG = {
    classifica: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0',
    marcatori: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=123456789',
    prezzi: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=987654321',
    infortunati: 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=555555555'
};

// Fetch CSV e converti a JSON
async function fetchSheetData(url) {
    try {
        const response = await fetch(url);
        const csv = await response.text();
        return csvToArray(csv);
    } catch (error) {
        console.error('Error fetching sheet:', error);
        return [];
    }
}

// CSV → Array di oggetti
function csvToArray(str) {
    const lines = str.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i].split(',');
        
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentLine[j]?.trim() || '';
        }
        result.push(obj);
    }
    return result;
}

// Popola CLASSIFICA
async function populateClassifica() {
    const data = await fetchSheetData(SHEETS_CONFIG.classifica);
    const tbody = document.getElementById('classifica-body');
    tbody.innerHTML = '';
    
    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['Posizione']}</td>
            <td><strong>${row['Squadra']}</strong></td>
            <td>${row['Punti']}</td>
            <td>${row['Partite']}</td>
            <td>${row['xG']}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Popola MARCATORI
async function populateMarcatori() {
    const data = await fetchSheetData(SHEETS_CONFIG.marcatori);
    const tbody = document.getElementById('marcatori-body');
    tbody.innerHTML = '';
    
    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row['Posizione']}</td>
            <td><strong>${row['Giocatore']}</strong></td>
            <td>${row['Club']}</td>
            <td>${row['Gol']}</td>
            <td>${row['xG']}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Popola INFORTUNATI con POPUP
async function populateInfortunati() {
    const data = await fetchSheetData(SHEETS_CONFIG.infortunati);
    const tbody = document.getElementById('infortunati-body');
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'clickable';
        tr.innerHTML = `
            <td><strong>${row['Giocatore']}</strong></td>
            <td>${row['Club']}</td>
            <td>${row['Status']}</td>
            <td>${row['Giorni Recupero']} gg</td>
        `;
        
        // Click per aprire modal
        tr.addEventListener('click', () => openInjuryModal(row));
        tbody.appendChild(tr);
    });
}

// MODAL Infortunio
function openInjuryModal(data) {
    const modal = document.getElementById('infortunio-modal');
    document.getElementById('modal-giocatore').textContent = data['Giocatore'];
    document.getElementById('modal-club').textContent = data['Club'];
    document.getElementById('modal-status').textContent = data['Status'];
    document.getElementById('modal-infortunio').textContent = data['Tipo Infortunio'];
    document.getElementById('modal-ritorno').textContent = data['Giorni Recupero'] + ' giorni';
    
    modal.classList.add('active');
}

function closeInjuryModal() {
    document.getElementById('infortunio-modal').classList.remove('active');
}

// TAB SWITCHING
function setupDashboardTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            
            // Remove active da tutti
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Aggiungi active al cliccato
            e.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// MODAL CLOSE
document.addEventListener('click', function(e) {
    const modal = document.getElementById('infortunio-modal');
    if (e.target === modal || e.target.classList.contains('modal-close')) {
        closeInjuryModal();
    }
});

// INIT - Carica dati al load
document.addEventListener('DOMContentLoaded', async function() {
    setupDashboardTabs();
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
});


