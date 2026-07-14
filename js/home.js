(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobile navigation
  const menuToggle = qs('.menu-toggle');
  const mobilePanel = qs('.mobile-panel');
  const closeMenu = () => {
    if (!menuToggle || !mobilePanel) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    mobilePanel.setAttribute('aria-hidden', 'true');
    mobilePanel.classList.remove('is-open');
    document.body.classList.remove('is-menu-open');
  };
  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') !== 'true';
      menuToggle.setAttribute('aria-expanded', String(open));
      mobilePanel.setAttribute('aria-hidden', String(!open));
      mobilePanel.classList.toggle('is-open', open);
      document.body.classList.toggle('is-menu-open', open);
    });
    qsa('a', mobilePanel).forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 1080) closeMenu(); });
  }

  // Cursor ambient glow
  const cursorGlow = qs('.cursor-glow');
  if (cursorGlow && matchMedia('(pointer:fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  // Reveal animations
  const revealItems = qsa('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // Countdown
  qsa('[data-countdown]').forEach((countdown) => {
    const targetValue = countdown.dataset.countdown || '2026-09-02T00:00:00+02:00';
    const target = new Date(targetValue).getTime();
    const days = qs('[data-days]', countdown);
    const hours = qs('[data-hours]', countdown);
    const minutes = qs('[data-minutes]', countdown);
    const update = () => {
      const difference = Math.max(0, target - Date.now());
      const d = Math.floor(difference / 86400000);
      const h = Math.floor((difference % 86400000) / 3600000);
      const m = Math.floor((difference % 3600000) / 60000);
      if (days) days.textContent = String(d).padStart(2, '0');
      if (hours) hours.textContent = String(h).padStart(2, '0');
      if (minutes) minutes.textContent = String(m).padStart(2, '0');
    };
    update();
    window.setInterval(update, 30000);
  });

  // Mission selector
  const missionCards = qsa('[data-target].mission-card');
  const selectedTitle = qs('[data-selected-title]');
  const selectedDescription = qs('[data-selected-desc]');
  const selectedLink = qs('[data-selected-link]');
  const selectedAction = qs('[data-selected-action]');
  const descriptions = {
    League: 'La porta d’ingresso alla ProFantasy League 26/27, con premi ufficiali già definiti.',
    'Transfer Center': 'La control room dedicata al mercato di Serie A e all’impatto fantacalcistico.',
    'Tools+': 'Comparatore, radar e dati rapidi per prendere decisioni migliori.',
    Community: 'Alert mercato, update League e contenuti veloci nel canale Telegram.'
  };
  missionCards.forEach((card) => {
    card.addEventListener('click', () => {
      missionCards.forEach((item) => item.classList.remove('is-active'));
      card.classList.add('is-active');
      const title = card.dataset.title || card.querySelector('strong')?.textContent || 'ProFantasy';
      const href = card.dataset.target || '#';
      if (selectedTitle) selectedTitle.textContent = title;
      if (selectedDescription) selectedDescription.textContent = descriptions[title] || '';
      if (selectedAction) selectedAction.textContent = card.dataset.action || 'Apri';
      if (selectedLink) selectedLink.href = href;
    });
  });

  // League cards
  const leagueCards = qsa('[data-mode-card]');
  const leagueTitle = qs('[data-league-title]');
  const leagueDescription = qs('[data-league-desc]');
  const leagueData = {
    open: {
      title: 'Torneo Open',
      description: 'Accesso aperto, classifica generale, cinque posizioni premiate e nove Team of the Month con buono digitale.'
    },
    exclusive: {
      title: 'Torneo Exclusive',
      description: 'Champions, Europa, Conference, Challenger, Coppa Italia e Winter Champion: il percorso premium della League.'
    }
  };
  leagueCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      leagueCards.forEach((item) => item.classList.toggle('is-selected', item === card));
      const data = leagueData[card.dataset.mode];
      if (data && leagueTitle && leagueDescription) {
        leagueTitle.textContent = data.title;
        leagueDescription.textContent = data.description;
      }
    });
  });

  // Prize filters and horizontal navigation
  const filterButtons = qsa('[data-prize-filter]');
  const prizeCards = qsa('[data-prize-group]');
  const prizeTrack = qs('[data-prizes-track]');
  const setPrizeFilter = (filter) => {
    filterButtons.forEach((button) => {
      const active = button.dataset.prizeFilter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    prizeCards.forEach((card) => {
      card.hidden = card.dataset.prizeGroup !== filter;
    });
    prizeTrack?.scrollTo({ left: 0, behavior: 'smooth' });
  };
  filterButtons.forEach((button) => button.addEventListener('click', () => setPrizeFilter(button.dataset.prizeFilter)));
  const scrollPrizeTrack = (direction) => {
    if (!prizeTrack) return;
    const card = prizeCards.find((item) => !item.hidden);
    const width = card ? card.getBoundingClientRect().width + 18 : 320;
    prizeTrack.scrollBy({ left: width * direction, behavior: 'smooth' });
  };
  qs('[data-prize-prev]')?.addEventListener('click', () => scrollPrizeTrack(-1));
  qs('[data-prize-next]')?.addEventListener('click', () => scrollPrizeTrack(1));

  // Prize lightbox
  const lightbox = qs('[data-prize-lightbox]');
  const lightboxImage = qs('[data-prize-lightbox-image]');
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-lightbox');
    if (lightboxImage) lightboxImage.src = '';
  };
  qsa('[data-prize-image]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      lightboxImage.src = button.dataset.prizeImage || '';
      lightboxImage.alt = button.dataset.prizeAlt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-lightbox');
    });
  });
  qs('[data-prize-close]')?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });

  // Player comparison radar
  const players = {
    leao: { name: 'Rafael Leão', values: [88, 76, 86, 82, 84, 79] },
    lautaro: { name: 'Lautaro Martínez', values: [93, 79, 94, 89, 92, 88] },
    koopmeiners: { name: 'Teun Koopmeiners', values: [80, 86, 90, 86, 84, 81] },
    kvaratskhelia: { name: 'Khvicha Kvaratskhelia', values: [86, 84, 89, 85, 88, 83] }
  };
  const playerOne = qs('#playerOne');
  const playerTwo = qs('#playerTwo');
  const radarCanvas = qs('#radarCanvas');
  const drawRadar = () => {
    if (!radarCanvas || !playerOne || !playerTwo) return;
    const ctx = radarCanvas.getContext('2d');
    const ratio = window.devicePixelRatio || 1;
    const width = radarCanvas.clientWidth || 620;
    const height = Math.min(440, width * .78);
    radarCanvas.width = width * ratio;
    radarCanvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0,0,width,height);
    const centerX = width / 2;
    const centerY = height / 2 - 5;
    const radius = Math.min(width,height) * .34;
    const axes = 6;
    const angle = (Math.PI * 2) / axes;
    ctx.lineWidth = 1;
    for (let level = 1; level <= 5; level += 1) {
      ctx.beginPath();
      for (let i = 0; i < axes; i += 1) {
        const r = radius * level / 5;
        const x = centerX + Math.cos(-Math.PI/2 + i * angle) * r;
        const y = centerY + Math.sin(-Math.PI/2 + i * angle) * r;
        i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(160,183,220,.16)';
      ctx.stroke();
    }
    for (let i = 0; i < axes; i += 1) {
      ctx.beginPath(); ctx.moveTo(centerX,centerY);
      ctx.lineTo(centerX + Math.cos(-Math.PI/2 + i*angle)*radius, centerY + Math.sin(-Math.PI/2 + i*angle)*radius);
      ctx.strokeStyle = 'rgba(160,183,220,.12)'; ctx.stroke();
    }
    const drawSeries = (values, stroke, fill) => {
      ctx.beginPath();
      values.forEach((value, i) => {
        const r = radius * value / 100;
        const x = centerX + Math.cos(-Math.PI/2 + i*angle)*r;
        const y = centerY + Math.sin(-Math.PI/2 + i*angle)*r;
        i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      });
      ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke();
    };
    const p1 = players[playerOne.value];
    const p2 = players[playerTwo.value];
    drawSeries(p1.values,'#29d7ff','rgba(41,215,255,.16)');
    drawSeries(p2.values,'#9f4dff','rgba(159,77,255,.14)');
    qs('[data-p1-name]')?.replaceChildren(document.createTextNode(p1.name));
    qs('[data-p2-name]')?.replaceChildren(document.createTextNode(p2.name));
  };
  playerOne?.addEventListener('change', drawRadar);
  playerTwo?.addEventListener('change', drawRadar);
  window.addEventListener('resize', drawRadar);
  drawRadar();

  // Data board
  const boardData = {
    ranking: { kicker: 'Serie A', title: 'Classifica', rows: [['1','Inter','92'],['2','Napoli','84'],['3','Milan','79'],['4','Juventus','74'],['5','Roma','70']] },
    scorers: { kicker: 'Top player', title: 'Marcatori', rows: [['1','M. Retegui','25'],['2','M. Thuram','19'],['3','L. Martínez','18'],['4','R. Orsolini','15'],['5','A. Lookman','15']] },
    assists: { kicker: 'Top player', title: 'Assist', rows: [['1','N. Paz','12'],['2','F. Dimarco','11'],['3','C. Pulisic','10'],['4','M. Zaccagni','9'],['5','P. Dybala','9']] }
  };
  const renderBoard = (key) => {
    const data = boardData[key];
    if (!data) return;
    const list = qs('[data-board-list]');
    if (!list) return;
    qs('[data-board-kicker]').textContent = data.kicker;
    qs('[data-board-title]').textContent = data.title;
    list.innerHTML = data.rows.map(([pos,name,value]) => `<div class="board-row"><span>${pos}</span><strong>${name}</strong><b>${value}</b></div>`).join('');
    qsa('[data-board-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.boardTab === key));
  };
  qsa('[data-board-tab]').forEach((button) => button.addEventListener('click', () => renderBoard(button.dataset.boardTab)));
  renderBoard('ranking');

  // Market pulse
  const marketCards = qsa('.market-scan-card');
  let marketIndex = 0;
  if (marketCards.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(() => {
      marketCards.forEach((card, index) => card.classList.toggle('is-active', index === marketIndex));
      marketIndex = (marketIndex + 1) % marketCards.length;
    }, 3200);
  }
})();
