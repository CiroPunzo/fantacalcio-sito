const root = document.documentElement;

window.addEventListener('pointermove', (event) => {
  root.style.setProperty('--mx', `${event.clientX}px`);
  root.style.setProperty('--my', `${event.clientY}px`);
});

const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.mobile-panel a').forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

const revealItems = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealItems.forEach((item) => observer.observe(item));

function updateCountdown() {
  const el = document.querySelector('[data-countdown]');
  if (!el) return;
  const target = new Date(el.dataset.countdown).getTime();
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const minutes = Math.floor((diff / 60000) % 60);
  el.querySelector('[data-days]').textContent = String(days).padStart(2, '0');
  el.querySelector('[data-hours]').textContent = String(hours).padStart(2, '0');
  el.querySelector('[data-minutes]').textContent = String(minutes).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 30000);

const missionDescriptions = {
  League: 'La porta d’ingresso alla ProFantasy League 26/27.',
  'Transfer Center': 'Controlla acquisti, cessioni, rumors e impatto fantacalcistico.',
  'Tools+': 'Apri comparatori, ranking e strumenti premium per prepararti meglio.',
  Community: 'Unisciti al canale per alert, news e contenuti rapidi.'
};

const missionCards = document.querySelectorAll('.mission-card');
const selectedTitle = document.querySelector('[data-selected-title]');
const selectedDesc = document.querySelector('[data-selected-desc]');
const selectedAction = document.querySelector('[data-selected-action]');
const selectedLink = document.querySelector('[data-selected-link]');

missionCards.forEach((card) => {
  card.addEventListener('click', () => {
    missionCards.forEach((item) => item.classList.remove('is-active'));
    card.classList.add('is-active');

    const title = card.dataset.title;
    const action = card.dataset.action;
    const target = card.dataset.target;

    selectedTitle.textContent = title;
    selectedDesc.textContent = missionDescriptions[title] || 'Seleziona la tua prossima area ProFantasy.';
    selectedAction.textContent = action;
    selectedLink.href = target;
  });
});

const interfaceCard = document.querySelector('.game-interface');
if (interfaceCard) {
  interfaceCard.addEventListener('pointermove', (event) => {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    const rect = interfaceCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    interfaceCard.style.transform = `perspective(1100px) rotateY(${x * 3.5}deg) rotateX(${-y * 3.5}deg)`;
  });
  interfaceCard.addEventListener('pointerleave', () => {
    interfaceCard.style.transform = '';
  });
}


const leagueDescriptions = {
  open: {
    title: 'Torneo Open',
    desc: 'Perfetto per partire subito: aperto a tutti, competitivo, semplice da capire e ideale per far crescere la community.'
  },
  exclusive: {
    title: 'Torneo Exclusive',
    desc: 'Pensato per chi vuole un’esperienza più selezionata: posti limitati, atmosfera premium e competizione più alta.'
  }
};

const leagueCards = document.querySelectorAll('[data-mode-card]');
const leagueTitle = document.querySelector('[data-league-title]');
const leagueDesc = document.querySelector('[data-league-desc]');

leagueCards.forEach((card) => {
  const activateCard = () => {
    leagueCards.forEach((item) => item.classList.remove('is-selected'));
    card.classList.add('is-selected');

    const data = leagueDescriptions[card.dataset.mode];
    if (data && leagueTitle && leagueDesc) {
      leagueTitle.textContent = data.title;
      leagueDesc.textContent = data.desc;
    }
  };

  card.addEventListener('mouseenter', activateCard);
  card.addEventListener('focusin', activateCard);
  card.addEventListener('click', activateCard);
});


const playerData = {
  leao: {
    name: 'Rafael Leão',
    values: [86, 73, 82, 78, 84, 80]
  },
  lautaro: {
    name: 'Lautaro Martínez',
    values: [92, 67, 88, 84, 90, 86]
  },
  koopmeiners: {
    name: 'Teun Koopmeiners',
    values: [78, 82, 87, 85, 79, 83]
  },
  kvaratskhelia: {
    name: 'Khvicha Kvaratskhelia',
    values: [84, 80, 81, 79, 83, 82]
  }
};

const radarLabels = ['Final.', 'Assist', 'Titolarità', 'Media', 'Bonus', 'Forma'];
let radarAnimationId = null;

function drawRadar(progress = 1) {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const cx = width / 2;
  const cy = height / 2 - 10;
  const radius = Math.min(width, height) * 0.34;

  const p1Key = document.getElementById('playerOne')?.value || 'leao';
  const p2Key = document.getElementById('playerTwo')?.value || 'lautaro';
  const p1 = playerData[p1Key];
  const p2 = playerData[p2Key];

  const p1Name = document.querySelector('[data-p1-name]');
  const p2Name = document.querySelector('[data-p2-name]');
  if (p1Name) p1Name.textContent = p1.name;
  if (p2Name) p2Name.textContent = p2.name;

  ctx.clearRect(0, 0, width, height);
  ctx.save();

  const glow = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius * 1.38);
  glow.addColorStop(0, 'rgba(178,92,255,.11)');
  glow.addColorStop(.45, 'rgba(18,231,255,.08)');
  glow.addColorStop(1, 'rgba(18,231,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.34, 0, Math.PI * 2);
  ctx.fill();

  const points = (values, scale = 1) => values.map((value, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / values.length;
    const r = radius * (value / 100) * scale;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  });

  for (let level = 1; level <= 5; level++) {
    const ring = points(new Array(6).fill(level * 20));
    ctx.beginPath();
    ring.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
    ctx.strokeStyle = level === 5 ? 'rgba(178,92,255,.34)' : 'rgba(119,225,255,.14)';
    ctx.lineWidth = level === 5 ? 2 : 1;
    ctx.stroke();
  }

  radarLabels.forEach((label, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / radarLabels.length;
    const x = cx + Math.cos(angle) * (radius + 38);
    const y = cy + Math.sin(angle) * (radius + 38);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.strokeStyle = 'rgba(178,92,255,.13)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'rgba(216,239,255,.82)';
    ctx.font = '800 17px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y);
  });

  function drawShape(values, stroke, fill, dotFill) {
    const polygon = points(values.map((v) => v * progress));
    ctx.beginPath();
    polygon.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 18;
    ctx.shadowColor = stroke;
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    polygon.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = dotFill;
      ctx.fill();
      ctx.strokeStyle = 'rgba(2,8,23,.88)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  drawShape(p1.values, 'rgba(18,231,255,.96)', 'rgba(18,231,255,.16)', 'rgba(18,231,255,.96)');
  drawShape(p2.values, 'rgba(185,92,255,.95)', 'rgba(185,92,255,.15)', 'rgba(185,92,255,.95)');

  ctx.restore();
}

function animateRadar() {
  const wrap = document.querySelector('.radar-wrap');
  wrap?.classList.remove('is-redrawing');
  void wrap?.offsetWidth;
  wrap?.classList.add('is-redrawing');

  if (radarAnimationId) cancelAnimationFrame(radarAnimationId);
  const start = performance.now();
  const duration = 620;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    drawRadar(eased);
    if (t < 1) radarAnimationId = requestAnimationFrame(tick);
  };
  radarAnimationId = requestAnimationFrame(tick);
}

document.getElementById('playerOne')?.addEventListener('change', animateRadar);
document.getElementById('playerTwo')?.addEventListener('change', animateRadar);
animateRadar();


const boardData = {
  ranking: {
    kicker: 'Serie A',
    title: 'Classifica',
    rows: [
      { pos: '01', name: 'Inter', meta: 'Club', value: '0 pt', logo: 'img/loghi/inter.png' },
      { pos: '02', name: 'Napoli', meta: 'Club', value: '0 pt', logo: 'img/loghi/napoli.png' },
      { pos: '03', name: 'Juventus', meta: 'Club', value: '0 pt', logo: 'img/loghi/juventus.png' },
      { pos: '04', name: 'Milan', meta: 'Club', value: '0 pt', logo: 'img/loghi/milan.png' },
      { pos: '05', name: 'Roma', meta: 'Club', value: '0 pt', logo: 'img/loghi/roma.png' }
    ]
  },
  scorers: {
    kicker: 'Top players',
    title: 'Marcatori',
    rows: [
      { pos: '01', name: 'Giocatore A', meta: 'Inter', value: '0 gol', logo: 'img/loghi/inter.png' },
      { pos: '02', name: 'Giocatore B', meta: 'Napoli', value: '0 gol', logo: 'img/loghi/napoli.png' },
      { pos: '03', name: 'Giocatore C', meta: 'Juventus', value: '0 gol', logo: 'img/loghi/juventus.png' },
      { pos: '04', name: 'Giocatore D', meta: 'Milan', value: '0 gol', logo: 'img/loghi/milan.png' },
      { pos: '05', name: 'Giocatore E', meta: 'Roma', value: '0 gol', logo: 'img/loghi/roma.png' }
    ]
  },
  assists: {
    kicker: 'Top players',
    title: 'Assist',
    rows: [
      { pos: '01', name: 'Giocatore A', meta: 'Inter', value: '0 ast', logo: 'img/loghi/inter.png' },
      { pos: '02', name: 'Giocatore B', meta: 'Napoli', value: '0 ast', logo: 'img/loghi/napoli.png' },
      { pos: '03', name: 'Giocatore C', meta: 'Juventus', value: '0 ast', logo: 'img/loghi/juventus.png' },
      { pos: '04', name: 'Giocatore D', meta: 'Milan', value: '0 ast', logo: 'img/loghi/milan.png' },
      { pos: '05', name: 'Giocatore E', meta: 'Roma', value: '0 ast', logo: 'img/loghi/roma.png' }
    ]
  }
};

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeBoardRow(row) {
  if (Array.isArray(row)) {
    return { pos: row[0], name: row[1], value: row[2], meta: row[3] || '', logo: row[4] || '' };
  }

  const name = row?.name || row?.team || row?.club || row?.player || '-';
  const meta = row?.meta || row?.club || row?.team || '';
  const mappedLogo = window.CLUBLOGOS?.[name] || window.CLUBLOGOS?.[meta] || window.CLUB_LOGOS?.[name] || window.CLUB_LOGOS?.[meta] || '';

  return {
    pos: row?.pos || row?.rank || row?.position || '-',
    name,
    meta,
    value: row?.value || row?.points || row?.goals || row?.assists || '-',
    logo: row?.logo || row?.playerLogo || row?.image || row?.img || mappedLogo || ''
  };
}

function initialsFromName(name) {
  return String(name || 'PF')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'PF';
}

function renderBoard(type = 'ranking') {
  const data = boardData[type] || boardData.ranking;
  const kicker = document.querySelector('[data-board-kicker]');
  const title = document.querySelector('[data-board-title]');
  const list = document.querySelector('[data-board-list]');
  const card = document.querySelector('.live-board-card');

  if (kicker) kicker.textContent = data.kicker;
  if (title) title.textContent = data.title;
  if (!list) return;

  card?.classList.remove('is-warping');
  list.classList.remove('is-switching');
  void list.offsetWidth;
  card?.classList.add('is-warping');
  list.classList.add('is-switching');
  window.setTimeout(() => card?.classList.remove('is-warping'), 520);

  list.innerHTML = data.rows.map((rawRow, index) => {
    const row = normalizeBoardRow(rawRow);
    const logo = row.logo;
    const logoHTML = logo
      ? `<img src="${escapeHTML(logo)}" alt="${escapeHTML(row.name)}" loading="lazy" decoding="async" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"><span>${escapeHTML(initialsFromName(row.name))}</span>`
      : `<span>${escapeHTML(initialsFromName(row.name))}</span>`;

    return `
      <div class="board-item" style="--delay:${index * 62}ms">
        <em>${escapeHTML(row.pos)}</em>
        <div class="board-logo">${logoHTML}</div>
        <div class="board-name">
          <strong>${escapeHTML(row.name)}</strong>
          ${row.meta ? `<small>${escapeHTML(row.meta)}</small>` : ''}
        </div>
        <span>${escapeHTML(row.value)}</span>
      </div>
    `;
  }).join('');
}

document.querySelectorAll('[data-board-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.classList.contains('is-active')) return;
    button.classList.add('is-pressed');
    window.setTimeout(() => button.classList.remove('is-pressed'), 260);
    document.querySelectorAll('[data-board-tab]').forEach((item) => item.classList.remove('is-active'));
    button.classList.add('is-active');
    renderBoard(button.dataset.boardTab);
  });
});

renderBoard('ranking');


/* =========================================
   FINAL HOME V11 INTERACTIONS
========================================= */

// Keep mobile menu accessible and aligned with hamburger on the right.
const pfMenuToggle = document.querySelector('.menu-toggle');
const pfMobilePanel = document.getElementById('mobilePanel');

if (pfMenuToggle && pfMobilePanel) {
  const syncMenuState = () => {
    const open = document.body.classList.contains('menu-open');
    pfMenuToggle.setAttribute('aria-expanded', String(open));
    pfMobilePanel.setAttribute('aria-hidden', String(!open));
  };

  pfMenuToggle.addEventListener('click', () => {
    setTimeout(syncMenuState, 0);
  });

  pfMobilePanel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      syncMenuState();
    });
  });

  syncMenuState();
}

// Premium board transition when switching Classifica / Marcatori / Assist.
document.querySelectorAll('[data-board-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    const panel = document.querySelector('.board-panel');
    if (!panel) return;
    panel.classList.remove('is-switching');
    void panel.offsetWidth;
    panel.classList.add('is-switching');
    window.setTimeout(() => panel.classList.remove('is-switching'), 460);
  });
});
