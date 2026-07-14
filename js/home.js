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

  // Player comparison radar + animated orbital background
  const players = {
    leao: { name: 'Rafael Leão', values: [88, 76, 86, 82, 84, 79] },
    lautaro: { name: 'Lautaro Martínez', values: [93, 79, 94, 89, 92, 88] },
    koopmeiners: { name: 'Teun Koopmeiners', values: [80, 86, 90, 86, 84, 81] },
    kvaratskhelia: { name: 'Khvicha Kvaratskhelia', values: [86, 84, 89, 85, 88, 83] }
  };
  const radarLabels = ['Finalizz.', 'Assist', 'Titolarità', 'Media voto', 'Bonus', 'Forma'];
  const playerOne = qs('#playerOne');
  const playerTwo = qs('#playerTwo');
  const radarCanvas = qs('#radarCanvas');

  const drawRadar = () => {
    if (!radarCanvas || !playerOne || !playerTwo) return;
    const ctx = radarCanvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = radarCanvas.clientWidth || 620;
    const height = Math.min(390, Math.max(310, width * .68));
    radarCanvas.width = Math.round(width * ratio);
    radarCanvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 - 1;
    const radius = Math.min(width, height) * .33;
    const axes = radarLabels.length;
    const angle = (Math.PI * 2) / axes;

    // Grid with luminous outer levels.
    for (let level = 1; level <= 5; level += 1) {
      ctx.beginPath();
      for (let i = 0; i < axes; i += 1) {
        const r = radius * level / 5;
        const x = centerX + Math.cos(-Math.PI / 2 + i * angle) * r;
        const y = centerY + Math.sin(-Math.PI / 2 + i * angle) * r;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = level === 5 ? 'rgba(117,205,255,.27)' : `rgba(160,196,235,${.045 + level * .018})`;
      ctx.lineWidth = level === 5 ? 1.35 : 1;
      if (level === 5) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(41,215,255,.2)';
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    for (let i = 0; i < axes; i += 1) {
      const theta = -Math.PI / 2 + i * angle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(theta) * radius, centerY + Math.sin(theta) * radius);
      ctx.strokeStyle = 'rgba(152,190,230,.095)';
      ctx.lineWidth = 1;
      ctx.stroke();

      const labelRadius = radius + (width < 520 ? 20 : 27);
      const lx = centerX + Math.cos(theta) * labelRadius;
      const ly = centerY + Math.sin(theta) * labelRadius;
      ctx.fillStyle = 'rgba(184,207,235,.72)';
      ctx.font = `${width < 520 ? 8 : 9}px Inter, sans-serif`;
      ctx.textAlign = Math.cos(theta) > .25 ? 'left' : Math.cos(theta) < -.25 ? 'right' : 'center';
      ctx.textBaseline = Math.sin(theta) > .45 ? 'top' : Math.sin(theta) < -.45 ? 'bottom' : 'middle';
      ctx.fillText(radarLabels[i], lx, ly);
    }

    const drawSeries = (values, stroke, fillStart, fillEnd) => {
      const points = values.map((value, i) => {
        const r = radius * value / 100;
        const theta = -Math.PI / 2 + i * angle;
        return { x: centerX + Math.cos(theta) * r, y: centerY + Math.sin(theta) * r };
      });
      const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      gradient.addColorStop(0, fillStart);
      gradient.addColorStop(1, fillEnd);
      ctx.beginPath();
      points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.15;
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 14;
      ctx.shadowColor = stroke;
      ctx.stroke();
      ctx.shadowBlur = 0;
      points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ecfbff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = stroke;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    };

    const p1 = players[playerOne.value];
    const p2 = players[playerTwo.value];
    drawSeries(p1.values, '#37e2ff', 'rgba(41,215,255,.22)', 'rgba(41,215,255,.055)');
    drawSeries(p2.values, '#a85bff', 'rgba(159,77,255,.19)', 'rgba(159,77,255,.04)');
    qs('[data-p1-name]')?.replaceChildren(document.createTextNode(p1.name));
    qs('[data-p2-name]')?.replaceChildren(document.createTextNode(p2.name));
  };

  const ambientCanvas = qs('#radarAmbientCanvas');
  if (ambientCanvas) {
    const ambientCtx = ambientCanvas.getContext('2d');
    const ambientHost = ambientCanvas.parentElement;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ambientWidth = 0;
    let ambientHeight = 0;
    let ambientRatio = 1;
    let animationFrame = 0;
    let particles = [];
    let isRadarVisible = true;

    const createParticles = () => {
      const count = ambientWidth < 520 ? 18 : 28;
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * ambientWidth,
        y: Math.random() * ambientHeight,
        size: .6 + Math.random() * 1.8,
        speedX: (Math.random() - .5) * .12,
        speedY: (Math.random() - .5) * .1,
        alpha: .14 + Math.random() * .34,
        hue: index % 3 === 0 ? '159,77,255' : '41,215,255'
      }));
    };

    const resizeAmbient = () => {
      if (!ambientHost) return;
      const rect = ambientHost.getBoundingClientRect();
      ambientWidth = Math.max(1, rect.width);
      ambientHeight = Math.max(1, rect.height);
      ambientRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      ambientCanvas.width = Math.round(ambientWidth * ambientRatio);
      ambientCanvas.height = Math.round(ambientHeight * ambientRatio);
      ambientCtx.setTransform(ambientRatio, 0, 0, ambientRatio, 0, 0);
      createParticles();
    };

    const renderAmbient = (time = 0) => {
      if (!isRadarVisible || document.hidden) {
        if (!reducedMotion) animationFrame = requestAnimationFrame(renderAmbient);
        return;
      }
      ambientCtx.clearRect(0, 0, ambientWidth, ambientHeight);
      const cx = ambientWidth / 2;
      const cy = ambientHeight * .48;
      const base = Math.min(ambientWidth, ambientHeight);

      // Three elliptical orbits and moving light nodes.
      [0, 1, 2].forEach((orbit) => {
        const rx = base * (.29 + orbit * .085);
        const ry = rx * (.43 + orbit * .035);
        const rotation = -.32 + orbit * .34;
        ambientCtx.save();
        ambientCtx.translate(cx, cy);
        ambientCtx.rotate(rotation);
        ambientCtx.beginPath();
        ambientCtx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ambientCtx.strokeStyle = orbit === 1 ? 'rgba(159,77,255,.105)' : 'rgba(41,215,255,.105)';
        ambientCtx.lineWidth = 1;
        ambientCtx.setLineDash([2 + orbit, 8 + orbit * 3]);
        ambientCtx.lineDashOffset = -(time * (.006 + orbit * .002));
        ambientCtx.stroke();
        ambientCtx.setLineDash([]);
        const t = time * (.00032 + orbit * .00009) + orbit * 2.2;
        const dotX = Math.cos(t) * rx;
        const dotY = Math.sin(t) * ry;
        const dotGradient = ambientCtx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 10);
        dotGradient.addColorStop(0, orbit === 1 ? 'rgba(191,132,255,.9)' : 'rgba(127,239,255,.9)');
        dotGradient.addColorStop(1, 'rgba(41,215,255,0)');
        ambientCtx.fillStyle = dotGradient;
        ambientCtx.beginPath();
        ambientCtx.arc(dotX, dotY, 10, 0, Math.PI * 2);
        ambientCtx.fill();
        ambientCtx.restore();
      });

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x < -8) particle.x = ambientWidth + 8;
        if (particle.x > ambientWidth + 8) particle.x = -8;
        if (particle.y < -8) particle.y = ambientHeight + 8;
        if (particle.y > ambientHeight + 8) particle.y = -8;
        const pulse = .72 + Math.sin(time * .0015 + index) * .28;
        ambientCtx.fillStyle = `rgba(${particle.hue},${particle.alpha * pulse})`;
        ambientCtx.beginPath();
        ambientCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ambientCtx.fill();
      });

      if (!reducedMotion) animationFrame = requestAnimationFrame(renderAmbient);
    };

    resizeAmbient();
    if (!reducedMotion) animationFrame = requestAnimationFrame(renderAmbient);
    else renderAmbient(0);
    window.addEventListener('resize', resizeAmbient);
    if ('IntersectionObserver' in window && ambientHost) {
      new IntersectionObserver(([entry]) => { isRadarVisible = entry.isIntersecting; }, { rootMargin: '150px' }).observe(ambientHost);
    }
    window.addEventListener('beforeunload', () => cancelAnimationFrame(animationFrame), { once: true });
  }

  playerOne?.addEventListener('change', drawRadar);
  playerTwo?.addEventListener('change', drawRadar);
  window.addEventListener('resize', drawRadar);
  drawRadar();

  // Data board
  const boardData = {
    ranking: {
      kicker: 'Serie A 26/27', title: 'Classifica', unit: 'PT', rowLabel: 'Squadra',
      rows: [['1','Inter','92'],['2','Napoli','84'],['3','Milan','79'],['4','Juventus','74'],['5','Roma','70']]
    },
    scorers: {
      kicker: 'Top player', title: 'Marcatori', unit: 'GOL', rowLabel: 'Bomber',
      rows: [['1','M. Retegui','25'],['2','M. Thuram','19'],['3','L. Martínez','18'],['4','R. Orsolini','15'],['5','A. Lookman','15']]
    },
    assists: {
      kicker: 'Top player', title: 'Assist', unit: 'AST', rowLabel: 'Assistman',
      rows: [['1','N. Paz','12'],['2','F. Dimarco','11'],['3','C. Pulisic','10'],['4','M. Zaccagni','9'],['5','P. Dybala','9']]
    }
  };
  const initialsFor = (name) => name
    .replace(/[^A-Za-zÀ-ÿ0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const renderBoard = (key) => {
    const data = boardData[key];
    if (!data) return;
    const list = qs('[data-board-list]');
    if (!list) return;
    const maxValue = Math.max(...data.rows.map((row) => Number(row[2]) || 0), 1);
    list.classList.add('is-updating');
    window.setTimeout(() => {
      qs('[data-board-kicker]').textContent = data.kicker;
      qs('[data-board-title]').textContent = data.title;
      list.innerHTML = data.rows.map(([pos, name, value]) => {
        const progress = Math.max(18, Math.round((Number(value) / maxValue) * 100));
        const padded = String(pos).padStart(2, '0');
        return `<div class="board-row board-rank-${pos}">
          <span class="board-position">${padded}</span>
          <span class="board-club-mark">${initialsFor(name)}</span>
          <span class="board-identity"><strong>${name}</strong><small>${data.rowLabel}</small></span>
          <span class="board-metric"><b>${value}</b><small>${data.unit}</small></span>
          <span class="board-progress"><i style="--board-progress:${progress}%"></i></span>
        </div>`;
      }).join('');
      list.classList.remove('is-updating');
    }, 105);
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
