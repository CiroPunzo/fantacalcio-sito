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


// ===== DASHBOARD DATA - GOOGLE SHEETS API =====

// FORMAT: https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={SHEET_NAME}

const SHEET_ID = '1ujW6Mth_rdRfsXQCI16cnW5oIg9djjVZnpffPhi7f48'; // Uno solo

const SHEET_NAMES = {
    classifica: 'Classifica',
    marcatori: 'Marcatori',
    prezzi: 'Prezzi Consigliati', // Nota: il tuo sheet si chiama "FVP" non "Prezzi"
    infortunati: 'Infortunati'
};


// Fetch data da Google Sheets
async function fetchSheetDataJson(sheetName) {
    try {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
        const response = await fetch(url);
        const text = await response.text();
        
        // Parse Google Visualization API response
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const json = JSON.parse(jsonString);
        
        // Converti in array di oggetti
        const cols = json.table.cols.map(col => col.label);
        const rows = json.table.rows.map(row => {
            const obj = {};
            cols.forEach((col, idx) => {
                obj[col] = row.c[idx]?.v || '';
            });
            return obj;
        });
        
        return rows;
    } catch (error) {
        console.error('Error fetching sheet:', error);
        return [];
    }
}

// Popola CLASSIFICA con LOGHI
async function populateClassifica() {
    const data = await fetchSheetDataJson(SHEET_NAMES.classifica);
    const tbody = document.getElementById('classifica-body');
    
    if (!tbody || data.length === 0) {
        console.log('Classifica data:', data);
        return;
    }
    
    tbody.innerHTML = '';
    
    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');
        
        // Se hai colonna "Logo", mostra logo + squadra insieme
        let squadraHTML = `<strong>${row['Squadra'] || '-'}</strong>`;
        if (row['Logo']) {
            squadraHTML = `
                <div class="table-team">
                    <img src="${row['Logo']}" alt="${row['Squadra']}" class="table-logo">
                    <strong>${row['Squadra'] || '-'}</strong>
                </div>
            `;
        }
        
        tr.innerHTML = `
            <td>${row['Posizione'] || '-'}</td>
            <td>${squadraHTML}</td>
            <td>${row['Punti'] || '-'}</td>
            <td>${row['Partite'] || '-'}</td>
            <td>${row['xG'] || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
    
    console.log('Classifica populated');
}

// Popola MARCATORI con LOGHI
async function populateMarcatori() {
    const data = await fetchSheetDataJson(SHEET_NAMES.marcatori);
    const tbody = document.getElementById('marcatori-body');
    
    if (!tbody || data.length === 0) {
        console.log('Marcatori data:', data);
        return;
    }
    
    tbody.innerHTML = '';
    
    data.slice(0, 10).forEach(row => {
        const tr = document.createElement('tr');
        
        // Se hai colonna "Logo", mostra logo + club insieme
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
    
    console.log('Marcatori populated');
}

// Popola INFORTUNATI con LOGHI (opzionale)
async function populateInfortunati() {
    const data = await fetchSheetDataJson(SHEET_NAMES.infortunati);
    const tbody = document.getElementById('infortunati-body');
    
    if (!tbody || data.length === 0) {
        console.log('Infortunati data:', data);
        return;
    }
    
    tbody.innerHTML = '';
    
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'clickable';
        
        // Se hai colonna "Logo"
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
    
    console.log('Infortunati populated');
}

// MODAL Infortunio
function openInjuryModal(data) {
    const modal = document.getElementById('infortunio-modal');
    document.getElementById('modal-giocatore').textContent = data['Giocatore'] || 'N/A';
    document.getElementById('modal-club').textContent = data['Club'] || 'N/A';
    document.getElementById('modal-status').textContent = data['Status'] || 'N/A';
    document.getElementById('modal-infortunio').textContent = data['Tipo Infortunio'] || 'N/A';
    document.getElementById('modal-ritorno').textContent = (data['Giorni Recupero'] || 'N/A') + ' giorni';
    
    modal.classList.add('active');
}

function closeInjuryModal() {
    const modal = document.getElementById('infortunio-modal');
    if (modal) modal.classList.remove('active');
}

// TAB SWITCHING
function setupDashboardTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            e.target.classList.add('active');
            const tabContent = document.getElementById(tabName);
            if (tabContent) tabContent.classList.add('active');
        });
    });
}

// MODAL CLOSE
document.addEventListener('click', function(e) {
    const modal = document.getElementById('infortunio-modal');
    if (!modal) return;
    
    if (e.target === modal || e.target.classList.contains('modal-close')) {
        closeInjuryModal();
    }
});

// INIT
document.addEventListener('DOMContentLoaded', async function() {
    setupDashboardTabs();
    await populateClassifica();
    await populateMarcatori();
    await populateInfortunati();
    
    // Debug: apri console (F12) e vedi se dice "populated"
    console.log('Dashboard initialized');
});


