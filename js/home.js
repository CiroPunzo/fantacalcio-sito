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

  // Live Google Sheets data: FantasyRatings + classifiche Serie A
  const HOME_SHEET_ID = window.PROFANTASY_SHEET_ID || '1ujW6Mth_rdRfsXQCI16cnW5oIg9djjVZnpffPhi7f48';
  const HOME_SHEETS = {
    ratings: 'FantasyRatings',
    ranking: 'Classifica',
    scorers: 'ClassificaMarcatori',
    assists: 'ClassificaAssist'
  };
  const SHEET_CACHE_TTL = 5 * 60 * 1000;

  const normalizeSearch = (value) => String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const normalizeColumn = (value) => normalizeSearch(value).replace(/\s+/g, '_');

  const rowValue = (row, keys, fallback = '') => {
    if (!row) return fallback;
    const normalized = {};
    Object.entries(row).forEach(([key, value]) => { normalized[normalizeColumn(key)] = value; });
    for (const key of keys) {
      const value = normalized[normalizeColumn(key)];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return fallback;
  };

  const toNumber = (value, fallback = NaN) => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
    const cleaned = String(value ?? '')
      .trim()
      .replace(',', '.')
      .replace(/[^0-9.+-]/g, '');
    if (!cleaned || ['+', '-', '.', '+.', '-.'].includes(cleaned)) return fallback;
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0));
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const parseGvizTable = (json) => {
    if (!json?.table) return [];
    const columns = (json.table.cols || []).map((col, index) => String(col.label || col.id || `Col${index + 1}`).trim());
    return (json.table.rows || []).map((row) => {
      const item = {};
      columns.forEach((column, index) => {
        const cell = row.c?.[index];
        item[column] = cell?.f ?? cell?.v ?? '';
      });
      return item;
    }).filter((row) => Object.values(row).some((value) => String(value ?? '').trim() !== ''));
  };

  const cacheKeyFor = (sheetName) => `pf_home_sheet_v2_${normalizeColumn(sheetName)}`;
  const readSheetCache = (sheetName, allowStale = false) => {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKeyFor(sheetName)) || 'null');
      if (!cached?.rows || !Array.isArray(cached.rows)) return null;
      if (!allowStale && Date.now() - Number(cached.savedAt || 0) > SHEET_CACHE_TTL) return null;
      return cached.rows;
    } catch (_) { return null; }
  };
  const saveSheetCache = (sheetName, rows) => {
    try { localStorage.setItem(cacheKeyFor(sheetName), JSON.stringify({ savedAt: Date.now(), rows })); } catch (_) {}
  };

  const fetchSheetRows = (sheetName) => new Promise((resolve, reject) => {
    const freshCache = readSheetCache(sheetName);
    if (freshCache) { resolve(freshCache); return; }

    const callbackName = `__pfHomeSheet_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => {
      cleanup();
      const stale = readSheetCache(sheetName, true);
      if (stale) resolve(stale);
      else reject(new Error(`Timeout Google Sheets: ${sheetName}`));
    }, 15000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
      script.remove();
    };

    window[callbackName] = (json) => {
      cleanup();
      if (json?.status === 'error') {
        const stale = readSheetCache(sheetName, true);
        if (stale) { resolve(stale); return; }
        reject(new Error(json.errors?.[0]?.detailed_message || `Errore Google Sheets: ${sheetName}`));
        return;
      }
      const rows = parseGvizTable(json);
      saveSheetCache(sheetName, rows);
      resolve(rows);
    };

    const tqx = `out:json;responseHandler:${callbackName}`;
    script.src = `https://docs.google.com/spreadsheets/d/${HOME_SHEET_ID}/gviz/tq?tqx=${encodeURIComponent(tqx)}&tq=${encodeURIComponent('select *')}&headers=1&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    script.async = true;
    script.onerror = () => {
      cleanup();
      const stale = readSheetCache(sheetName, true);
      if (stale) resolve(stale);
      else reject(new Error(`Google Sheets non raggiungibile: ${sheetName}`));
    };
    document.head.appendChild(script);
  });

  const radarMetrics = [
    { key: 'fantaindex', label: 'FantaIndex', short: 'FantaIndex' },
    { key: 'titolarita', label: 'Titolarità', short: 'Titolarità' },
    { key: 'bonus', label: 'Bonus', short: 'Bonus' },
    { key: 'rischio', label: 'Rischio', short: 'Rischio' },
    { key: 'impatto_minuti', label: 'Impatto minuti', short: 'Impatto min.' },
    { key: 'bonus_potenziali_totali', label: 'Bonus potenziali totali', short: 'Bonus pot.' }
  ];

  let players = [];
  let playersById = new Map();
  let bonusPotentialScale = 1;
  const selectedPlayers = { one: null, two: null };
  const playerOne = qs('#playerOne');
  const playerTwo = qs('#playerTwo');
  const playerOneSearch = qs('#playerOneSearch');
  const playerTwoSearch = qs('#playerTwoSearch');
  const radarCanvas = qs('#radarCanvas');

  const formatStat = (value) => {
    if (!Number.isFinite(value)) return '—';
    return Math.abs(value - Math.round(value)) < .01 ? String(Math.round(value)) : value.toFixed(1);
  };

  const radarValueFor = (player, metric) => {
    const raw = Number(player?.stats?.[metric.key]);
    if (!Number.isFinite(raw)) return 0;
    if (metric.key === 'bonus_potenziali_totali') return clamp(raw / bonusPotentialScale * 100);
    return clamp(raw);
  };

  const buildPlayers = (rows) => {
    const mapped = rows.map((row, index) => {
      const name = String(rowValue(row, ['player_id', 'player_name', 'giocatore', 'nome_giocatore', 'nome'], '')).trim();
      const team = String(rowValue(row, ['team_id', 'team', 'squadra', 'club'], 'Squadra non indicata')).trim();
      const stats = {};
      radarMetrics.forEach((metric) => { stats[metric.key] = toNumber(rowValue(row, [metric.key], ''), NaN); });
      const hasStats = radarMetrics.some((metric) => Number.isFinite(stats[metric.key]));
      if (!name || !hasStats) return null;
      const baseId = `${normalizeSearch(name).replace(/\s+/g, '-')}-${normalizeSearch(team).replace(/\s+/g, '-')}`;
      return {
        id: `${baseId || 'player'}-${index}`,
        name,
        team,
        stats,
        search: normalizeSearch(`${name} ${team}`)
      };
    }).filter(Boolean);

    const potentialValues = mapped
      .map((player) => player.stats.bonus_potenziali_totali)
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    if (potentialValues.length) {
      const p95Index = Math.min(potentialValues.length - 1, Math.floor((potentialValues.length - 1) * .95));
      bonusPotentialScale = Math.max(1, potentialValues[p95Index]);
    }

    mapped.sort((a, b) => {
      const indexDiff = (Number(b.stats.fantaindex) || 0) - (Number(a.stats.fantaindex) || 0);
      return indexDiff || a.name.localeCompare(b.name, 'it');
    });
    return mapped;
  };

  const initialsFor = (name) => String(name || '')
    .replace(/[^A-Za-zÀ-ÿ0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const renderStats = () => {
    const host = qs('[data-stat-chips]');
    if (!host) return;
    const first = selectedPlayers.one;
    const second = selectedPlayers.two;
    if (!first || !second) {
      host.innerHTML = '<span class="stat-chip-loading">Seleziona due giocatori per confrontare i valori.</span>';
      return;
    }
    host.innerHTML = radarMetrics.map((metric) => `
      <span class="stat-chip-live" title="${escapeHTML(metric.label)}">
        <span class="stat-chip-label">${escapeHTML(metric.label)}</span>
        <b class="stat-chip-value is-a">${escapeHTML(formatStat(first.stats[metric.key]))}</b>
        <b class="stat-chip-value is-b">${escapeHTML(formatStat(second.stats[metric.key]))}</b>
      </span>`).join('');
  };

  const drawRadar = () => {
    if (!radarCanvas) return;
    const first = selectedPlayers.one;
    const second = selectedPlayers.two;
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
    const axes = radarMetrics.length;
    const angle = Math.PI * 2 / axes;

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
      if (level === 5) { ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(41,215,255,.2)'; }
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
      ctx.fillStyle = 'rgba(184,207,235,.76)';
      ctx.font = `${width < 520 ? 8 : 9}px Inter, sans-serif`;
      ctx.textAlign = Math.cos(theta) > .25 ? 'left' : Math.cos(theta) < -.25 ? 'right' : 'center';
      ctx.textBaseline = Math.sin(theta) > .45 ? 'top' : Math.sin(theta) < -.45 ? 'bottom' : 'middle';
      ctx.fillText(radarMetrics[i].short, lx, ly);
    }

    const drawSeries = (player, stroke, fillStart, fillEnd) => {
      if (!player) return;
      const values = radarMetrics.map((metric) => radarValueFor(player, metric));
      const points = values.map((value, index) => {
        const r = radius * value / 100;
        const theta = -Math.PI / 2 + index * angle;
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

    drawSeries(first, '#37e2ff', 'rgba(41,215,255,.22)', 'rgba(41,215,255,.055)');
    drawSeries(second, '#a85bff', 'rgba(159,77,255,.19)', 'rgba(159,77,255,.04)');
    qs('[data-p1-name]')?.replaceChildren(document.createTextNode(first?.name || 'Giocatore 1'));
    qs('[data-p2-name]')?.replaceChildren(document.createTextNode(second?.name || 'Giocatore 2'));
    renderStats();
  };

  const setupPlayerPicker = (slot, input, hidden, resultsHost, statusHost) => {
    if (!input || !hidden || !resultsHost || !statusHost) return;
    let activeIndex = -1;
    let visiblePlayers = [];

    const close = () => {
      resultsHost.classList.remove('is-open');
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    };

    const scoreMatch = (player, query, tokens) => {
      if (!tokens.every((token) => player.search.includes(token))) return 999;
      const name = normalizeSearch(player.name);
      const team = normalizeSearch(player.team);
      if (name === query) return 0;
      if (name.startsWith(query)) return 1;
      if (name.split(' ').some((word) => word.startsWith(query))) return 2;
      if (team.startsWith(query)) return 3;
      return 4;
    };

    const choose = (player) => {
      selectedPlayers[slot] = player;
      hidden.value = player.id;
      input.value = player.name;
      statusHost.textContent = `${player.team} • FantaIndex ${formatStat(player.stats.fantaindex)}`;
      statusHost.classList.remove('is-error');
      close();
      drawRadar();
    };

    const renderResults = (queryValue = input.value) => {
      const query = normalizeSearch(queryValue);
      const tokens = query.split(' ').filter(Boolean);
      visiblePlayers = players
        .map((player) => ({ player, score: query ? scoreMatch(player, query, tokens) : 5 }))
        .filter((item) => item.score < 999)
        .sort((a, b) => a.score - b.score || (Number(b.player.stats.fantaindex) || 0) - (Number(a.player.stats.fantaindex) || 0) || a.player.name.localeCompare(b.player.name, 'it'))
        .slice(0, 12)
        .map((item) => item.player);

      resultsHost.innerHTML = '';
      if (!visiblePlayers.length) {
        resultsHost.innerHTML = '<div class="player-result-empty">Nessun giocatore trovato. Prova con cognome o squadra.</div>';
      } else {
        visiblePlayers.forEach((player, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = `player-result${index === activeIndex ? ' is-active' : ''}`;
          button.setAttribute('role', 'option');
          button.setAttribute('aria-selected', index === activeIndex ? 'true' : 'false');
          button.innerHTML = `
            <span class="player-result-mark">${escapeHTML(initialsFor(player.team) || initialsFor(player.name))}</span>
            <span class="player-result-copy"><strong>${escapeHTML(player.name)}</strong><small>${escapeHTML(player.team)}</small></span>
            <span class="player-result-index">${escapeHTML(formatStat(player.stats.fantaindex))}</span>`;
          button.addEventListener('mousedown', (event) => event.preventDefault());
          button.addEventListener('click', () => choose(player));
          resultsHost.appendChild(button);
        });
      }
      resultsHost.classList.add('is-open');
      input.setAttribute('aria-expanded', 'true');
      if (query) statusHost.textContent = `${visiblePlayers.length} risultati mostrati`;
    };

    input.addEventListener('focus', () => renderResults(input.value === selectedPlayers[slot]?.name ? '' : input.value));
    input.addEventListener('input', () => { activeIndex = -1; renderResults(input.value); });
    input.addEventListener('keydown', (event) => {
      if (!resultsHost.classList.contains('is-open') && ['ArrowDown', 'ArrowUp'].includes(event.key)) renderResults(input.value);
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        activeIndex = Math.min(visiblePlayers.length - 1, activeIndex + 1);
        renderResults(input.value);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = Math.max(0, activeIndex - 1);
        renderResults(input.value);
      } else if (event.key === 'Enter' && activeIndex >= 0 && visiblePlayers[activeIndex]) {
        event.preventDefault(); choose(visiblePlayers[activeIndex]);
      } else if (event.key === 'Escape') {
        close();
      }
    });
    input.addEventListener('blur', () => {
      window.setTimeout(() => {
        close();
        if (selectedPlayers[slot] && input.value.trim() !== selectedPlayers[slot].name) input.value = selectedPlayers[slot].name;
      }, 110);
    });

    return { choose };
  };

  const pickerOne = setupPlayerPicker('one', playerOneSearch, playerOne, qs('#playerOneResults'), qs('[data-player-one-status]'));
  const pickerTwo = setupPlayerPicker('two', playerTwoSearch, playerTwo, qs('#playerTwoResults'), qs('[data-player-two-status]'));

  // Animated orbital background behind the radar.
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

  window.addEventListener('resize', drawRadar);

  // Real standings / scorers / assists from the workbook.
  const boardData = {
    ranking: { kicker: 'Serie A 26/27', title: 'Classifica', unit: 'PT', rows: [], loading: true },
    scorers: { kicker: 'Top player', title: 'Marcatori', unit: 'GOL', rows: [], loading: true },
    assists: { kicker: 'Top player', title: 'Assist', unit: 'AST', rows: [], loading: true }
  };
  let activeBoard = 'ranking';

  const renderBoard = (key, animate = true) => {
    activeBoard = key;
    const data = boardData[key];
    const list = qs('[data-board-list]');
    if (!data || !list) return;
    qsa('[data-board-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.boardTab === key));
    qs('[data-board-kicker]').textContent = data.kicker;
    qs('[data-board-title]').textContent = data.title;

    if (data.loading) {
      list.innerHTML = '<div class="board-loading">Connessione al ProFantasy Sheet…</div>';
      return;
    }
    if (data.error) {
      list.innerHTML = `<div class="board-error">${escapeHTML(data.error)}</div>`;
      return;
    }
    if (!data.rows.length) {
      list.innerHTML = '<div class="board-empty">Nessun dato disponibile nel foglio.</div>';
      return;
    }

    const maxValue = Math.max(...data.rows.map((row) => Number(row.value) || 0), 1);
    if (animate) list.classList.add('is-updating');
    window.setTimeout(() => {
      list.innerHTML = data.rows.map((row) => {
        const progress = Math.max(18, Math.round((Number(row.value) / maxValue) * 100));
        const pos = Number(row.pos) || 0;
        const padded = String(pos || '—').padStart(2, '0');
        return `<div class="board-row board-rank-${pos} is-live">
          <span class="board-position">${escapeHTML(padded)}</span>
          <span class="board-club-mark">${escapeHTML(initialsFor(row.mark || row.name))}</span>
          <span class="board-identity"><strong>${escapeHTML(row.name)}</strong><small>${escapeHTML(row.sub || '')}</small></span>
          <span class="board-metric"><b>${escapeHTML(formatStat(Number(row.value)))}</b><small>${escapeHTML(data.unit)}</small></span>
          <span class="board-progress"><i style="--board-progress:${progress}%"></i></span>
        </div>`;
      }).join('');
      list.classList.remove('is-updating');
    }, animate ? 105 : 0);
  };

  qsa('[data-board-tab]').forEach((button) => button.addEventListener('click', () => renderBoard(button.dataset.boardTab)));
  renderBoard('ranking', false);

  const mapRanking = (rows) => rows.map((row, index) => ({
    pos: toNumber(rowValue(row, ['Posizione', 'Pos', 'Rank', '#'], index + 1), index + 1),
    name: String(rowValue(row, ['Squadra', 'Team', 'Club'], '—')).trim(),
    mark: String(rowValue(row, ['Squadra', 'Team', 'Club'], '')).trim(),
    sub: 'Squadra',
    value: toNumber(rowValue(row, ['Punti', 'Pt', 'Points'], 0), 0)
  })).filter((row) => row.name !== '—').sort((a, b) => a.pos - b.pos || b.value - a.value).slice(0, 5);

  const mapScorers = (rows) => rows.map((row, index) => ({
    pos: toNumber(rowValue(row, ['Posizione', 'Pos', 'Rank', '#'], index + 1), index + 1),
    name: String(rowValue(row, ['Nome Giocatore', 'Giocatore', 'Player', 'Calciatore', 'Nome'], '—')).trim(),
    mark: String(rowValue(row, ['Squadra', 'Club', 'Team'], '')).trim(),
    sub: String(rowValue(row, ['Squadra', 'Club', 'Team'], 'Serie A')).trim(),
    value: toNumber(rowValue(row, ['Gol', 'Goal', 'Goals', 'Reti'], 0), 0)
  })).filter((row) => row.name !== '—').sort((a, b) => a.pos - b.pos || b.value - a.value).slice(0, 5);

  const mapAssists = (rows) => rows.map((row, index) => ({
    pos: toNumber(rowValue(row, ['Posizione', 'Pos', 'Rank', '#'], index + 1), index + 1),
    name: String(rowValue(row, ['Nome Giocatore', 'Giocatore', 'Player', 'Calciatore', 'Nome'], '—')).trim(),
    mark: String(rowValue(row, ['Squadra', 'Club', 'Team'], '')).trim(),
    sub: String(rowValue(row, ['Squadra', 'Club', 'Team'], 'Serie A')).trim(),
    value: toNumber(rowValue(row, ['Assist', 'A', 'Ass', 'Tot Assist', 'N. Assist'], 0), 0)
  })).filter((row) => row.name !== '—').sort((a, b) => a.pos - b.pos || b.value - a.value).slice(0, 5);

  const setBoardResult = (key, result, mapper) => {
    boardData[key].loading = false;
    if (result.status === 'fulfilled') boardData[key].rows = mapper(result.value);
    else boardData[key].error = 'Dati momentaneamente non disponibili.';
    if (activeBoard === key) renderBoard(key, false);
  };

  const initLiveHomeData = async () => {
    const ratingsStatusOne = qs('[data-player-one-status]');
    const ratingsStatusTwo = qs('[data-player-two-status]');
    const [ratingsResult, rankingResult, scorersResult, assistsResult] = await Promise.allSettled([
      fetchSheetRows(HOME_SHEETS.ratings),
      fetchSheetRows(HOME_SHEETS.ranking),
      fetchSheetRows(HOME_SHEETS.scorers),
      fetchSheetRows(HOME_SHEETS.assists)
    ]);

    setBoardResult('ranking', rankingResult, mapRanking);
    setBoardResult('scorers', scorersResult, mapScorers);
    setBoardResult('assists', assistsResult, mapAssists);

    if (ratingsResult.status === 'fulfilled') {
      players = buildPlayers(ratingsResult.value);
      playersById = new Map(players.map((player) => [player.id, player]));
      if (!players.length) throw new Error('FantasyRatings non contiene profili validi.');
      [playerOneSearch, playerTwoSearch].forEach((input) => { if (input) input.disabled = false; });
      const first = players[0];
      const second = players[1] || players[0];
      pickerOne?.choose(first);
      pickerTwo?.choose(second);
      if (ratingsStatusOne) ratingsStatusOne.textContent = `${first.team} • ${players.length} profili disponibili`;
      if (ratingsStatusTwo) ratingsStatusTwo.textContent = `${second.team} • ${players.length} profili disponibili`;
    } else {
      [ratingsStatusOne, ratingsStatusTwo].forEach((status) => {
        if (!status) return;
        status.textContent = 'FantasyRatings non raggiungibile. Verifica la condivisione del foglio.';
        status.classList.add('is-error');
      });
      const chips = qs('[data-stat-chips]');
      if (chips) chips.innerHTML = '<span class="stat-chip-loading">Dati giocatori momentaneamente non disponibili.</span>';
      console.error('ProFantasy FantasyRatings:', ratingsResult.reason);
    }
  };

  initLiveHomeData().catch((error) => {
    console.error('ProFantasy live data:', error);
    [qs('[data-player-one-status]'), qs('[data-player-two-status]')].forEach((status) => {
      if (!status) return;
      status.textContent = error.message || 'Errore nel caricamento dei giocatori.';
      status.classList.add('is-error');
    });
  });


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
