(function () {
  const teams = [
    { id: 'napoli', name: 'Napoli', short: 'NAP', status: 'Monitorare', attack: 82, mid: 80, def: 78, focus: 'Il Napoli alza il livello fisico e tecnico: occhio a minuti, gerarchie offensive e possibili variazioni sui rigoristi.' },
    { id: 'inter', name: 'Inter', short: 'INT', status: 'Solida', attack: 86, mid: 88, def: 84, focus: 'Rosa profonda e struttura stabile: il mercato incide soprattutto su rotazioni e prezzo d’asta dei comprimari.' },
    { id: 'milan', name: 'Milan', short: 'MIL', status: 'In evoluzione', attack: 80, mid: 77, def: 73, focus: 'Squadra da monitorare: ogni innesto può cambiare ruoli, titolarità e gestione dei bonus.' },
    { id: 'juventus', name: 'Juventus', short: 'JUV', status: 'Alta attenzione', attack: 79, mid: 76, def: 81, focus: 'Il valore fantasy dipende molto da modulo, gerarchie offensive e continuità dei titolari.' },
    { id: 'atalanta', name: 'Atalanta', short: 'ATA', status: 'Bonus hub', attack: 84, mid: 81, def: 74, focus: 'Ambiente storicamente favorevole ai bonus: priorità a titolarità reale e adattamento tattico.' },
    { id: 'roma', name: 'Roma', short: 'ROM', status: 'Da seguire', attack: 78, mid: 75, def: 76, focus: 'Tanti valori dipendono dalla costruzione della rosa: occhio a esterni, punte e piazzati.' },
    { id: 'lazio', name: 'Lazio', short: 'LAZ', status: 'Equilibrio', attack: 76, mid: 78, def: 75, focus: 'Profilo utile per cercare slot medi: attenzione a turnover e gerarchie dei calci piazzati.' },
    { id: 'fiorentina', name: 'Fiorentina', short: 'FIO', status: 'Variabile', attack: 77, mid: 79, def: 72, focus: 'Molti giocatori possono oscillare: il FantaIndex aiuta a evitare hype eccessivo.' },
    { id: 'bologna', name: 'Bologna', short: 'BOL', status: 'Occhio', attack: 75, mid: 78, def: 77, focus: 'Squadra interessante per titolarità e crescita: valutare bene prezzo e concorrenza.' },
    { id: 'torino', name: 'Torino', short: 'TOR', status: 'Fisica', attack: 71, mid: 73, def: 78, focus: 'Difesa e minutaggio possono offrire valore: attacco da analizzare in base agli arrivi.' },
    { id: 'genoa', name: 'Genoa', short: 'GEN', status: 'Scommesse', attack: 72, mid: 70, def: 73, focus: 'Mercato ideale per trovare slot bassi, ma serve attenzione su titolarità e calendario.' },
    { id: 'sassuolo', name: 'Sassuolo', short: 'SAS', status: 'Bonus risk', attack: 74, mid: 71, def: 67, focus: 'Possibile fonte bonus, ma con rischio difensivo e volatilità di rendimento.' },
    { id: 'udinese', name: 'Udinese', short: 'UDI', status: 'Fisicità', attack: 70, mid: 72, def: 74, focus: 'Da valutare profili atletici e titolari low-cost: non farsi ingannare solo dal nome.' },
    { id: 'verona', name: 'Verona', short: 'VER', status: 'Low cost', attack: 68, mid: 69, def: 70, focus: 'Area perfetta per scommesse a basso prezzo: priorità al minutaggio previsto.' },
    { id: 'empoli', name: 'Empoli', short: 'EMP', status: 'Sviluppo', attack: 67, mid: 69, def: 68, focus: 'Giovani e occasioni: il valore cresce se il ruolo è stabile e il prezzo resta basso.' },
    { id: 'monza', name: 'Monza', short: 'MON', status: 'Rotazioni', attack: 70, mid: 72, def: 71, focus: 'Attenzione alla gestione delle rotazioni: buoni slot se il ruolo è chiaro.' },
    { id: 'lecce', name: 'Lecce', short: 'LEC', status: 'Budget', attack: 66, mid: 68, def: 67, focus: 'Qui si cercano titolari economici e possibili sorprese: evitare prezzi gonfiati.' },
    { id: 'cagliari', name: 'Cagliari', short: 'CAG', status: 'Lotta', attack: 67, mid: 68, def: 69, focus: 'Profilo da gestione: scegliere giocatori con minutaggio sicuro e bonus sostenibile.' },
    { id: 'parma', name: 'Parma', short: 'PAR', status: 'New entry', attack: 69, mid: 67, def: 66, focus: 'Da analizzare dopo i primi innesti: possibile terreno fertile per scommesse.' },
    { id: 'venezia', name: 'Venezia', short: 'VEN', status: 'New entry', attack: 66, mid: 66, def: 65, focus: 'Valore legato a titolarità e responsabilità offensive: monitorare rigoristi e piazzati.' }
  ];

  const PROFANTASY_DEFAULT_TEAMS = teams.map(team => ({ ...team }));

  const marketData = {
    napoli: {
      'official-in': [
        player('Scott McTominay', 'Manchester United', '32.0 mln', 'C', 77, 'Centrocampista'),
        player('Romelu Lukaku', 'Chelsea', '30.0 mln', 'A', 84, 'Attaccante'),
        player('Alessandro Buongiorno', 'Torino', '35.0 mln', 'D', 74, 'Difensore'),
        player('Billy Gilmour', 'Brighton', '14.0 mln', 'C', 69, 'Centrocampista')
      ],
      'official-out': [
        player('Piotr Zielinski', 'Inter', 'Parametro zero', 'C', 73, 'Centrocampista'),
        player('Jesper Lindstrom', 'Everton', 'Prestito', 'C', 65, 'Trequartista')
      ],
      rumor: [
        player('Jonathan David', 'Lille', '40%', 'A', 81, 'Valore mercato 50 mln'),
        player('Federico Chiesa', 'Juventus', '28%', 'A', 76, 'Valore mercato 25 mln')
      ],
      loan: [
        player('Natan', 'Real Betis', 'Prestito', 'D', 63, 'Difensore'),
        player('Gianluca Gaetano', 'Cagliari', 'Prestito', 'C', 68, 'Centrocampista')
      ],
      roster: [
        player('Alex Meret', 'Napoli', 'Rosa', 'P', 72, 'Portiere'),
        player('Giovanni Di Lorenzo', 'Napoli', 'Rosa', 'D', 78, 'Difensore'),
        player('Stanislav Lobotka', 'Napoli', 'Rosa', 'C', 74, 'Centrocampista'),
        player('Khvicha Kvaratskhelia', 'Napoli', 'Rosa', 'A', 88, 'Attaccante')
      ],
      impact: [
        player('Sale valore: Lukaku', 'Napoli', '+11 FantaIndex', 'A', 84, 'Più centralità offensiva'),
        player('Sale valore: McTominay', 'Napoli', '+8 FantaIndex', 'C', 77, 'Inserimenti e titolarità'),
        player('Da monitorare: Raspadori', 'Napoli', '-6 FantaIndex', 'A', 68, 'Minuti da verificare')
      ]
    }
  };

  const fallbackData = {
    'official-in': [player('Nuovo acquisto', 'Squadra provenienza', 'Da inserire', 'C', 70, 'Ruolo placeholder')],
    'official-out': [player('Giocatore ceduto', 'Squadra arrivo', 'Da inserire', 'D', 68, 'Ruolo placeholder')],
    rumor: [player('Rumor mercato', 'Club interessato', 'Percentuale arrivo', 'A', 72, 'Valore mercato')],
    loan: [player('Giocatore in prestito', 'Destinazione', 'Formula', 'C', 65, 'Dettagli prestito')],
    roster: [player('Giocatore rosa', 'Squadra', 'Rosa attuale', 'D', 71, 'Scheda giocatore')],
    impact: [player('Impatto Fantasy', 'Analisi ProFantasy', 'Trend', 'C', 75, 'Nota editoriale')]
  };

  const trends = [
    ['Samuel Ricci', 'Torino', '+12'],
    ['Nico Paz', 'Como', '+9'],
    ['Lorenzo Lucca', 'Udinese', '+8'],
    ['Kamaldeen Sulemana', 'Cagliari', '+7'],
    ['Matias Soulé', 'Roma', '+6']
  ];

  const topIndexFallback = [
    { name: 'Giocatore Top 1', role: 'A', index: 86, team: 'Squadra', image: 'img/database/player1.png' },
    { name: 'Giocatore Top 2', role: 'C', index: 82, team: 'Squadra', image: 'img/database/player2.png' },
    { name: 'Giocatore Top 3', role: 'D', index: 78, team: 'Squadra', image: 'img/database/player3.png' }
  ];

  const topIndexData = {
    napoli: [
      { name: 'Romelu Lukaku', role: 'A', index: 84, team: 'Napoli', image: 'img/database/romelu-lukaku.png' },
      { name: 'Scott McTominay', role: 'C', index: 77, team: 'Napoli', image: 'img/database/scott-mctominay.png' },
      { name: 'Alessandro Buongiorno', role: 'D', index: 74, team: 'Napoli', image: 'img/database/alessandro-buongiorno.png' }
    ]
  };


  const PROFANTASY_TRANSFERS_SHEET_ID = window.PROFANTASY_SHEET_ID || "1ujW6Mth_rdRfsXQCI16cnW5oIg9djjVZnpffPhi7f48";

  const TRANSFERS_SHEET_NAMES = {
    teams: 'Teams',
    playersMaster: 'PlayersMaster',
    movements: 'Movements',
    ratings: 'FantasyRatings',
    rosters: 'Rosters',
    players: 'Database2027',
    trends: 'TransfersTrends',
    topIndex: 'TransfersTopIndex',
    composition: 'TransfersComposition',
    meta: 'TransfersMeta'
  };

  const TRANSFERS_SHEET_ALIASES = {
    teams: ['Teams', 'TransfersTeams', 'TransferTeams', 'transfers_teams', 'Transfers_Teams', 'Transfers Teams', 'Squadre', 'TransfersSquadre'],
    playersMaster: ['PlayersMaster', 'Players_Master', 'Players Master', 'AnagraficaGiocatori', 'Anagrafica Giocatori', 'GiocatoriMaster', 'Giocatori Master'],
    movements: ['Movements', 'MarketMovements', 'Market_Movements', 'Movimenti', 'MovimentiMercato', 'Movimenti Mercato', 'TransfersMovements'],
    ratings: ['FantasyRatings', 'Fantasy_Ratings', 'Fantasy Ratings', 'Ratings', 'ValoriFantasy', 'Valori Fantasy', 'ProFantasyRatings'],
    rosters: ['Rosters', 'Rose', 'Rosa', 'RosaAttuale', 'Rosa Attuale', 'TeamRosters', 'Team Rosters'],
    players: ['Database2027', 'TransfersPlayers', 'TransferPlayers', 'transfers_players', 'Transfers_Players', 'Transfers Players', 'Players', 'Giocatori', 'Trasferimenti', 'Mercato'],
    trends: ['TransfersTrends', 'TransferTrends', 'transfers_trends', 'Transfers_Trends', 'Transfers Trends', 'Trends', 'Trend', 'TopSalita', 'Top Salita'],
    topIndex: ['TransfersTopIndex', 'TransferTopIndex', 'transfers_top_index', 'Transfers_Top_Index', 'Transfers Top Index', 'TopIndex', 'Top Index', 'FantaIndex'],
    composition: ['TransfersComposition', 'TransferComposition', 'transfers_composition', 'Transfers_Composition', 'Transfers Composition', 'Composition', 'Composizione'],
    meta: ['TransfersMeta', 'TransferMeta', 'transfers_meta', 'Transfers_Meta', 'Transfers Meta', 'Meta', 'Config']
  };

  const USE_TRANSFERS_PLACEHOLDERS = window.PROFANTASY_USE_TRANSFER_PLACEHOLDERS === true;
  let transfersSheetsLoaded = false;
  let transfersSheetDebug = {};

  function normalizeKey(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
  }

  function rowValue(row, keys, fallback = '') {
    if (!row) return fallback;
    const wanted = Array.isArray(keys) ? keys : [keys];
    const normalized = {};
    Object.keys(row).forEach((key) => {
      normalized[normalizeKey(key)] = row[key];
    });
    for (const key of wanted) {
      const value = normalized[normalizeKey(key)];
      if (value !== undefined && value !== null && String(value).trim() !== '') return value;
    }
    return fallback;
  }

  function isActiveRow(row) {
    const value = String(rowValue(row, ['is_active', 'active', 'attivo'], 'TRUE')).trim().toLowerCase();
    return !['false', 'no', '0', 'non attivo', 'inactive'].includes(value);
  }

  function cleanSheetText(value) {
    return String(value ?? '').trim();
  }

  function isPlaceholderValue(value) {
    const text = cleanSheetText(value).toLowerCase();
    return [
      '',
      '-',
      '—',
      'da aggiornare',
      'placeholder',
      'giocatore',
      'nome giocatore',
      'player',
      'player name',
      'inserisci giocatore',
      'inserire giocatore',
      'n/d',
      'nd',
      'null'
    ].includes(text);
  }

  function rowHasRealValue(row, keys) {
    const value = rowValue(row, keys, '');
    return !isPlaceholderValue(value);
  }

  function isValidTeamRow(row) {
    if (!row || !isActiveRow(row)) return false;
    const id = cleanSheetText(rowValue(row, ['team_id', 'id', 'slug', 'squadra_id', 'team'], ''));
    const name = cleanSheetText(rowValue(row, ['team_name', 'name', 'nome', 'squadra', 'club', 'team'], ''));
    const short = cleanSheetText(rowValue(row, ['short_name', 'short', 'code', 'abbr', 'sigla'], ''));
    return Boolean(id || name || short);
  }

  function isValidPlayerRow(row) {
    if (!isActiveRow(row)) return false;

    const playerName = rowValue(row, ['player_name', 'name', 'nome_giocatore', 'giocatore', 'calciatore', 'nome'], '');
    const teamId = rowValue(row, ['team_id', 'team', 'squadra_id', 'squadra'], '');
    const section = rowValue(row, ['section', 'type', 'categoria', 'tab', 'sezione', 'tipo'], '');

    return !isPlaceholderValue(playerName) && !isPlaceholderValue(teamId) && !isPlaceholderValue(section);
  }

  function isValidTrendRow(row) {
    if (!isActiveRow(row)) return false;
    return rowHasRealValue(row, ['player_name', 'name', 'nome_giocatore', 'giocatore', 'calciatore', 'nome']);
  }

  function isValidTopIndexRow(row) {
    if (!isActiveRow(row)) return false;
    return rowHasRealValue(row, ['player_name', 'name', 'nome_giocatore', 'giocatore', 'calciatore', 'nome']) &&
      rowHasRealValue(row, ['team_id', 'team', 'squadra_id', 'squadra']);
  }

  function isValidCompositionRow(row) {
    if (!isActiveRow(row)) return false;
    return rowHasRealValue(row, ['team_id', 'team', 'squadra_id', 'squadra']);
  }

  function normalizeSection(value) {
    const raw = cleanSheetText(value);
    const key = normalizeKey(raw);

    const aliases = {
      acquisti: 'official-in',
      acquisto: 'official-in',
      acquisti_ufficiali: 'official-in',
      acquisto_ufficiale: 'official-in',
      official_in: 'official-in',
      officialin: 'official-in',
      official_in_transfer: 'official-in',
      official_in_transfers: 'official-in',
      entrata: 'official-in',
      entrate: 'official-in',
      in: 'official-in',
      incoming: 'official-in',
      incoming_transfer: 'official-in',
      incoming_transfers: 'official-in',

      cessioni: 'official-out',
      cessione: 'official-out',
      cessioni_ufficiali: 'official-out',
      cessione_ufficiale: 'official-out',
      official_out: 'official-out',
      officialout: 'official-out',
      official_out_transfer: 'official-out',
      official_out_transfers: 'official-out',
      uscita: 'official-out',
      uscite: 'official-out',
      out: 'official-out',
      outgoing: 'official-out',
      outgoing_transfer: 'official-out',
      outgoing_transfers: 'official-out',

      rumors: 'rumor',
      rumor: 'rumor',
      trattativa: 'rumor',
      trattative: 'rumor',

      prestiti: 'loan',
      prestito: 'loan',
      loan: 'loan',

      rosa: 'roster',
      roster: 'roster',

      impatto: 'impact',
      impatto_fantasy: 'impact',
      impact: 'impact'
    };

    return aliases[key] || raw || 'official-in';
  }

  function toNumber(value, fallback = 0) {
    const raw = String(value ?? '').trim();
    if (!raw || /^[-–—]+$/.test(raw)) return fallback;
    const cleaned = raw.replace(',', '.').replace(/[^0-9.+-]/g, '');
    if (!cleaned || cleaned === '+' || cleaned === '-' || cleaned === '.' || cleaned === '+.' || cleaned === '-.') return fallback;
    const numeric = Number(cleaned);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function slugify(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function parseGvizTable(json) {
    if (!json || !json.table) return [];

    const cols = (json.table.cols || []).map((col, index) => {
      const label = String(col.label || col.id || `Col${index + 1}`).trim();
      return label || `Col${index + 1}`;
    });

    const rows = (json.table.rows || []).map((row) => {
      const obj = {};
      cols.forEach((col, index) => {
        const cell = row.c?.[index];
        obj[col] = cell?.f ?? cell?.v ?? '';
      });
      return obj;
    }).filter((row) => Object.values(row).some(value => String(value ?? '').trim() !== ''));

    rows.cols = cols;
    rows.rawRows = json.table.rows?.length || 0;
    rows.rawStatus = json.status || 'ok';
    return rows;
  }

  function fetchGvizJsonp(sheetName) {
    return new Promise((resolve, reject) => {
      const callbackName = `__pfTransfersGviz_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const script = document.createElement('script');
      const timeoutMs = 12000;

      const cleanup = () => {
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
        script.remove();
      };

      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error(`Timeout Google Sheets: ${sheetName}`));
      }, timeoutMs);

      window[callbackName] = (json) => {
        window.clearTimeout(timer);
        cleanup();

        if (json?.status === 'error') {
          const message = json.errors?.map(error => error.detailed_message || error.message).join(' | ') || 'Errore Google Sheets';
          reject(new Error(message));
          return;
        }

        const parsed = parseGvizTable(json);
        parsed.sheetName = sheetName;
        resolve(parsed);
      };

      const tqx = `out:json;responseHandler:${callbackName}`;
      const tq = 'select *';
      script.src = `https://docs.google.com/spreadsheets/d/${PROFANTASY_TRANSFERS_SHEET_ID}/gviz/tq?tqx=${encodeURIComponent(tqx)}&tq=${encodeURIComponent(tq)}&headers=1&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timer);
        cleanup();
        reject(new Error(`Script Google Sheets non caricato: ${sheetName}`));
      };

      document.head.appendChild(script);
    });
  }

  async function fetchTransferSheetRows(sheetName) {
    return await fetchGvizJsonp(sheetName);
  }

  function sheetNameCandidates(keyOrName, configuredName) {
    const names = [];
    const add = (name) => {
      if (!name) return;
      const value = String(name).trim();
      if (value && !names.includes(value)) names.push(value);
    };

    add(configuredName);
    add(keyOrName);

    const aliases = TRANSFERS_SHEET_ALIASES[keyOrName] || [];
    aliases.forEach(add);

    return names;
  }

  async function fetchOptionalTransferSheet(keyOrName, configuredName) {
    const candidates = sheetNameCandidates(keyOrName, configuredName);
    const attempts = [];

    for (const candidate of candidates) {
      try {
        const rows = await fetchTransferSheetRows(candidate);
        attempts.push({
          sheet: candidate,
          rows: Array.isArray(rows) ? rows.length : 0,
          cols: rows?.cols || [],
          rawRows: rows?.rawRows || 0,
          status: rows?.rawStatus || 'unknown',
          firstRows: Array.isArray(rows) ? rows.slice(0, 2) : []
        });

        if (Array.isArray(rows) && rows.length) {
          transfersSheetDebug[keyOrName] = {
            sheet: candidate,
            rows: rows.length,
            cols: rows.cols || [],
            rawRows: rows.rawRows || rows.length,
            status: 'loaded',
            firstRows: rows.slice(0, 2)
          };
          return rows;
        }
      } catch (error) {
        attempts.push({ sheet: candidate, error: error?.message || String(error) });
      }
    }

    transfersSheetDebug[keyOrName] = { status: 'empty_or_missing', attempts };
    console.warn(`ProFantasy Transfers: nessun dato trovato per ${keyOrName}. Tentativi:`, attempts);
    return [];
  }

  function mapTeamRow(row, fallbackOrder = 0) {
    const rawId = cleanSheetText(rowValue(row, ['team_id', 'id', 'slug', 'squadra_id', 'team'], ''));
    const rawName = cleanSheetText(rowValue(row, ['team_name', 'name', 'nome', 'squadra', 'club', 'team'], rawId));
    const name = rawName || rawId || `Squadra ${fallbackOrder + 1}`;
    const id = normalizeKey(rawId || name);
    const short = cleanSheetText(rowValue(row, ['short_name', 'short', 'code', 'abbr', 'sigla'], name.slice(0, 3))).trim().toUpperCase();
    const defaultTeam = PROFANTASY_DEFAULT_TEAMS.find(team => normalizeKey(team.id) === id || normalizeKey(team.name) === normalizeKey(name) || normalizeKey(team.short) === normalizeKey(short)) || {};
    return {
      ...defaultTeam,
      id,
      name,
      short,
      status: cleanSheetText(rowValue(row, ['status', 'stato'], defaultTeam.status || 'Monitorare')),
      attack: toNumber(rowValue(row, ['attack', 'attacco', 'forza_attacco'], defaultTeam.attack || ''), defaultTeam.attack || 70),
      mid: toNumber(rowValue(row, ['midfield', 'mid', 'centrocampo', 'forza_centrocampo'], defaultTeam.mid || ''), defaultTeam.mid || 70),
      def: toNumber(rowValue(row, ['defense', 'def', 'difesa', 'forza_difesa'], defaultTeam.def || ''), defaultTeam.def || 70),
      focus: cleanSheetText(rowValue(row, ['focus', 'summary', 'analisi', 'note'], defaultTeam.focus || 'Analisi completa del mercato e impatto sulla rosa fantasy.')),
      logo: cleanSheetText(rowValue(row, ['logo', 'logo_img', 'logo_url'], defaultTeam.logo || `img/clubs/${id}.png`)),
      cardBg: cleanSheetText(rowValue(row, ['card_bg', 'background', 'bg', 'card_background'], defaultTeam.cardBg || `img/clubcard-bg/${id}-transfer-center.jpg`)),
      order: toNumber(rowValue(row, ['order', 'ordine'], defaultTeam.order || fallbackOrder), defaultTeam.order || fallbackOrder)
    };
  }

  function mapPlayerRow(row) {
    const rawName = rowValue(row, ['player_name', 'giocatore', 'name', 'nome', 'nome_giocatore', 'calciatore'], '');
    const name = cleanSheetText(rawName);
    const teamId = cleanSheetText(rowValue(row, ['team_id', 'team', 'squadra_id'], '')) || slugify(rowValue(row, ['squadra'], activeTeamId));
    const section = normalizeSection(rowValue(row, ['section', 'tab', 'categoria', 'tipo', 'sezione'], 'official-in'));
    const fromTeam = cleanSheetText(rowValue(row, ['from_team', 'da', 'provenienza'], ''));
    const toTeam = cleanSheetText(rowValue(row, ['to_team', 'verso', 'destinazione'], ''));
    const price = cleanSheetText(rowValue(row, ['price', 'costo', 'prezzo', 'formula', 'probability', 'probabilita'], ''));
    const role = cleanSheetText(rowValue(row, ['role', 'ruolo'], 'N/D')).toUpperCase();
    const note = cleanSheetText(rowValue(row, ['note', 'nota', 'position_detail', 'dettaglio_ruolo', 'descrizione'], ''));
    const index = toNumber(rowValue(row, ['fantaindex', 'index', 'indice'], 0), 0);
    const fallbackImage = name ? `img/database/${slugify(name)}.png` : 'img/database/player-placeholder.png';
    const titolarita = toNumber(rowValue(row, ['titolarita', 'titolarità', 'xo', 'ownership', 'expected_ownership'], ''), NaN);
    const bonus = toNumber(rowValue(row, ['bonus', 'bonus_potential', 'potenziale_bonus'], ''), NaN);
    const rischio = toNumber(rowValue(row, ['rischio', 'risk', 'risk_level', 'turnover_risk'], ''), NaN);
    const minutesImpact = toNumber(rowValue(row, ['impatto_minuti', 'minutes_impact', 'minuti', 'minutes'], ''), NaN);
    const bonusPotenzialiTotali = toNumber(rowValue(row, ['bonus_potenziali_totali', 'bonus_totali', 'g_a', 'g+a', 'gol_assist', 'goals_assists', 'bonus_ga'], ''), NaN);
    const prezzoMedioAsta = toNumber(rowValue(row, ['prezzo_medio_asta', 'prezzo_medio_1000', 'prezzo_medio', 'auction_price', 'avg_auction_price', 'prezzo_asta'], ''), NaN);

    return {
      teamId,
      rawTeamId: teamId,
      teamName: cleanSheetText(rowValue(row, ['team_name', 'squadra', 'team', 'nome_squadra'], teamId)),
      section,
      name,
      source: cleanSheetText(rowValue(row, ['source', 'sorgente'], fromTeam || toTeam || 'Da aggiornare')),
      fromTeam,
      toTeam,
      nationality: cleanSheetText(rowValue(row, ['nationality', 'nazione', 'country', 'nazionalita', 'nazionalità'], '')),
      fromLogo: cleanSheetText(rowValue(row, ['from_logo', 'from_logo_url', 'from_logo_img', 'from_team_logo', 'logo_provenienza', 'logo_club_provenienza', 'club_from_logo', 'logo_from', 'source_logo', 'origin_logo', 'source_team_logo'], '')),
      toLogo: cleanSheetText(rowValue(row, ['to_logo', 'to_logo_url', 'to_logo_img', 'to_team_logo', 'logo_destinazione', 'logo_club_destinazione', 'club_to_logo', 'logo_to', 'destination_logo', 'dest_logo', 'target_logo'], '')),
      nationalityLogo: cleanSheetText(rowValue(row, ['nationality_logo', 'nationality_logo_url', 'flag_logo', 'flag_img', 'bandiera', 'nationality_img', 'country_logo'], '')),
      originLogo: cleanSheetText(rowValue(row, ['origin_logo', 'club_logo', 'team_logo'], '')),
      price: price || 'Da aggiornare',
      priceLabel: cleanSheetText(rowValue(row, ['price_label', 'label_prezzo'], '')),
      role: role || 'N/D',
      roleName: cleanSheetText(rowValue(row, ['role_name', 'nome_ruolo', 'position_detail'], note || role || 'Profilo fantasy')),
      note: note || 'Scheda fantasy',
      index,
      tag: cleanSheetText(rowValue(row, ['status_label', 'label', 'status'], '')),
      image: cleanSheetText(rowValue(row, ['player_img', 'image', 'img', 'foto'], fallbackImage)),
      flagImage: cleanSheetText(rowValue(row, ['flag_img', 'flag', 'bandiera'], 'img/database/player-flag.png')),
      statLabel: cleanSheetText(rowValue(row, ['stat_label', 'label_stat'], 'FantaIndex')),
      statValue: cleanSheetText(rowValue(row, ['stat_value', 'valore_stat', 'fantamedia'], index)),
      titolarita,
      bonus,
      rischio,
      minutesImpact,
      bonusPotenzialiTotali,
      prezzoMedioAsta,
      slotAsta: cleanSheetText(rowValue(row, ['slot_asta', 'slot', 'asta_slot'], '')),
      profantasyNote: cleanSheetText(rowValue(row, ['profantasy_note', 'insight', 'nota_profantasy', 'pf_note'], '')),
      manualOverall: toNumber(rowValue(row, ['profantasy_overall', 'overall', 'pf_overall'], ''), NaN),
      order: toNumber(rowValue(row, ['order', 'ordine'], 999), 999)
    };
  }

  function mapTrendRow(row, index) {
    const name = String(rowValue(row, ['player_name', 'giocatore', 'name', 'nome', 'nome_giocatore', 'calciatore'], '')).trim();
    return {
      name,
      team: String(rowValue(row, ['team', 'squadra'], '')).trim(),
      score: String(rowValue(row, ['score', 'delta', 'salita', 'variazione'], '+0')).trim(),
      image: String(rowValue(row, ['player_img', 'image', 'img', 'foto'], `img/database/trend-${index + 1}.png`)).trim(),
      note: String(rowValue(row, ['note', 'nota'], '')).trim(),
      order: toNumber(rowValue(row, ['order', 'ordine'], index + 1), index + 1)
    };
  }

  function mapTopIndexRow(row, index) {
    const teamId = String(rowValue(row, ['team_id', 'team', 'squadra_id'], '')).trim() || slugify(rowValue(row, ['squadra'], activeTeamId));
    const name = String(rowValue(row, ['player_name', 'giocatore', 'name', 'nome', 'nome_giocatore', 'calciatore'], '')).trim();
    return {
      teamId,
      name,
      role: String(rowValue(row, ['role', 'ruolo'], 'C')).trim().toUpperCase(),
      index: toNumber(rowValue(row, ['fantaindex', 'index', 'indice'], 70), 70),
      team: String(rowValue(row, ['team_name', 'squadra', 'team'], '')).trim(),
      image: String(rowValue(row, ['player_img', 'image', 'img', 'foto'], `img/database/${slugify(name)}.png`)).trim(),
      note: String(rowValue(row, ['note', 'nota'], '')).trim(),
      order: toNumber(rowValue(row, ['order', 'ordine'], index + 1), index + 1)
    };
  }

  let activeTeamId = '';
  let hasResolvedInitialTeam = false;
  let activeTab = 'official-in';
  let activePlayerIndex = 0;
  let playerSearchTerm = '';
  let playerSortMode = 'order';

  const teamList = document.querySelector('[data-team-list]');
  const marketList = document.querySelector('[data-market-list]');
  const trendList = document.querySelector('[data-trend-list]');
  const roleFilter = document.querySelector('[data-role-filter]');
  const typeFilter = document.querySelector('[data-type-filter]');
  const indexFilter = document.querySelector('[data-index-filter]');
  const indexValue = document.querySelector('[data-index-value]');

  /* =====================================================
     GA4 ANALYTICS LAYER - ProFantasy Transfers
     -----------------------------------------------------
     Eventi tracciati: page ready, dati, scroll depth, nav,
     carousel hero, scelta squadra, tab, ricerca, sort e player.
     Per attivare GA4: imposta window.PROFANTASY_GA_MEASUREMENT_ID
     in transfer.html con il tuo Measurement ID reale, es. G-ABC123XYZ.
     ===================================================== */
  const TRANSFER_ANALYTICS_SCROLL_MARKS = [25, 50, 75, 90, 100];
  const transferAnalyticsScrollSeen = new Set();
  const transferAnalyticsOnceSeen = new Set();
  let transferAnalyticsSetupDone = false;
  let transferAnalyticsSearchTimer = null;

  function cleanAnalyticsText(value, fallback = '') {
    const text = String(value ?? fallback ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    return text.length > 100 ? `${text.slice(0, 97)}...` : text;
  }

  function getAnalyticsTeamMeta(teamId = activeTeamId) {
    const team = teams.find(item => normalizeKey(item.id) === normalizeKey(teamId)) || teams.find(item => item.id === activeTeamId) || teams[0] || {};
    return {
      team_id: cleanAnalyticsText(team.id || teamId || 'not_set'),
      team_name: cleanAnalyticsText(team.name || teamId || 'Not set'),
      team_short: cleanAnalyticsText(team.short || '')
    };
  }

  function getAnalyticsBaseParams(extra = {}) {
    const teamMeta = getAnalyticsTeamMeta();
    return {
      page_area: 'transfers',
      page_title: cleanAnalyticsText(document.title || 'Transfers | ProFantasy'),
      page_path: cleanAnalyticsText(window.location.pathname + window.location.search),
      active_team_id: teamMeta.team_id,
      active_team_name: teamMeta.team_name,
      active_tab: cleanAnalyticsText(activeTab || 'official-in'),
      ...extra
    };
  }

  function trackTransferEvent(eventName, params = {}, options = {}) {
    const safeName = cleanAnalyticsText(eventName)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 40);

    if (!safeName) return;

    const payload = getAnalyticsBaseParams(params);
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === null || payload[key] === '') delete payload[key];
      if (typeof payload[key] === 'string') payload[key] = cleanAnalyticsText(payload[key]);
    });

    if (options.onceKey) {
      if (transferAnalyticsOnceSeen.has(options.onceKey)) return;
      transferAnalyticsOnceSeen.add(options.onceKey);
    }

    if (typeof window.gtag === 'function' && window.PROFANTASY_GA_READY !== false) {
      window.gtag('event', safeName, payload);
    }

    if (window.PROFANTASY_GA_DEBUG === true) {
      console.info('[ProFantasy GA4]', safeName, payload);
    }
  }

  function trackTransferEventOnce(eventName, params = {}, onceKey = eventName) {
    trackTransferEvent(eventName, params, { onceKey });
  }

  function schedulePlayerSearchAnalytics(value) {
    window.clearTimeout(transferAnalyticsSearchTimer);
    transferAnalyticsSearchTimer = window.setTimeout(() => {
      const query = cleanAnalyticsText(value || '');
      trackTransferEvent('transfer_player_search', {
        has_search: query.length > 0,
        search_length: query.length,
        results_count: getCurrentItems().length,
        sort_mode: cleanAnalyticsText(playerSortMode || 'order')
      });
    }, 650);
  }

  function trackPlayerSelection(item, values, source = 'player_card') {
    if (!item) return;
    const overall = Math.round(values?.overall || item.manualOverall || item.index || 0);
    trackTransferEvent('transfer_player_select', {
      interaction_source: cleanAnalyticsText(source),
      player_name: cleanAnalyticsText(item.name || 'Giocatore'),
      player_role: cleanAnalyticsText(item.role || ''),
      player_team: cleanAnalyticsText(item.team || item.currentTeamName || item.source || ''),
      player_overall: Number.isFinite(overall) ? overall : 0,
      player_section: cleanAnalyticsText(activeTab || '')
    });
  }

  function setupAnalyticsTracking() {
    if (transferAnalyticsSetupDone) return;
    transferAnalyticsSetupDone = true;

    let ticking = false;
    const checkScrollDepth = () => {
      ticking = false;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const current = Math.max(window.scrollY || doc.scrollTop || 0, 0);
      const depth = Math.min(100, Math.round((current / maxScroll) * 100));

      TRANSFER_ANALYTICS_SCROLL_MARKS.forEach((mark) => {
        if (depth >= mark && !transferAnalyticsScrollSeen.has(mark)) {
          transferAnalyticsScrollSeen.add(mark);
          trackTransferEvent('transfer_scroll_depth', { scroll_depth: mark });
        }
      });
    };

    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(checkScrollDepth);
    }, { passive: true });

    document.addEventListener('click', (event) => {
      const link = event.target.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const linkText = cleanAnalyticsText(link.textContent || link.getAttribute('aria-label') || href);
      const isFooter = Boolean(link.closest('.pf-site-footer'));
      const isNavbar = Boolean(link.closest('.wc-navbar'));
      const eventName = isFooter ? 'transfer_footer_link_click' : isNavbar ? 'transfer_nav_link_click' : 'transfer_link_click';
      trackTransferEvent(eventName, {
        link_text: linkText,
        link_href: cleanAnalyticsText(href),
        link_area: isFooter ? 'footer' : isNavbar ? 'navbar' : 'content'
      });
    });
  }


  function splitPlayerName(fullName) {
    const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { first: parts[0] || 'Giocatore', last: '' };
    const surnamePrefixes = ['di', 'de', 'del', 'della', 'delle', 'dello', 'da', 'dal', 'van', 'von', 'dos', 'des'];
    const last = parts[parts.length - 1] || '';
    const beforeLast = (parts[parts.length - 2] || '').toLowerCase();
    if (parts.length >= 3 && surnamePrefixes.includes(beforeLast)) {
      return { first: parts.slice(0, -2).join(' '), last: parts.slice(-2).join(' ') };
    }
    return { first: parts.slice(0, -1).join(' '), last };
  }

  function tabLabel(tab) {
    const labels = {
      'official-in': 'Nuovo acquisto',
      'official-out': 'Cessione ufficiale',
      rumor: 'Rumor monitorato',
      loan: 'Prestito',
      roster: 'Profilo rosa',
      impact: 'Impatto fantasy'
    };
    return labels[tab] || 'Scheda giocatore';
  }

  function priceLabel(tab) {
    const labels = {
      'official-in': 'Valore',
      'official-out': 'Valore',
      rumor: 'Valore',
      loan: 'Valore',
      roster: 'FantaIndex',
      impact: 'Impatto'
    };
    return labels[tab] || 'Dato';
  }


  function getPlayerOriginMeta(item, tab) {
    const fromTeam = cleanSheetText(item.fromTeam || item.source || '');
    const toTeam = cleanSheetText(item.toTeam || item.source || '');
    const nationality = cleanSheetText(item.nationality || item.nazione || item.country || item.source || '');
    const baseLogo = cleanSheetText(item.originLogo || item.clubLogo || item.flagImage || 'img/database/player-flag.png');
    if (tab === 'official-out') {
      return { label: 'Verso', value: toTeam || item.source || 'Da aggiornare', image: cleanSheetText(item.toLogo || baseLogo) };
    }
    if (tab === 'official-in' || tab === 'rumor') {
      return { label: 'Da', value: fromTeam || item.source || 'Da aggiornare', image: cleanSheetText(item.fromLogo || baseLogo) };
    }
    if (tab === 'roster' || tab === 'loan' || tab === 'impact') {
      return { label: '', value: nationality || 'Nazionalità da aggiornare', image: cleanSheetText(item.nationalityLogo || baseLogo) };
    }
    return { label: 'Da', value: item.source || 'Da aggiornare', image: baseLogo };
  }


  function getOverallTier(overall) {
    const value = Number(overall) || 0;
    if (value >= 90) return { key: 'diamond', label: 'Diamante' };
    if (value >= 85) return { key: 'rare', label: 'Rare' };
    if (value >= 75) return { key: 'common', label: 'Common' };
    if (value >= 65) return { key: 'gold', label: 'Oro' };
    if (value >= 55) return { key: 'silver', label: 'Argento' };
    return { key: 'bronze', label: 'Bronzo' };
  }


  function getRoleFullLabel(role) {
    const key = roleFamily(role);
    const labels = { P: 'Portiere', D: 'Difensore', C: 'Centrocampista', A: 'Attaccante' };
    return labels[key] || 'Ruolo';
  }

  function getPlayerPrimaryMetric(item, values, tab) {
    const overall = Math.round(values?.overall || item.manualOverall || item.index || 55);
    const tier = getOverallTier(overall);
    return { label: 'PF Overall', value: String(overall), suffix: '', tier: tier.key };
  }

  function getPositionDetail(item) {
    return cleanSheetText(item.roleName || item.note || item.positionDetail || 'Profilo fantasy');
  }


  const TEAM_ALIAS_GROUPS = {
    atalanta: ['atalanta', 'ata', 'atalanta-bc', 'atalanta-bergamasca-calcio', 'dea']
  };

  function teamAliasesFor(value) {
    const slug = slugify(value);
    if (!slug) return [];
    const group = Object.values(TEAM_ALIAS_GROUPS).find(list => list.includes(slug));
    return group || [slug];
  }

  function teamIdentitySlugs(team) {
    return [team?.id, team?.name, team?.short]
      .flatMap(value => teamAliasesFor(value))
      .filter(Boolean);
  }

  function resolveTeamId(rawValue) {
    const raw = cleanSheetText(rawValue);
    if (!raw) return '';
    const rawAliases = teamAliasesFor(raw);
    const rawLower = raw.toLowerCase();
    const direct = teams.find(team => team.id === raw || String(team.id || '').toLowerCase() === rawLower);
    if (direct) return direct.id;
    const byIdentity = teams.find(team => {
      const values = [team.id, team.name, team.short].map(value => String(value || '').toLowerCase());
      return values.includes(rawLower) || teamIdentitySlugs(team).some(alias => rawAliases.includes(alias));
    });
    if (byIdentity) return byIdentity.id;
    return rawAliases[0] || slugify(raw);
  }

  function getMarketBucket(teamId) {
    const canonicalId = resolveTeamId(teamId) || teamId;
    if (marketData[canonicalId]) return marketData[canonicalId];
    const aliases = teamAliasesFor(canonicalId);
    const aliasKey = Object.keys(marketData).find(key => teamAliasesFor(key).some(alias => aliases.includes(alias)));
    return aliasKey ? marketData[aliasKey] : {};
  }

  function getFirstTabWithItems(teamId) {
    const data = getMarketBucket(teamId);
    return TRANSFER_TABS.find(tab => Array.isArray(data[tab]) && data[tab].some(item => item && !isPlaceholderValue(item.name))) || '';
  }

  function sortTeamsAlphabetically(list = teams) {
    return [...list].sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'it', { sensitivity: 'base' }));
  }

  function collectTeamAliasSet(teamId) {
    const aliases = new Set(teamAliasesFor(teamId));
    const resolved = resolveTeamId(teamId);
    if (resolved) teamAliasesFor(resolved).forEach(alias => aliases.add(alias));
    const matchedTeam = teams.find(team => {
      const teamAliases = teamIdentitySlugs(team);
      return teamAliases.some(alias => aliases.has(alias));
    });
    if (matchedTeam) {
      teamIdentitySlugs(matchedTeam).forEach(alias => aliases.add(alias));
      [matchedTeam.id, matchedTeam.name, matchedTeam.short].forEach(value => teamAliasesFor(value).forEach(alias => aliases.add(alias)));
    }
    return aliases;
  }

  function itemBelongsToTeam(item, aliases) {
    if (!item || !aliases || !aliases.size) return false;
    const candidates = [item.teamId, item.rawTeamId, item.teamName, item.squadra, item.team, item.short].filter(Boolean);
    return candidates.some(value => teamAliasesFor(value).some(alias => aliases.has(alias)));
  }

  function findMarketItemsForTeamAndTab(teamId, tab = activeTab) {
    const normalizedTab = normalizeSection(tab);
    const aliases = collectTeamAliasSet(teamId);
    const results = [];
    const seen = new Set();

    const pushItem = (item) => {
      if (!item || isPlaceholderValue(item.name)) return;
      const key = `${normalizeKey(item.teamId)}|${normalizeSection(item.section)}|${normalizeKey(item.name)}|${normalizeKey(item.price)}`;
      if (seen.has(key)) return;
      seen.add(key);
      results.push(item);
    };

    Object.entries(marketData).forEach(([bucketKey, bucket]) => {
      if (!bucket || typeof bucket !== 'object') return;
      const bucketAliases = collectTeamAliasSet(bucketKey);
      const bucketMatchesTeam = [...bucketAliases].some(alias => aliases.has(alias));

      Object.entries(bucket).forEach(([sectionKey, list]) => {
        if (!Array.isArray(list)) return;
        const sectionMatches = normalizeSection(sectionKey) === normalizedTab;
        if (!sectionMatches) return;
        list.forEach(item => {
          if (bucketMatchesTeam || itemBelongsToTeam(item, aliases)) pushItem(item);
        });
      });
    });

    return results.sort((a, b) => (Number(a.order || 999) - Number(b.order || 999)) || String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' }));
  }

  function hasMarketItemsFor(teamId, tab = activeTab) {
    return findMarketItemsForTeamAndTab(teamId, tab).length > 0;
  }


  const CLUB_THEME_ALIASES = {
    atalanta: ['atalanta', 'atalanta-bc', 'ata', 'dea'],
    bologna: ['bologna', 'bol'],
    cagliari: ['cagliari', 'cag'],
    como: ['como', 'com'],
    fiorentina: ['fiorentina', 'fio'],
    frosinone: ['frosinone', 'fro'],
    genoa: ['genoa', 'gen'],
    inter: ['inter', 'internazionale', 'int'],
    juventus: ['juventus', 'juve', 'juv'],
    lazio: ['lazio', 'laz'],
    milan: ['milan', 'ac-milan', 'mil'],
    monza: ['monza', 'mon'],
    napoli: ['napoli', 'nap'],
    parma: ['parma', 'par'],
    roma: ['roma', 'as-roma', 'rom'],
    sassuolo: ['sassuolo', 'sas'],
    torino: ['torino', 'tor'],
    udinese: ['udinese', 'udi'],
    venezia: ['venezia', 'ven']
  };

  function resolveClubThemeKey(team) {
    const probes = [team?.id, team?.name, team?.short, activeTeamId]
      .map(value => slugify(value || ''))
      .filter(Boolean);
    for (const [themeKey, aliases] of Object.entries(CLUB_THEME_ALIASES)) {
      if (probes.some(probe => aliases.includes(probe))) return themeKey;
    }
    return probes[0] || 'default';
  }

  function applyTeamVisualTheme(team) {
    const safeId = slugify(team?.id || team?.name || activeTeamId || 'default');
    const safeName = slugify(team?.name || safeId);
    const safeShort = slugify(team?.short || safeId);
    const themeKey = resolveClubThemeKey(team);
    document.documentElement.setAttribute('data-pf-active-team', safeId);
    document.body?.setAttribute('data-pf-active-team', safeId);
    document.documentElement.setAttribute('data-pf-active-team-name', safeName);
    document.documentElement.setAttribute('data-pf-active-team-short', safeShort);
    document.documentElement.setAttribute('data-pf-club-theme', themeKey);
  }

  function findAtalantaTeam(list = teams) {
    return list.find(team => teamIdentitySlugs(team).includes('atalanta') || teamIdentitySlugs(team).includes('ata'));
  }

  function resolveInitialTeamAndTab() {
    if (!teams.length) return;
    const alphabeticalTeams = sortTeamsAlphabetically();
    const atalanta = findAtalantaTeam(alphabeticalTeams);
    const preferred = atalanta || alphabeticalTeams[0] || teams[0];

    activeTeamId = resolveTeamId(preferred?.id || preferred?.name || preferred?.short) || preferred?.id || teams[0].id;
    activeTab = 'official-in';
    activePlayerIndex = 0;
    hasResolvedInitialTeam = true;
  }


  function clearDemoDataForSheets() {
    teams.splice(0, teams.length);
    trends.splice(0, trends.length);
    Object.keys(marketData).forEach(key => delete marketData[key]);
    Object.keys(topIndexData).forEach(key => delete topIndexData[key]);
  }



  function restoreDefaultTeamsIfMissing() {
    if (teams.length) return;
    teams.splice(0, teams.length, ...PROFANTASY_DEFAULT_TEAMS.map(team => ({ ...team })));
  }

  function mergeDefaultTeamsWithSheetTeams() {
    const existing = new Set();
    teams.forEach(team => {
      teamIdentitySlugs(team).forEach(alias => existing.add(alias));
    });
    PROFANTASY_DEFAULT_TEAMS.forEach(defaultTeam => {
      const aliases = teamIdentitySlugs(defaultTeam);
      if (!aliases.some(alias => existing.has(alias))) {
        teams.push({ ...defaultTeam });
      }
    });
    teams.sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'it', { sensitivity: 'base' }));
  }
  function inferTeamsFromRows(playerRows = [], topRows = [], compositionRows = []) {
    const map = new Map();

    const register = (teamId, teamName = '') => {
      const id = String(teamId || '').trim() || slugify(teamName);
      if (!id || map.has(id)) return;
      const readableName = String(teamName || id).trim();
      map.set(id, {
        id,
        name: readableName.charAt(0).toUpperCase() + readableName.slice(1),
        short: readableName.slice(0, 3).toUpperCase(),
        status: 'Monitorare',
        attack: 70,
        mid: 70,
        def: 70,
        focus: 'Dati collegati da Google Sheets.',
        logo: `img/clubs/${id}.png`,
        cardBg: `img/clubcard-bg/${id}-transfer-center.jpg`,
        order: 999
      });
    };

    playerRows.forEach(row => register(rowValue(row, ['team_id', 'team', 'squadra_id'], ''), rowValue(row, ['squadra', 'team_name', 'team'], '')));
    topRows.forEach(row => register(rowValue(row, ['team_id', 'team', 'squadra_id'], ''), rowValue(row, ['squadra', 'team_name', 'team'], '')));
    compositionRows.forEach(row => register(rowValue(row, ['team_id', 'team', 'squadra_id'], ''), rowValue(row, ['squadra', 'team_name', 'team'], '')));

    return Array.from(map.values());
  }

  function ensureAtalantaTeamFromRows(playerRows = [], topRows = [], compositionRows = []) {
    const allRows = [...(playerRows || []), ...(topRows || []), ...(compositionRows || [])];
    const hasAtalantaData = allRows.some(row => {
      const rawTeam = rowValue(row, ['team_id', 'team', 'squadra_id', 'squadra', 'team_name'], '');
      return teamAliasesFor(rawTeam).some(alias => ['atalanta', 'ata', 'atalanta-bc', 'atalanta-bergamasca-calcio', 'dea'].includes(alias));
    });
    const alreadyExists = teams.some(team => teamIdentitySlugs(team).some(alias => ['atalanta', 'ata', 'atalanta-bc', 'atalanta-bergamasca-calcio', 'dea'].includes(alias)));
    if (!hasAtalantaData || alreadyExists) return;
    teams.push({
      id: 'atalanta',
      name: 'Atalanta',
      short: 'ATA',
      status: 'Bonus hub',
      attack: 84,
      mid: 81,
      def: 74,
      focus: 'Ambiente storicamente favorevole ai bonus: priorità a titolarità reale e adattamento tattico.',
      logo: 'img/clubs/atalanta.png',
      cardBg: 'img/clubcard-bg/atalanta-transfer-center.jpg',
      order: 1
    });
    teams.sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'it', { sensitivity: 'base' }));
  }

  function markSheetsStatus(status, message = '') {
    document.documentElement.dataset.transfersSource = status;
    if (message) document.documentElement.dataset.transfersSourceMessage = message;
    window.PROFANTASY_TRANSFERS_DEBUG = {
      source: status,
      message,
      sheets: transfersSheetDebug
    };

    trackTransferEvent('transfer_data_source', {
      data_source: cleanAnalyticsText(status || 'unknown'),
      data_message: cleanAnalyticsText(message || 'no_message')
    });
  }

  async function loadExternalTransfersData() {
    const url = window.PROFANTASY_TRANSFERS_DATA_URL;

    if (!USE_TRANSFERS_PLACEHOLDERS) {
      clearDemoDataForSheets();
    }

    if (url && typeof url === 'string' && url.trim()) {
      try {
        const response = await fetch(url.trim(), { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const external = await response.json();

        clearDemoDataForSheets();

        if (Array.isArray(external.teams)) teams.splice(0, teams.length, ...external.teams.map(team => ({ ...team })));
        if (external.marketData && typeof external.marketData === 'object') Object.keys(external.marketData).forEach(teamId => { marketData[teamId] = external.marketData[teamId]; });
        if (Array.isArray(external.trends)) trends.splice(0, trends.length, ...external.trends);
        if (external.topIndexData && typeof external.topIndexData === 'object') Object.keys(external.topIndexData).forEach(teamId => { topIndexData[teamId] = external.topIndexData[teamId]; });

        transfersSheetsLoaded = true;
        markSheetsStatus('json', 'Dati caricati da JSON esterno.');
        return;
      } catch (error) {
        console.warn('ProFantasy Transfers: JSON esterno non caricato, provo Google Sheets.', error);
      }
    }

    const getPlayerIdFromRow = (row) => {
      const explicit = cleanSheetText(rowValue(row, ['player_id', 'id_giocatore', 'id', 'slug'], ''));
      if (explicit) return normalizeKey(explicit);
      const name = cleanSheetText(rowValue(row, ['player_name', 'giocatore', 'name', 'nome', 'nome_giocatore', 'calciatore'], ''));
      return normalizeKey(name);
    };

    const ratingKey = (playerId, teamId = '') => `${normalizeKey(playerId)}|${normalizeKey(teamId)}`;

    const mapMasterRow = (row, index) => {
      const name = cleanSheetText(rowValue(row, ['player_name', 'giocatore', 'name', 'nome', 'nome_giocatore', 'calciatore'], ''));
      const playerId = getPlayerIdFromRow(row);
      const currentTeam = cleanSheetText(rowValue(row, ['current_team_id', 'team_id', 'team', 'squadra_id', 'squadra'], ''));
      const fallbackImage = name ? `img/database/${slugify(name)}.png` : 'img/database/player-placeholder.png';
      return {
        playerId,
        name,
        role: cleanSheetText(rowValue(row, ['role', 'ruolo'], 'N/D')).toUpperCase(),
        positionDetail: cleanSheetText(rowValue(row, ['position_detail', 'dettaglio_ruolo', 'speciality', 'specialità', 'role_name'], '')),
        nationality: cleanSheetText(rowValue(row, ['nationality', 'nazionalita', 'nazionalità', 'nazione', 'country'], '')),
        playerImg: cleanSheetText(rowValue(row, ['player_img', 'image', 'img', 'foto'], fallbackImage)),
        nationalityLogo: cleanSheetText(rowValue(row, ['nationality_logo', 'flag_img', 'bandiera', 'country_logo'], '')),
        currentTeamId: resolveTeamId(currentTeam) || normalizeKey(currentTeam),
        currentTeamName: cleanSheetText(rowValue(row, ['current_team_name', 'team_name', 'squadra'], currentTeam)),
        order: toNumber(rowValue(row, ['order', 'ordine'], index + 1), index + 1)
      };
    };

    const mapRatingRow = (row) => {
      const playerId = getPlayerIdFromRow(row);
      const rawTeam = cleanSheetText(rowValue(row, ['team_id', 'team', 'squadra_id', 'squadra'], ''));
      const teamId = resolveTeamId(rawTeam) || normalizeKey(rawTeam);
      return {
        playerId,
        teamId,
        fantaindex: rowValue(row, ['fantaindex', 'index', 'indice'], ''),
        titolarita: rowValue(row, ['titolarita', 'titolarità', 'xo', 'ownership', 'expected_ownership'], ''),
        bonus: rowValue(row, ['bonus', 'bonus_potential', 'potenziale_bonus'], ''),
        rischio: rowValue(row, ['rischio', 'risk', 'risk_level', 'turnover_risk'], ''),
        impatto_minuti: rowValue(row, ['impatto_minuti', 'minutes_impact', 'minuti', 'minutes'], ''),
        bonus_potenziali_totali: rowValue(row, ['bonus_potenziali_totali', 'bonus_totali', 'g_a', 'g+a', 'gol_assist', 'goals_assists', 'bonus_ga'], ''),
        prezzo_medio_asta: rowValue(row, ['prezzo_medio_asta', 'prezzo_medio_1000', 'prezzo_medio', 'auction_price', 'avg_auction_price', 'prezzo_asta'], ''),
        slot_asta: cleanSheetText(rowValue(row, ['slot_asta', 'slot', 'asta_slot'], '')),
        profantasy_note: cleanSheetText(rowValue(row, ['profantasy_note', 'insight', 'nota_profantasy', 'pf_note'], '')),
        profantasy_overall: rowValue(row, ['profantasy_overall', 'overall', 'pf_overall'], ''),
        updated_at: cleanSheetText(rowValue(row, ['updated_at', 'aggiornato_il', 'last_update'], ''))
      };
    };

    let ratingsByKey = new Map();
    let ratingsByPlayer = new Map();

    const getRatingFor = (playerId, teamId) => {
      const exact = ratingsByKey.get(ratingKey(playerId, teamId));
      if (exact) return exact;
      return ratingsByPlayer.get(normalizeKey(playerId)) || {};
    };

    const composePlayerRow = (base = {}, master = {}, rating = {}, overrides = {}) => {
      const teamId = cleanSheetText(overrides.team_id || base.team_id || master.currentTeamId || '');
      const playerName = cleanSheetText(overrides.player_name || base.player_name || master.name || '');
      const role = cleanSheetText(overrides.role || base.role || master.role || 'N/D').toUpperCase();
      const positionDetail = cleanSheetText(overrides.position_detail || base.position_detail || master.positionDetail || base.note || '');
      const nationality = cleanSheetText(overrides.nationality || base.nationality || master.nationality || '');
      return {
        team_id: teamId,
        team_name: cleanSheetText(overrides.team_name || base.team_name || ''),
        section: normalizeSection(overrides.section || base.section || 'official-in'),
        player_id: cleanSheetText(overrides.player_id || base.player_id || master.playerId || normalizeKey(playerName)),
        player_name: playerName,
        role,
        position_detail: positionDetail,
        from_team: cleanSheetText(overrides.from_team || base.from_team || ''),
        to_team: cleanSheetText(overrides.to_team || base.to_team || ''),
        price: cleanSheetText(overrides.price || base.price || ''),
        status_label: cleanSheetText(overrides.status_label || base.status_label || base.tag || ''),
        note: positionDetail || cleanSheetText(overrides.note || base.note || ''),
        nationality,
        player_img: cleanSheetText(overrides.player_img || base.player_img || master.playerImg || (playerName ? `img/database/${slugify(playerName)}.png` : 'img/database/player-placeholder.png')),
        nationality_logo: cleanSheetText(overrides.nationality_logo || base.nationality_logo || master.nationalityLogo || ''),
        flag_img: cleanSheetText(overrides.flag_img || base.flag_img || master.nationalityLogo || ''),
        from_logo: cleanSheetText(overrides.from_logo || base.from_logo || ''),
        to_logo: cleanSheetText(overrides.to_logo || base.to_logo || ''),
        origin_logo: cleanSheetText(overrides.origin_logo || base.origin_logo || ''),
        fantaindex: cleanSheetText(overrides.fantaindex || base.fantaindex || rating.fantaindex || ''),
        titolarita: cleanSheetText(overrides.titolarita || base.titolarita || rating.titolarita || ''),
        bonus: cleanSheetText(overrides.bonus || base.bonus || rating.bonus || ''),
        rischio: cleanSheetText(overrides.rischio || base.rischio || rating.rischio || ''),
        impatto_minuti: cleanSheetText(overrides.impatto_minuti || base.impatto_minuti || rating.impatto_minuti || ''),
        bonus_potenziali_totali: cleanSheetText(overrides.bonus_potenziali_totali || base.bonus_potenziali_totali || rating.bonus_potenziali_totali || ''),
        prezzo_medio_asta: cleanSheetText(overrides.prezzo_medio_asta || base.prezzo_medio_asta || rating.prezzo_medio_asta || ''),
        slot_asta: cleanSheetText(overrides.slot_asta || base.slot_asta || rating.slot_asta || ''),
        profantasy_note: cleanSheetText(overrides.profantasy_note || base.profantasy_note || rating.profantasy_note || ''),
        profantasy_overall: cleanSheetText(overrides.profantasy_overall || base.profantasy_overall || rating.profantasy_overall || ''),
        order: cleanSheetText(overrides.order || base.order || master.order || 999),
        is_active: cleanSheetText(overrides.is_active || base.is_active || 'TRUE')
      };
    };

    try {
      const sheetNames = window.PROFANTASY_TRANSFER_SHEETS || TRANSFERS_SHEET_NAMES;
      const [
        teamRows,
        playerMasterRows,
        movementRows,
        ratingRows,
        rosterRows,
        legacyPlayerRows,
        trendRows,
        topRows,
        compositionRows,
        metaRows
      ] = await Promise.all([
        fetchOptionalTransferSheet('teams', sheetNames.teams),
        fetchOptionalTransferSheet('playersMaster', sheetNames.playersMaster),
        fetchOptionalTransferSheet('movements', sheetNames.movements),
        fetchOptionalTransferSheet('ratings', sheetNames.ratings),
        fetchOptionalTransferSheet('rosters', sheetNames.rosters),
        fetchOptionalTransferSheet('players', sheetNames.players),
        fetchOptionalTransferSheet('trends', sheetNames.trends),
        fetchOptionalTransferSheet('topIndex', sheetNames.topIndex),
        fetchOptionalTransferSheet('composition', sheetNames.composition),
        fetchOptionalTransferSheet('meta', sheetNames.meta)
      ]);

      transfersSheetDebug = {
        teams: teamRows?._debug || [],
        playersMaster: playerMasterRows?._debug || [],
        movements: movementRows?._debug || [],
        ratings: ratingRows?._debug || [],
        rosters: rosterRows?._debug || [],
        playersLegacy: legacyPlayerRows?._debug || [],
        trends: trendRows?._debug || [],
        topIndex: topRows?._debug || [],
        composition: compositionRows?._debug || [],
        meta: metaRows?._debug || []
      };

      const hasStructuredRows = [playerMasterRows, movementRows, ratingRows, rosterRows].some(rows => Array.isArray(rows) && rows.length);
      const hasAnySheetRows = [teamRows, playerMasterRows, movementRows, ratingRows, rosterRows, legacyPlayerRows, trendRows, topRows, compositionRows, metaRows].some(rows => Array.isArray(rows) && rows.length);
      if (hasAnySheetRows) transfersSheetsLoaded = true;

      if (!USE_TRANSFERS_PLACEHOLDERS) clearDemoDataForSheets();

      if (teamRows?.length) {
        const mappedTeams = teamRows.filter(isValidTeamRow).map((row, index) => mapTeamRow(row, index));
        if (mappedTeams.length) {
          // V35: se il foglio Teams è presente e valido, il sito deve usare SOLO le squadre del foglio.
          // I default servono solo come emergenza, non vanno fusi perché aggiungono squadre indesiderate.
          teams.splice(0, teams.length, ...sortTeamsAlphabetically(mappedTeams));
        } else {
          restoreDefaultTeamsIfMissing();
        }
      } else {
        restoreDefaultTeamsIfMissing();
      }

      const masters = (playerMasterRows || []).filter(isActiveRow).map(mapMasterRow).filter(item => item.playerId && item.name);
      const masterById = new Map();
      masters.forEach(item => masterById.set(normalizeKey(item.playerId), item));

      const ratingItems = (ratingRows || []).filter(isActiveRow).map(mapRatingRow).filter(item => item.playerId);
      ratingsByKey = new Map();
      ratingsByPlayer = new Map();
      ratingItems.forEach(item => {
        if (item.teamId) ratingsByKey.set(ratingKey(item.playerId, item.teamId), item);
        if (!ratingsByPlayer.has(normalizeKey(item.playerId))) ratingsByPlayer.set(normalizeKey(item.playerId), item);
      });

      const compiledRows = [];

      (movementRows || []).filter(isActiveRow).forEach((row, index) => {
        const playerId = getPlayerIdFromRow(row);
        const master = masterById.get(normalizeKey(playerId)) || mapMasterRow(row, index);
        const rawTeam = cleanSheetText(rowValue(row, ['team_id', 'team', 'squadra_id', 'squadra'], master.currentTeamId || ''));
        const teamId = resolveTeamId(rawTeam) || normalizeKey(rawTeam);
        const rating = getRatingFor(playerId, teamId);
        compiledRows.push(composePlayerRow(row, master, rating, {
          team_id: teamId,
          team_name: cleanSheetText(rowValue(row, ['team_name', 'squadra'], '')),
          section: normalizeSection(rowValue(row, ['section', 'tab', 'categoria', 'tipo', 'sezione'], 'official-in')),
          player_id: playerId,
          from_team: rowValue(row, ['from_team', 'da', 'provenienza'], ''),
          to_team: rowValue(row, ['to_team', 'verso', 'destinazione'], ''),
          price: rowValue(row, ['price', 'costo', 'prezzo', 'formula', 'probability', 'probabilita'], ''),
          from_logo: rowValue(row, ['from_logo', 'from_logo_url', 'from_logo_img', 'from_team_logo', 'logo_provenienza', 'logo_club_provenienza', 'club_from_logo', 'logo_from', 'source_logo', 'origin_logo', 'source_team_logo'], ''),
          to_logo: rowValue(row, ['to_logo', 'to_logo_url', 'to_logo_img', 'to_team_logo', 'logo_destinazione', 'logo_club_destinazione', 'club_to_logo', 'logo_to', 'destination_logo', 'dest_logo', 'target_logo'], ''),
          status_label: rowValue(row, ['status_label', 'label', 'status'], ''),
          order: rowValue(row, ['order', 'ordine'], index + 1),
          is_active: rowValue(row, ['is_active', 'active', 'attivo', 'visibile'], 'TRUE')
        }));
      });

      (rosterRows || []).filter(isActiveRow).forEach((row, index) => {
        const playerId = getPlayerIdFromRow(row);
        const master = masterById.get(normalizeKey(playerId)) || mapMasterRow(row, index);
        const rawTeam = cleanSheetText(rowValue(row, ['team_id', 'team', 'squadra_id', 'squadra'], master.currentTeamId || ''));
        const teamId = resolveTeamId(rawTeam) || normalizeKey(rawTeam);
        const rating = getRatingFor(playerId, teamId);
        compiledRows.push(composePlayerRow(row, master, rating, {
          team_id: teamId,
          team_name: cleanSheetText(rowValue(row, ['team_name', 'squadra'], '')),
          section: 'roster',
          player_id: playerId,
          price: '',
          order: rowValue(row, ['order', 'ordine', 'shirt_number', 'numero_maglia'], index + 1),
          is_active: rowValue(row, ['is_active', 'active', 'attivo', 'visibile'], 'TRUE')
        }));
      });

      // V46.1: PlayersMaster deve poter alimentare direttamente la Rosa.
      // In questo modo il foglio Rosters resta opzionale: se un giocatore ha current_team_id
      // in PlayersMaster, viene mostrato nella squadra corretta usando gli stessi rating.
      const rosterCompiledKeys = new Set(
        compiledRows
          .filter(row => normalizeSection(row.section || '') === 'roster')
          .map(row => `${normalizeKey(row.player_id)}|${normalizeKey(row.team_id)}`)
      );

      masters.forEach((master, index) => {
        const teamId = resolveTeamId(master.currentTeamId) || normalizeKey(master.currentTeamId);
        if (!teamId || !master.playerId || !master.name) return;

        const key = `${normalizeKey(master.playerId)}|${normalizeKey(teamId)}`;
        if (rosterCompiledKeys.has(key)) return;

        const rating = getRatingFor(master.playerId, teamId);
        compiledRows.push(composePlayerRow({}, master, rating, {
          team_id: teamId,
          team_name: master.currentTeamName || '',
          section: 'roster',
          player_id: master.playerId,
          price: '',
          order: master.order || index + 1,
          is_active: 'TRUE'
        }));
        rosterCompiledKeys.add(key);
      });

      // V46.10: logica rosa dinamica da Movements.
      // - official-in: il giocatore viene aggiunto automaticamente alla rosa della squadra selezionata.
      // - official-out: il giocatore viene rimosso dalla rosa della squadra selezionata.
      // - rumor: il giocatore resta nel tab Rumors ma non deve comparire nella rosa.
      // La rosa base può arrivare da Rosters o PlayersMaster, ma Movements ha priorità.
      const rosterPlayerKey = (row) => normalizeKey(row?.player_id || row?.playerId || row?.player_name || row?.name || '');
      const rosterTeamKey = (value) => resolveTeamId(value) || normalizeKey(value || '');
      const rosterMoveRows = compiledRows.filter(row => ['official-in', 'official-out', 'rumor'].includes(normalizeSection(row.section || '')));
      const rosterExclusions = new Set();
      const rosterAutoAdds = [];

      const addRosterExclusion = (playerKey, teamKey) => {
        if (!playerKey || !teamKey) return;
        rosterExclusions.add(`${playerKey}|${teamKey}`);
      };

      rosterMoveRows.forEach((row) => {
        const playerKey = rosterPlayerKey(row);
        if (!playerKey) return;
        const section = normalizeSection(row.section || '');
        const rowTeamId = rosterTeamKey(row.team_id || row.teamId || row.rawTeamId || row.team_name || row.teamName);
        const fromTeamId = rosterTeamKey(row.from_team || row.fromTeam);
        const toTeamId = rosterTeamKey(row.to_team || row.toTeam);

        if (section === 'official-in') {
          const arrivalTeamId = rowTeamId || toTeamId;
          if (arrivalTeamId) {
            rosterAutoAdds.push({
              ...row,
              team_id: arrivalTeamId,
              team_name: cleanSheetText(row.team_name || row.teamName || ''),
              section: 'roster',
              status_label: cleanSheetText(row.status_label || 'Profilo rosa'),
              price: '',
              order: cleanSheetText(row.order || 999)
            });
          }
          // Se il club di provenienza è una squadra presente nel sito, il giocatore non resta nella vecchia rosa.
          if (fromTeamId && fromTeamId !== arrivalTeamId) addRosterExclusion(playerKey, fromTeamId);
          return;
        }

        if (section === 'official-out') {
          // In Cessioni, team_id rappresenta la squadra che sta cedendo il giocatore.
          if (rowTeamId) addRosterExclusion(playerKey, rowTeamId);
          return;
        }

        if (section === 'rumor') {
          // Un rumor non è rosa attuale: resta monitorato, ma non entra nella rosa della squadra selezionata.
          if (rowTeamId) addRosterExclusion(playerKey, rowTeamId);
        }
      });

      if (rosterExclusions.size) {
        for (let i = compiledRows.length - 1; i >= 0; i -= 1) {
          const row = compiledRows[i];
          if (normalizeSection(row.section || '') !== 'roster') continue;
          const playerKey = rosterPlayerKey(row);
          const teamKey = rosterTeamKey(row.team_id || row.teamId || row.rawTeamId || row.team_name || row.teamName);
          if (rosterExclusions.has(`${playerKey}|${teamKey}`)) compiledRows.splice(i, 1);
        }
      }

      if (rosterAutoAdds.length) compiledRows.push(...rosterAutoAdds);

      // Deduplica finale della rosa dopo le regole di mercato, mantenendo il primo profilo valido.
      const finalRosterSeen = new Set();
      for (let i = compiledRows.length - 1; i >= 0; i -= 1) {
        const row = compiledRows[i];
        if (normalizeSection(row.section || '') !== 'roster') continue;
        const playerKey = rosterPlayerKey(row);
        const teamKey = rosterTeamKey(row.team_id || row.teamId || row.rawTeamId || row.team_name || row.teamName);
        const key = `${playerKey}|${teamKey}`;
        if (!playerKey || !teamKey) continue;
        if (finalRosterSeen.has(key)) compiledRows.splice(i, 1);
        else finalRosterSeen.add(key);
      }

      if (!compiledRows.length && legacyPlayerRows?.length) {
        legacyPlayerRows.filter(isValidPlayerRow).forEach(row => compiledRows.push(row));
      }

      const inferredTeams = inferTeamsFromRows(compiledRows || []);
      const hasValidTeamsSheet = Array.isArray(teamRows) && teamRows.filter(isValidTeamRow).length > 0;
      if (!hasValidTeamsSheet && hasAnySheetRows && inferredTeams.length) {
        // V35: inferiamo squadre dai giocatori solo se il foglio Teams non è stato compilato.
        teams.splice(0, teams.length, ...inferredTeams.sort((a, b) => String(a.name || a.id).localeCompare(String(b.name || b.id), 'it', { sensitivity: 'base' })));
      }

      restoreDefaultTeamsIfMissing();
      if (!(Array.isArray(teamRows) && teamRows.filter(isValidTeamRow).length > 0)) {
        ensureAtalantaTeamFromRows(compiledRows || [], topRows || [], compositionRows || []);
      }
      if (teams.length && activeTeamId && !teams.some(team => team.id === activeTeamId)) activeTeamId = resolveTeamId(activeTeamId) || teams[0].id;

      (compositionRows || []).filter(isValidCompositionRow).forEach((row) => {
        const teamId = resolveTeamId(String(rowValue(row, ['team_id', 'team', 'squadra_id'], '')).trim() || rowValue(row, ['squadra'], ''));
        const team = teams.find(item => item.id === teamId);
        if (!team) return;
        team.attack = toNumber(rowValue(row, ['attack', 'attacco', 'forza_attacco'], team.attack), team.attack);
        team.mid = toNumber(rowValue(row, ['midfield', 'mid', 'centrocampo', 'forza_centrocampo'], team.mid), team.mid);
        team.def = toNumber(rowValue(row, ['defense', 'def', 'difesa', 'forza_difesa'], team.def), team.def);
        team.status = String(rowValue(row, ['status', 'stato'], team.status)).trim();
        team.focus = String(rowValue(row, ['note', 'nota', 'focus'], team.focus)).trim();
      });

      const groupedMarket = {};
      (compiledRows || []).filter(isValidPlayerRow).map(mapPlayerRow).sort((a, b) => a.order - b.order).forEach((item) => {
        const rawTeamId = item.teamId;
        const resolvedTeamId = resolveTeamId(item.teamId) || resolveTeamId(item.teamName) || teamAliasesFor(item.teamId)[0] || item.teamId;
        item.rawTeamId = rawTeamId;
        item.teamId = resolvedTeamId;
        item.section = normalizeSection(item.section || 'official-in');
        if (!groupedMarket[item.teamId]) groupedMarket[item.teamId] = {};
        if (!groupedMarket[item.teamId][item.section]) groupedMarket[item.teamId][item.section] = [];
        groupedMarket[item.teamId][item.section].push(item);
      });
      Object.keys(groupedMarket).forEach(teamId => {
        const resolvedTeamId = resolveTeamId(teamId) || teamId;
        marketData[resolvedTeamId] = groupedMarket[teamId];
        if (resolvedTeamId !== teamId) marketData[teamId] = groupedMarket[teamId];
      });

      const mappedTrends = (trendRows || []).filter(isValidTrendRow).map(mapTrendRow).sort((a, b) => a.order - b.order);
      if (mappedTrends.length) trends.splice(0, trends.length, ...mappedTrends);

      const groupedTop = {};
      (topRows || []).filter(isValidTopIndexRow).map(mapTopIndexRow).sort((a, b) => a.order - b.order).forEach((item) => {
        const resolvedTeamId = resolveTeamId(item.teamId);
        item.teamId = resolvedTeamId || item.teamId;
        if (!groupedTop[item.teamId]) groupedTop[item.teamId] = [];
        groupedTop[item.teamId].push(item);
      });
      Object.keys(groupedTop).forEach(teamId => { topIndexData[teamId] = groupedTop[teamId]; });

      const lastUpdate = (metaRows || []).find(row => normalizeKey(rowValue(row, ['key', 'chiave'], '')) === 'last_update');
      if (lastUpdate) {
        const value = rowValue(lastUpdate, ['value', 'valore'], '');
        document.documentElement.style.setProperty('--pf-last-update', `"${String(value).replace(/"/g, '')}"`);
      }

      if (hasAnySheetRows) {
        markSheetsStatus('google-sheets', hasStructuredRows ? 'Dati caricati da Google Sheets modulare.' : 'Dati caricati da Database2027 legacy.');
      } else if (USE_TRANSFERS_PLACEHOLDERS) {
        markSheetsStatus('placeholder', 'Nessun foglio trovato: uso placeholder.');
      } else {
        markSheetsStatus('empty', 'Nessun dato Google Sheets trovato. Controlla nomi fogli, pubblicazione e intestazioni.');
      }
    } catch (error) {
      console.warn('ProFantasy Transfers: Google Sheets non caricato.', error);
      if (!USE_TRANSFERS_PLACEHOLDERS) {
        clearDemoDataForSheets();
        restoreDefaultTeamsIfMissing();
        markSheetsStatus('error', error?.message || 'Errore Google Sheets.');
      } else {
        restoreDefaultTeamsIfMissing();
        markSheetsStatus('placeholder', 'Errore Google Sheets: uso placeholder.');
      }
    }
  }

  window.PROFANTASY_TRANSFERS_REQUIRED_FIELDS = {
    Teams: ['team_id', 'team_name', 'short_name', 'logo', 'order', 'is_active'],
    PlayersMaster: ['player_id', 'player_name', 'role', 'position_detail', 'nationality', 'player_img', 'nationality_logo', 'current_team_id', 'is_active'],
    Movements: ['movement_id', 'player_id', 'team_id', 'section', 'from_team', 'to_team', 'price', 'from_logo', 'to_logo', 'status_label', 'order', 'is_active'],
    FantasyRatings: ['player_id', 'team_id', 'fantaindex', 'titolarita', 'bonus', 'rischio', 'impatto_minuti', 'bonus_potenziali_totali', 'prezzo_medio_asta', 'slot_asta', 'profantasy_note', 'is_active'],
    Rosters: ['team_id', 'player_id', 'shirt_number', 'order', 'is_active']
  };


  window.PROFANTASY_TEST_TRANSFER_SHEET = async function (sheetName) {
    const rows = await fetchTransferSheetRows(sheetName);
    console.log('[ProFantasy Transfers Test]', {
      sheetName,
      rows: rows.length,
      cols: rows.cols || [],
      rawRows: rows.rawRows || 0,
      firstRows: rows.slice(0, 5)
    });
    return rows;
  };


  window.PROFANTASY_DEBUG_CURRENT_TRANSFERS = function () {
    const currentTeam = teams.find(team => team.id === activeTeamId) || null;
    const byTab = Object.fromEntries(TRANSFER_TABS.map(tab => [tab, findMarketItemsForTeamAndTab(activeTeamId, tab).map(item => ({ name: item.name, teamId: item.teamId, rawTeamId: item.rawTeamId, section: item.section }))]));
    const debug = { activeTeamId, activeTab, currentTeam, marketKeys: Object.keys(marketData), byTab, sheets: transfersSheetDebug };
    console.log('[ProFantasy Transfers Current Debug]', debug);
    return debug;
  };

  window.PROFANTASY_TEST_ALL_TRANSFER_SHEETS = async function () {
    const sheetNames = window.PROFANTASY_TRANSFER_SHEETS || TRANSFERS_SHEET_NAMES;
    const result = {};
    for (const [key, configuredName] of Object.entries(sheetNames)) {
      result[key] = [];
      for (const candidate of sheetNameCandidates(key, configuredName)) {
        try {
          const rows = await fetchTransferSheetRows(candidate);
          result[key].push({
            sheet: candidate,
            rows: rows.length,
            cols: rows.cols || [],
            rawRows: rows.rawRows || 0,
            firstRows: rows.slice(0, 2)
          });
        } catch (error) {
          result[key].push({ sheet: candidate, error: error?.message || String(error) });
        }
      }
    }
    console.table(Object.entries(result).flatMap(([key, attempts]) => attempts.map(attempt => ({
      key,
      sheet: attempt.sheet,
      rows: attempt.rows ?? 0,
      rawRows: attempt.rawRows ?? 0,
      cols: Array.isArray(attempt.cols) ? attempt.cols.join(', ') : '',
      error: attempt.error || ''
    }))));
    console.log('[ProFantasy Transfers Full Test]', result);
    return result;
  };


  function player(name, source, price, role, index, note) {
    return { name, source, price, role, index, note, image: `img/database/${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.png` };
  }

  async function init() {
    await loadExternalTransfersData();
    if (!hasResolvedInitialTeam) resolveInitialTeamAndTab();
    setupNav();
    setupReveal();
    setupAnalyticsTracking();
    renderTeams();
    renderTrends();
    setupTabs();
    setupFilters();
    setupHeroCarousel();
    setupTransferCountdown();
    renderDashboard();
    trackTransferEventOnce('transfer_page_ready', {
      data_loaded: transfersSheetsLoaded,
      data_source: cleanAnalyticsText(document.documentElement.dataset.transfersSource || 'unknown'),
      teams_count: teams.length,
      default_team_id: cleanAnalyticsText(activeTeamId || '')
    }, 'page_ready_initial');
    window.requestAnimationFrame(() => {
      syncTabs();
      renderTeams();
      renderDashboard();
    });

    // V24: alcuni browser/local server possono completare il layout dopo il primo frame.
    // Questo secondo passaggio non cambia dati o grafica: assicura solo che il Player Focus
    // venga montato subito anche al primissimo caricamento.
    window.setTimeout(() => {
      syncTabs();
      renderTeams();
      renderDashboard();
    }, 120);
  }

  function setupNav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const menu = document.querySelector('[data-nav-menu]');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }

  function setupReveal() {
    const elements = document.querySelectorAll('.reveal-on-scroll');
    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach(el => observer.observe(el));
  }



  function setupHeroCarousel() {
    const root = document.querySelector('[data-hero-carousel]');
    if (!root) return;
    const cards = Array.from(root.querySelectorAll('[data-roster-card]'));
    const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
    const prev = root.querySelector('[data-hero-prev]');
    const next = root.querySelector('[data-hero-next]');
    const stage = root.querySelector('.hero-roster-stage');
    let activeIndex = cards.findIndex(card => card.querySelector('strong')?.textContent?.toLowerCase().includes('mercato'));
    if (activeIndex < 0) activeIndex = 0;

    function normalize(index) {
      return (index + cards.length) % cards.length;
    }

    function syncCarousel(scrollMobile) {
      cards.forEach((card, index) => {
        const diff = normalize(index - activeIndex);
        let position = 'hidden';
        if (diff === 0) position = 'center';
        if (diff === 1) position = 'right';
        if (diff === cards.length - 1) position = 'left';
        card.dataset.position = position;
        card.classList.toggle('is-active', position === 'center');
        card.setAttribute('aria-hidden', position === 'hidden' ? 'true' : 'false');
      });

      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
        dot.setAttribute('aria-selected', String(index === activeIndex));
      });

      /* V6: carousel mobile is absolute/3D, so we do not call scrollIntoView.
         This prevents horizontal page drift and keeps the hero perfectly centered. */
    }

    cards.forEach((card, index) => {
      card.addEventListener('click', event => {
        if (index !== activeIndex) {
          event.preventDefault();
          activeIndex = index;
          trackTransferEvent('transfer_hero_card_select', {
            card_index: index,
            card_title: cleanAnalyticsText(card.querySelector('strong')?.textContent || card.getAttribute('aria-label') || ''),
            interaction_source: 'click'
          });
          syncCarousel(true);
        }
      });
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activeIndex = index;
          trackTransferEvent('transfer_hero_card_select', {
            card_index: index,
            card_title: cleanAnalyticsText(card.querySelector('strong')?.textContent || card.getAttribute('aria-label') || ''),
            interaction_source: 'keyboard'
          });
          syncCarousel(true);
        }
      });
    });

    dots.forEach(dot => dot.addEventListener('click', () => {
      activeIndex = Number(dot.dataset.heroDot || 0);
      trackTransferEvent('transfer_hero_carousel_nav', {
        interaction_source: 'dot',
        card_index: activeIndex
      });
      syncCarousel(true);
    }));

    let touchStartX = 0;
    let touchStartY = 0;
    root.addEventListener('touchstart', event => {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    root.addEventListener('touchend', event => {
      const touch = event.changedTouches && event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) return;
      const direction = deltaX < 0 ? 'next' : 'prev';
      activeIndex = normalize(activeIndex + (direction === 'next' ? 1 : -1));
      trackTransferEvent('transfer_hero_swipe', {
        swipe_direction: direction,
        card_index: activeIndex
      });
      syncCarousel(false);
    }, { passive: true });

    prev?.addEventListener('click', () => {
      activeIndex = normalize(activeIndex - 1);
      trackTransferEvent('transfer_hero_carousel_nav', {
        interaction_source: 'arrow',
        arrow_direction: 'prev',
        card_index: activeIndex
      });
      syncCarousel(true);
    });

    next?.addEventListener('click', () => {
      activeIndex = normalize(activeIndex + 1);
      trackTransferEvent('transfer_hero_carousel_nav', {
        interaction_source: 'arrow',
        arrow_direction: 'next',
        card_index: activeIndex
      });
      syncCarousel(true);
    });

    /* V6: no mobile scroll listener. Navigation is handled by arrows, dots, click, keyboard and swipe. */

    syncCarousel(false);
  }

  function setupTransferCountdown() {
    const panel = document.querySelector('[data-transfer-deadline]');
    if (!panel) return;
    const target = new Date(panel.dataset.transferDeadline).getTime();
    const daysEl = panel.querySelector('[data-deadline-days]');
    const hoursEl = panel.querySelector('[data-deadline-hours]');
    const minutesEl = panel.querySelector('[data-deadline-minutes]');
    const secondsEl = panel.querySelector('[data-deadline-seconds]');
    if (!target || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    function update() {
      const distance = Math.max(0, target - Date.now());
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    }

    update();
    window.setInterval(update, 1000);
  }

  function setUpdateTime() {
    const now = new Date();
    const dateEl = document.querySelector('[data-update-date]');
    const timeEl = document.querySelector('[data-update-time]');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }


  function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));
  }

  function normalizeTrendScore(value) {
    const text = String(value ?? '').trim();
    if (!text) return '+0';
    return /^[+-]/.test(text) ? text : `+${text}`;
  }

  function trendImageName(name, index) {
    const slug = String(name || `trend-${index + 1}`)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `img/database/${slug || `trend-${index + 1}`}.png`;
  }


  function isMobileTransfersView() {
    return window.matchMedia('(max-width: 760px)').matches;
  }

  function scrollActiveClubIntoView() {
    if (!isMobileTransfersView() || !teamList) return;
    const active = teamList.querySelector('.club-chip.active');
    if (!active) return;
    window.requestAnimationFrame(() => active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
  }

  function scrollActiveTabIntoView() {
    if (!isMobileTransfersView()) return;
    const activeTabButton = document.querySelector('.graal-tabs [data-tab].active');
    if (!activeTabButton) return;
    window.requestAnimationFrame(() => activeTabButton.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }));
  }

  function scrollCarousel(container, direction = 1) {
    if (!container) return;
    const firstItem = container.querySelector('button, .club-chip');
    const amount = firstItem ? firstItem.getBoundingClientRect().width + 18 : container.clientWidth * 0.82;
    container.scrollBy({ left: amount * direction, behavior: 'smooth' });
  }

  function ensureClubMobileControls() {
    const panel = document.querySelector('.clubs-panel');
    if (!panel || panel.querySelector('[data-club-carousel-prev]')) return;
    const controls = document.createElement('div');
    controls.className = 'pf-mobile-carousel-controls pf-club-mobile-controls';
    controls.innerHTML = `
      <button type="button" data-club-carousel-prev aria-label="Squadra precedente">‹</button>
      <span>Scorri squadre</span>
      <button type="button" data-club-carousel-next aria-label="Squadra successiva">›</button>
    `;
    panel.appendChild(controls);
    controls.querySelector('[data-club-carousel-prev]')?.addEventListener('click', () => scrollCarousel(teamList, -1));
    controls.querySelector('[data-club-carousel-next]')?.addEventListener('click', () => scrollCarousel(teamList, 1));
  }

  function ensureTabMobileControls() {
    const tabs = document.querySelector('.graal-tabs');
    if (!tabs || tabs.parentElement?.querySelector('[data-tab-carousel-prev]')) return;
    const controls = document.createElement('div');
    controls.className = 'pf-mobile-carousel-controls pf-tabs-mobile-controls';
    controls.innerHTML = `
      <button type="button" data-tab-carousel-prev aria-label="Sezione precedente">‹</button>
      <span>Scorri sezioni</span>
      <button type="button" data-tab-carousel-next aria-label="Sezione successiva">›</button>
    `;
    tabs.insertAdjacentElement('afterend', controls);
    controls.querySelector('[data-tab-carousel-prev]')?.addEventListener('click', () => scrollCarousel(tabs, -1));
    controls.querySelector('[data-tab-carousel-next]')?.addEventListener('click', () => scrollCarousel(tabs, 1));
  }

  function renderTeams() {
    if (!teamList) return;

    if (!teams.length) {
      teamList.innerHTML = '<div class="empty-state empty-state-wide">Nessuna squadra disponibile al momento. Torna più tardi per consultare il mercato aggiornato.</div>';
      return;
    }

    teamList.innerHTML = teams.map(team => `
      <button class="team-button club-chip ${team.id === activeTeamId ? 'active' : ''}" type="button" data-team-id="${team.id}" aria-pressed="${team.id === activeTeamId}">
        <span class="club-logo-wrap"><img src="${team.logo || `img/clubs/${team.id}.png`}" alt="${team.name}" loading="lazy" /></span>
        <span class="club-code">${team.short}</span>
        <small>${team.name}</small>
      </button>
    `).join('');

    teamList.querySelectorAll('[data-team-id]').forEach(button => {
      button.addEventListener('click', () => {
        const selectedTeamId = button.dataset.teamId;
        const selectedTeam = teams.find(team => team.id === selectedTeamId) || {};
        trackTransferEvent('transfer_team_select', {
          selected_team_id: cleanAnalyticsText(selectedTeamId || ''),
          selected_team_name: cleanAnalyticsText(selectedTeam.name || selectedTeamId || ''),
          previous_team_id: cleanAnalyticsText(activeTeamId || ''),
          interaction_source: 'club_grid'
        });
        activeTeamId = selectedTeamId;
        activeTab = 'official-in';
        activePlayerIndex = 0;
        playerSearchTerm = '';
        playerSortMode = 'order';
        renderTeams();
        syncTabs();
        renderDashboard();
        scrollActiveClubIntoView();
        scrollActiveTabIntoView();
        document.getElementById('team-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    ensureClubMobileControls();
    scrollActiveClubIntoView();
  }

  function renderTrends() {
    if (!trendList) return;
    if (!trends.length) {
      trendList.innerHTML = '<li class="trend-item trend-empty">Nessun trend FantaIndex disponibile al momento.</li>';
      return;
    }
    trendList.innerHTML = trends.map((raw, index) => {
      const item = Array.isArray(raw)
        ? { name: raw[0], team: raw[1], score: raw[2], image: trendImageName(raw[0], index) }
        : { image: trendImageName(raw.name, index), ...raw };

      const name = escapeHTML(item.name || 'Giocatore da aggiornare');
      const team = escapeHTML(item.team || 'Squadra');
      const score = escapeHTML(normalizeTrendScore(item.score));
      const image = escapeHTML(item.image || trendImageName(item.name, index));

      return `
        <li class="trend-item">
          <span class="trend-rank">${index + 1}</span>
          <span class="trend-avatar"><img src="${image}" alt="${name}" loading="lazy" /></span>
          <span class="trend-player-copy">
            <strong title="${name}">${name}</strong>
            <small>${team}</small>
          </span>
          <span class="trend-score">${score}</span>
        </li>
      `;
    }).join('');

    trendList.querySelectorAll('.trend-avatar img').forEach((img) => {
      img.onerror = () => {
        img.style.display = 'none';
        img.closest('.trend-avatar')?.classList.add('is-empty');
      };
    });
  }

  function setupTabs() {
    ensureTabMobileControls();
    document.querySelectorAll('[data-tab]').forEach(button => {
      button.addEventListener('click', () => {
        const nextTab = normalizeSection(button.dataset.tab || 'official-in');
        trackTransferEvent('transfer_tab_select', {
          selected_tab: cleanAnalyticsText(nextTab),
          previous_tab: cleanAnalyticsText(activeTab || ''),
          interaction_source: 'tab_button'
        });
        activeTab = nextTab;
        activePlayerIndex = 0;
        playerSearchTerm = '';
        playerSortMode = 'order';
        syncTabs();
        renderMarketList();
        scrollActiveTabIntoView();
      });
    });
    document.querySelector('[data-roster-scroll]')?.addEventListener('click', () => {
      trackTransferEvent('transfer_roster_cta_click', {
        selected_tab: 'roster',
        interaction_source: 'team_hero_button'
      });
      activeTab = 'roster';
      activePlayerIndex = 0;
      playerSearchTerm = '';
      playerSortMode = 'order';
      syncTabs();
      renderMarketList();
      scrollActiveTabIntoView();
    });
  }

  function setupFilters() {
    [roleFilter, typeFilter, indexFilter].forEach(input => input?.addEventListener('input', () => {
      if (indexValue && indexFilter) indexValue.textContent = indexFilter.value;
      if (typeFilter?.value && typeFilter.value !== 'all') {
        activeTab = typeFilter.value;
        syncTabs();
      }
      activePlayerIndex = 0;
      renderMarketList();
    }));
    document.querySelector('[data-reset-filters]')?.addEventListener('click', () => {
      roleFilter.value = 'all';
      typeFilter.value = 'all';
      indexFilter.value = 0;
      indexValue.textContent = '0';
      activePlayerIndex = 0;
      renderMarketList();
    });
  }

  function syncTabs() {
    if (activeTab === 'impact') activeTab = 'official-in';
    document.querySelectorAll('[data-tab]').forEach(button => button.classList.toggle('active', normalizeSection(button.dataset.tab) === activeTab));
    if (typeFilter && ['official-in', 'official-out', 'rumor', 'roster'].includes(activeTab)) typeFilter.value = activeTab;
    scrollActiveTabIntoView();
  }


  function applyImageFallback(img, fallbackText = '') {
    if (!img) return;
    const parent = img.closest('.team-crest-main, .team-card-badge');
    const label = parent ? parent.querySelector('span') : null;
    img.onerror = () => {
      img.style.display = 'none';
      if (label) {
        label.textContent = fallbackText;
        label.style.display = 'grid';
      }
      if (parent) parent.classList.add('is-fallback');
    };
    img.onload = () => {
      img.style.display = '';
      if (label) label.style.display = 'none';
      if (parent) parent.classList.remove('is-fallback');
    };
  }


  function renderSegmentedBar(name, value) {
    const bar = document.querySelector(`[data-segmented-bar="${name}"]`);
    if (!bar) return;

    const numericValue = Math.max(0, Math.min(100, Number(value) || 0));
    const activeSegments = Math.round(numericValue / 10);
    const level = numericValue >= 80 ? 'high' : numericValue >= 65 ? 'mid' : 'low';

    bar.classList.remove('is-low', 'is-mid', 'is-high');
    bar.classList.add(`is-${level}`);
    bar.setAttribute('aria-label', `${numericValue} su 100`);

    bar.innerHTML = Array.from({ length: 10 }, (_, index) => {
      const active = index < activeSegments ? ' is-active' : '';
      return `<span class="segment${active}"></span>`;
    }).join('');
  }

  function setupCompositionIcons() {
    document.querySelectorAll('[data-composition-icon]').forEach((img) => {
      img.onerror = () => {
        const wrap = img.closest('.composition-icon');
        if (wrap) wrap.classList.add('is-empty');
        img.style.display = 'none';
      };
      img.onload = () => {
        const wrap = img.closest('.composition-icon');
        if (wrap) wrap.classList.remove('is-empty');
        img.style.display = '';
      };
    });
  }


  function renderPfMeter(name, value) {
    const meter = document.querySelector(`[data-pf-meter="${name}"]`);
    if (!meter) return;

    const numericValue = Math.max(0, Math.min(100, Number(value) || 0));
    const activeSegments = Math.max(0, Math.min(10, Math.round(numericValue / 10)));
    const level = numericValue >= 80 ? 'high' : numericValue >= 65 ? 'mid' : 'low';

    meter.className = `pf-meter-segments is-${level}`;
    meter.setAttribute('aria-label', `${numericValue} su 100`);

    meter.innerHTML = Array.from({ length: 10 }, (_, index) => {
      return `<i class="${index < activeSegments ? 'is-on' : ''}"></i>`;
    }).join('');
  }

  function setupPfMeterIcons() {
    document.querySelectorAll('.pf-meter-icon img').forEach((img) => {
      img.onerror = () => {
        img.style.display = 'none';
        img.closest('.pf-meter-icon')?.classList.add('is-empty');
      };
      img.onload = () => {
        img.style.display = '';
        img.closest('.pf-meter-icon')?.classList.remove('is-empty');
      };
    });
  }

  function renderDashboard() {
    if (!activeTeamId && teams.length) resolveInitialTeamAndTab();
    const team = teams.find(item => item.id === activeTeamId) || teams[0];

    if (!team) {
      if (marketList) marketList.innerHTML = '<div class="empty-state">Nessuna squadra disponibile al momento.</div>';
      return;
    }

    applyTeamVisualTheme(team);
    const total = Math.round((team.attack + team.mid + team.def) / 3);
    const badgeEl = document.querySelector('[data-selected-team-badge]');
    const nameEl = document.querySelector('[data-selected-team-name]');
    const summaryEl = document.querySelector('[data-selected-team-summary]');
    const logoEl = document.querySelector('[data-selected-team-logo]');
    const ghostLogoEl = document.querySelector('[data-selected-team-logo-ghost]');
    const bgEl = document.querySelector('[data-selected-team-bg]');
    if (badgeEl) badgeEl.textContent = team.short;
    if (nameEl) nameEl.innerHTML = `${team.name}<br>Transfer Center`;
    if (summaryEl) summaryEl.textContent = 'Analisi completa del mercato e impatto sulla rosa fantasy.';
    if (logoEl) {
      logoEl.src = team.logo || `img/clubs/${team.id}.png`;
      logoEl.alt = `Logo ${team.name}`;
      applyImageFallback(logoEl, team.short);
    }
    if (ghostLogoEl) {
      ghostLogoEl.src = team.logo || `img/clubs/${team.id}.png`;
      ghostLogoEl.alt = '';
      ghostLogoEl.onerror = () => { ghostLogoEl.style.display = 'none'; };
      ghostLogoEl.onload = () => { ghostLogoEl.style.display = ''; };
    }
    if (bgEl) bgEl.style.backgroundImage = `url('${team.cardBg || `img/clubcard-bg/${team.id}-transfer-center.jpg`}')`;
    const statusEl = document.querySelector('[data-team-status]');
    const attackScoreEl = document.querySelector('[data-attack-score]');
    const midScoreEl = document.querySelector('[data-mid-score]');
    const defScoreEl = document.querySelector('[data-def-score]');
    if (statusEl) statusEl.textContent = team.status;
    if (attackScoreEl) attackScoreEl.textContent = team.attack;
    if (midScoreEl) midScoreEl.textContent = team.mid;
    if (defScoreEl) defScoreEl.textContent = team.def;
    const totalEl = document.querySelector('[data-total-score]');
    if (totalEl) totalEl.textContent = total;
    const attackBar = document.querySelector('[data-bar-attack]');
    const midBar = document.querySelector('[data-bar-mid]');
    const defBar = document.querySelector('[data-bar-def]');
    if (attackBar) attackBar.style.width = `${team.attack}%`;
    if (midBar) midBar.style.width = `${team.mid}%`;
    if (defBar) defBar.style.width = `${team.def}%`;
    renderSegmentedBar('attack', team.attack);
    renderSegmentedBar('midfield', team.mid);
    renderSegmentedBar('defense', team.def);
    setupCompositionIcons();
    renderPfMeter('attack', team.attack);
    renderPfMeter('midfield', team.mid);
    renderPfMeter('defense', team.def);
    setupPfMeterIcons();
    const focus = document.querySelector('[data-focus-text]');
    if (focus) focus.textContent = team.focus;
    renderTopIndex(team);
    renderMarketList();
  }

  function renderTopIndex(team) {
    const list = document.querySelector('[data-top-index-list]');
    if (!list) return;
    const items = topIndexData[team.id] || (USE_TRANSFERS_PLACEHOLDERS ? topIndexFallback.map((item, idx) => ({ ...item, team: team.name, image: `img/database/${team.id}-top-${idx + 1}.png` })) : []);

    if (!items.length) {
      list.innerHTML = '<div class="empty-state">Top FantaIndex in aggiornamento per questa squadra.</div>';
      return;
    }

    list.innerHTML = items.slice(0, 3).map((item, index) => `
      <article class="top-index-card">
        <span class="top-index-rank">${index + 1}</span>
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div>
          <strong>${item.name}</strong>
          <small>${item.role} · ${item.team}</small>
        </div>
        <b>${item.index}</b>
      </article>
    `).join('');
  }

  function getTransferEmptyMessage(tab, team) {
    const teamName = team?.name || 'questa squadra';
    const messages = {
      'official-in': {
        title: `Nessun acquisto registrato per ${teamName}.`,
        text: 'Quando arriverà un nuovo movimento, qui troverai valore, provenienza e lettura fantasy immediata.'
      },
      'official-out': {
        title: `Nessuna cessione registrata per ${teamName}.`,
        text: 'Le uscite ufficiali verranno aggiornate con destinazione, valore e impatto sulla rosa.'
      },
      rumor: {
        title: `Nessun rumor attivo per ${teamName}.`,
        text: 'Le trattative monitorate appariranno qui con club di provenienza, valore e rischio fantasy.'
      },
      loan: {
        title: `Nessun prestito monitorato per ${teamName}.`,
        text: 'I prestiti rilevanti verranno mostrati qui con nazionalità, valore e possibile impatto al fantacalcio.'
      },
      roster: {
        title: `Rosa di ${teamName} non ancora caricata.`,
        text: 'Quando compilerai la rosa, qui vedrai FantaIndex, ruolo, nazionalità e radar ProFantasy.'
      },
      impact: {
        title: `Analisi fantasy non ancora disponibile per ${teamName}.`,
        text: 'Gli insight verranno mostrati qui appena saranno caricati i profili da valutare.'
      }
    };
    return messages[tab] || {
      title: `Nessun dato disponibile per ${teamName}.`,
      text: 'I dati verranno aggiornati quando saranno disponibili nuovi profili.'
    };
  }

  function getCurrentItems() {
    const canonicalTeamId = resolveTeamId(activeTeamId) || activeTeamId;
    if (canonicalTeamId && canonicalTeamId !== activeTeamId) activeTeamId = canonicalTeamId;
    const items = findMarketItemsForTeamAndTab(activeTeamId, activeTab);
    const fallbackItems = (!items.length && USE_TRANSFERS_PLACEHOLDERS) ? (fallbackData[activeTab] || []) : [];
    const minIndex = Number(indexFilter?.value || 0);
    const role = roleFilter?.value || 'all';
    const query = normalizeKey(playerSearchTerm);

    const filtered = (items.length ? items : fallbackItems)
      .filter(item => item && !isPlaceholderValue(item.name))
      .filter(item => (role === 'all' || item.role === role) && Number(item.index || 0) >= minIndex)
      .filter(item => {
        if (!query) return true;
        const haystack = normalizeKey([
          item.name,
          item.role,
          item.roleName,
          item.note,
          item.fromTeam,
          item.toTeam,
          item.nationality,
          item.slotAsta
        ].filter(Boolean).join(' '));
        return haystack.includes(query);
      });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (playerSortMode === 'az') return String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' });
      if (playerSortMode === 'za') return String(b.name || '').localeCompare(String(a.name || ''), 'it', { sensitivity: 'base' });
      if (playerSortMode === 'role') {
        const roleOrder = { P: 1, D: 2, C: 3, A: 4 };
        const ar = roleOrder[roleFamily(a.role)] || 9;
        const br = roleOrder[roleFamily(b.role)] || 9;
        return (ar - br) || String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' });
      }
      if (playerSortMode === 'overall') {
        const av = getSmartPlayerValues(a).overall;
        const bv = getSmartPlayerValues(b).overall;
        return (bv - av) || String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' });
      }
      return (Number(a.order || 999) - Number(b.order || 999)) || String(a.name || '').localeCompare(String(b.name || ''), 'it', { sensitivity: 'base' });
    });

    return sorted;
  }

  function clampNumber(value, min = 0, max = 100) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    return Math.max(min, Math.min(max, numeric));
  }

  function roleFamily(role) {
    const value = String(role || '').trim().toUpperCase();
    if (value.startsWith('P')) return 'P';
    if (value.startsWith('D')) return 'D';
    if (value.startsWith('A')) return 'A';
    return 'C';
  }

  function fallbackBonusByRole(role, index) {
    const fam = roleFamily(role);
    const base = fam === 'A' ? 76 : fam === 'C' ? 62 : fam === 'D' ? 45 : 28;
    return clampNumber(Math.round(base + ((Number(index) || 70) - 70) * 0.45), 12, 95);
  }

  function priceConvenience(price, overallBase = 70, bonusPotenzialiTotali = NaN, prezzoMedioAsta = NaN) {
    const bonusTotali = Number(bonusPotenzialiTotali);
    const prezzoAsta = Number(prezzoMedioAsta);

    /* V36:
       Convenienza = rapporto tra bonus potenziali totali (G+A) e prezzo medio asta su 1000 crediti.
       Formula:
       bonusRatio = bonusTotali / prezzoAsta * 1000
       convenienza = bonusRatio * 1.6, limitata tra 0 e 100

       Esempio:
       15 bonus potenziali a 350 crediti:
       15 / 350 * 1000 = 42.86
       42.86 * 1.6 = 68.6 => 69/100
    */
    if (Number.isFinite(bonusTotali) && bonusTotali > 0 && Number.isFinite(prezzoAsta) && prezzoAsta > 0) {
      return clampNumber(Math.round((bonusTotali / prezzoAsta) * 1000 * 1.6), 0, 100);
    }

    const text = String(price || '').toLowerCase();
    if (/parametro|zero|svincol/.test(text)) return 91;
    if (/prestito|loan/.test(text)) return 84;
    if (/rumor|probabil|%/.test(text)) return 70;
    const match = text.replace(',', '.').match(/\d+(?:\.\d+)?/);
    if (!match) return 70;
    const n = Number(match[0]);
    let score = 70;
    if (n <= 5) score = 92;
    else if (n <= 10) score = 85;
    else if (n <= 20) score = 76;
    else if (n <= 35) score = 64;
    else if (n <= 55) score = 55;
    else score = 46;
    return clampNumber(Math.round(score * 0.72 + (Number(overallBase) || 70) * 0.28), 35, 96);
  }

  function getSmartPlayerValues(item) {
    const fantaindex = clampNumber(Number(item.index) || 70, 0, 100);
    const titolarita = clampNumber(Number.isFinite(item.titolarita) ? item.titolarita : Math.max(45, Math.min(92, fantaindex + 6)), 0, 100);
    const bonus = clampNumber(Number.isFinite(item.bonus) ? item.bonus : fallbackBonusByRole(item.role, fantaindex), 0, 100);
    const rischio = clampNumber(Number.isFinite(item.rischio) ? item.rischio : Math.max(18, Math.min(72, 100 - titolarita + 22)), 0, 100);
    const minuti = clampNumber(Number.isFinite(item.minutesImpact) ? item.minutesImpact : Math.round(titolarita * 0.86 + fantaindex * 0.14), 0, 100);
    const sicurezza = clampNumber(100 - rischio, 0, 100);
    const convenienceInputBonus = Number.isFinite(item.bonusPotenzialiTotali) ? item.bonusPotenzialiTotali : NaN;
    const convenienceInputPrice = Number.isFinite(item.prezzoMedioAsta) ? item.prezzoMedioAsta : NaN;
    let raw;
    switch (roleFamily(item.role)) {
      case 'P': raw = fantaindex * 0.35 + titolarita * 0.30 + sicurezza * 0.20 + minuti * 0.10 + priceConvenience(item.price, fantaindex, convenienceInputBonus, convenienceInputPrice) * 0.05; break;
      case 'D': raw = fantaindex * 0.30 + titolarita * 0.25 + bonus * 0.20 + sicurezza * 0.15 + priceConvenience(item.price, fantaindex, convenienceInputBonus, convenienceInputPrice) * 0.10; break;
      case 'A': raw = bonus * 0.35 + fantaindex * 0.25 + titolarita * 0.20 + minuti * 0.10 + sicurezza * 0.10; break;
      default: raw = fantaindex * 0.30 + bonus * 0.25 + titolarita * 0.20 + minuti * 0.15 + sicurezza * 0.10;
    }
    const convenience = priceConvenience(item.price, raw, convenienceInputBonus, convenienceInputPrice);
    const calculatedOverall = Math.round(55 + clampNumber(raw, 0, 100) * 0.39);
    const overall = Number.isFinite(item.manualOverall) ? clampNumber(Math.round(item.manualOverall), 55, 94) : clampNumber(calculatedOverall, 55, 94);
    return { fantaindex: Math.round(fantaindex), titolarita: Math.round(titolarita), bonus: Math.round(bonus), rischio: Math.round(rischio), sicurezza: Math.round(sicurezza), minuti: Math.round(minuti), convenience: Math.round(convenience), overall: Math.round(overall) };
  }

  function getSmartBadges(item, values) {
    const badges = [];
    if (values.overall >= 86) badges.push(['Top target', 'elite']);
    else if (values.overall >= 78) badges.push(['Ottimo slot', 'strong']);
    else if (values.overall < 68) badges.push(['Scommessa', 'warning']);

    if (values.titolarita >= 85) badges.push(['Titolare', 'safe']);
    else if (values.titolarita >= 62) badges.push(['Ballottaggio +', 'mid']);
    else badges.push(['Da monitorare', 'warning']);

    if (values.bonus >= 80) badges.push(['Bonus alto', 'bonus']);
    else if (values.bonus >= 62) badges.push(['Bonus medio', 'mid']);

    if (values.rischio >= 70) badges.push(['Rischio turnover', 'risk']);
    else if (values.rischio <= 35) badges.push(['Profilo sicuro', 'safe']);

    if (item.slotAsta) badges.push([item.slotAsta, 'slot']);
    return badges.slice(0, 5);
  }

  function createRadarSvg(values, compact = false) {
    const axes = [
      ['FantaIndex', values.fantaindex],
      ['Titolarità', values.titolarita],
      ['Bonus', values.bonus],
      ['Sicurezza', values.sicurezza],
      ['Minuti', values.minuti],
      ['Convenienza', values.convenience]
    ];
    const size = compact ? 220 : 318;
    const center = size / 2;
    const radius = compact ? 72 : 98;
    const pointsFor = (factor) => axes.map(([, value], index) => {
      const angle = -Math.PI / 2 + index * ((Math.PI * 2) / axes.length);
      const r = radius * factor * (Number(value) / 100);
      return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
    }).join(' ');
    const grid = [0.25, 0.5, 0.75, 1].map(factor => {
      const p = axes.map((_, index) => {
        const angle = -Math.PI / 2 + index * ((Math.PI * 2) / axes.length);
        return `${center + Math.cos(angle) * radius * factor},${center + Math.sin(angle) * radius * factor}`;
      }).join(' ');
      return `<polygon points="${p}" class="pf-radar-grid" />`;
    }).join('');
    const spokes = axes.map((_, index) => {
      const angle = -Math.PI / 2 + index * ((Math.PI * 2) / axes.length);
      return `<line x1="${center}" y1="${center}" x2="${center + Math.cos(angle) * radius}" y2="${center + Math.sin(angle) * radius}" class="pf-radar-spoke" />`;
    }).join('');
    const labels = axes.map(([label, value], index) => {
      const angle = -Math.PI / 2 + index * ((Math.PI * 2) / axes.length);
      const labelRadius = radius + (compact ? 24 : 46);
      const x = center + Math.cos(angle) * labelRadius;
      const y = center + Math.sin(angle) * labelRadius;
      return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="pf-radar-label pf-radar-label-${normalizeKey(label)}"><tspan>${escapeHTML(label)}</tspan><tspan x="${x}" dy="14">${Math.round(value)}</tspan></text>`;
    }).join('');
    return `
      <svg class="pf-radar-svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Radar ProFantasy giocatore">
        <defs>
          <radialGradient id="pfRadarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="rgba(0,220,255,.46)" />
            <stop offset="72%" stop-color="rgba(169,77,255,.24)" />
            <stop offset="100%" stop-color="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <circle cx="${center}" cy="${center}" r="${radius + 18}" class="pf-radar-halo" />
        ${grid}${spokes}
        <polygon points="${pointsFor(1)}" class="pf-radar-shape" />
        <polygon points="${pointsFor(1)}" class="pf-radar-line" />
        <circle cx="${center}" cy="${center}" r="30" class="pf-radar-core" />
        ${labels}
      </svg>`;
  }

  function renderPlayerInsightPanel(item, values) {
    const panel = document.querySelector('[data-player-radar-slot]') || document.querySelector('.graal-right .squad-composition');
    if (!panel) return;
    if (!item || !values) {
      panel.innerHTML = '';
      return;
    }
    const badges = getSmartBadges(item, values).slice(0, 4).map(([label, type]) => `<span class="pf-smart-badge is-${type}">${escapeHTML(label)}</span>`).join('');
    const tier = getOverallTier(values.overall);
    panel.classList.add('pf-player-radar-panel');
    panel.innerHTML = `
      <div class="pf-player-radar-head">
        <span>Analisi ProFantasy</span>
        <b>Player Focus</b>
      </div>
      <div class="pf-player-radar-wrap">
        ${createRadarSvg(values)}
        <div class="pf-radar-overall-core pf-overall-tier is-${tier.key}">
          <strong>${values.overall}</strong>
          <span>PF Overall</span>
        </div>
      </div>
      <div class="pf-radar-badges">${badges}</div>
      <div class="pf-player-insight-box">
        <strong>${escapeHTML(item.name)}, lettura fantasy</strong>
        <p>${escapeHTML(item.profantasyNote || item.note || 'Profilo da valutare in base a prezzo, titolarità e ruolo nel nuovo contesto tecnico.')}</p>
      </div>
    `;
  }

  function renderSmartPlayerCard(item, isActive, index, values) {
    const nameParts = splitPlayerName(item.name);
    const fullRole = getRoleFullLabel(item.role);
    const detail = getPositionDetail(item);
    const firstLen = String(nameParts.first || '').length;
    const lastLen = String(nameParts.last || '').length;
    const maxNameLen = Math.max(firstLen, lastLen);
    const nameClass = maxNameLen >= 18 ? 'is-name-xxl' : maxNameLen >= 15 ? 'is-name-xl' : maxNameLen >= 11 ? 'is-name-long' : '';
    const metric = getPlayerPrimaryMetric(item, values, activeTab);
    const tier = getOverallTier(values?.overall || item.manualOverall || item.index || 55);
    const nationality = cleanSheetText(item.nationality || item.nazione || item.country || 'Nazionalità da aggiornare');
    const nationalityImg = cleanSheetText(item.nationalityLogo || item.flagImage || item.originLogo || 'img/database/player-flag.png');
    const route = getTransferRouteMeta(item, activeTab);
    const focusRoute = route ? `
          <div class="pf-focus-transfer-route" aria-label="Percorso trasferimento">
            <span class="pf-route-club pf-route-from">
              <img src="${escapeHTML(route.fromLogo)}" alt="" loading="lazy" />
              <b>${escapeHTML(route.fromName)}</b>
            </span>
            <span class="pf-route-arrows" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="pf-route-club pf-route-to">
              <img src="${escapeHTML(route.toLogo)}" alt="" loading="lazy" />
              <b>${escapeHTML(route.toName)}</b>
            </span>
          </div>` : '';

    return `
      <article class="pf-player-focus-card pf-player-card-v42 pf-player-card-v39 pf-overall-tier is-${tier.key} tier-${tier.key} ${isActive ? 'is-active' : ''}" data-player-index="${index}" tabindex="0" aria-label="Seleziona ${escapeHTML(item.name)}">
        <div class="pf-player-card-bg-lines" aria-hidden="true"></div>

        <div class="pf-player-focus-copy">
          <span class="player-tag">${escapeHTML(item.tag || tabLabel(activeTab))}</span>
          <strong class="pf-player-name ${nameClass}">
            <span class="pf-player-first-name">${escapeHTML(nameParts.first)}</span>
            <span class="pf-player-last-name">${escapeHTML(nameParts.last)}</span>
          </strong>
          <small class="pf-player-speciality">
            <b>${escapeHTML(item.role)}</b>
            <span>${escapeHTML(fullRole)}</span>
            <em>${escapeHTML(detail)}</em>
          </small>
          ${focusRoute}
          <div class="player-origin is-nationality">
            <img src="${escapeHTML(nationalityImg)}" alt="" loading="lazy" />
            <b>${escapeHTML(nationality)}</b>
          </div>
        </div>

        <div class="pf-player-primary-metric pf-overall-tier is-${tier.key} tier-${tier.key}">
          <span>OVR</span>
          <strong>${escapeHTML(metric.value)}</strong>
          <em>${escapeHTML(tier.label)}</em>
        </div>
      </article>
    `;
  }

  function findTransferTeamMeta(value) {
    const key = normalizeKey(value || '');
    if (!key) return null;
    return teams.find(team => (
      normalizeKey(team.id) === key ||
      normalizeKey(team.name) === key ||
      normalizeKey(team.short) === key
    )) || null;
  }

  function firstRouteValue(values) {
    for (const value of values) {
      const cleaned = cleanSheetText(value);
      if (cleaned) return cleaned;
    }
    return '';
  }

  function getTeamLogoFallback(name, explicitLogo = '') {
    const explicit = cleanSheetText(explicitLogo);
    if (explicit) return explicit;
    const meta = findTransferTeamMeta(name);
    if (meta?.logo) return meta.logo;
    const slug = slugify(name || '');
    if (slug) return `img/clubs/${slug}.png`;
    return 'img/database/player-flag.png';
  }

  function getTransferRouteMeta(item, tab) {
    const normalizedTab = normalizeSection(tab);
    if (!['official-in', 'official-out', 'rumor'].includes(normalizedTab)) return null;

    const selectedTeam = teams.find(team => team.id === activeTeamId) || teams[0] || {};
    const selectedTeamName = cleanSheetText(selectedTeam.name || selectedTeam.short || activeTeamId || 'Club selezionato');
    const selectedTeamLogo = cleanSheetText(selectedTeam.logo || `img/clubs/${activeTeamId}.png`);

    const fromTeamRaw = firstRouteValue([item.fromTeam, item.from_team, item.sourceTeam, item.source_team, item.provenienza]);
    const toTeamRaw = firstRouteValue([item.toTeam, item.to_team, item.destinationTeam, item.destination_team, item.destinazione]);
    const sourceRaw = firstRouteValue([item.source, item.sorgente]);

    const fromName = normalizedTab === 'official-out'
      ? firstRouteValue([fromTeamRaw, selectedTeamName, sourceRaw])
      : firstRouteValue([fromTeamRaw, sourceRaw, 'Da aggiornare']);

    const toName = normalizedTab === 'official-out'
      ? firstRouteValue([toTeamRaw, sourceRaw, 'Da aggiornare'])
      : firstRouteValue([toTeamRaw, selectedTeamName, 'Da aggiornare']);

    const explicitFromLogo = firstRouteValue([item.fromLogo, item.from_logo, item.fromTeamLogo, item.from_team_logo, item.sourceLogo, item.source_logo]);
    const explicitToLogo = firstRouteValue([item.toLogo, item.to_logo, item.toTeamLogo, item.to_team_logo, item.destinationLogo, item.destination_logo]);

    const fromLogo = normalizedTab === 'official-out'
      ? getTeamLogoFallback(fromName, explicitFromLogo || selectedTeamLogo)
      : getTeamLogoFallback(fromName, explicitFromLogo || item.originLogo || item.clubLogo || item.teamLogo || item.nationalityLogo || item.flagImage);

    const toLogo = normalizedTab === 'official-out'
      ? getTeamLogoFallback(toName, explicitToLogo || item.originLogo || item.clubLogo || item.teamLogo || item.nationalityLogo || item.flagImage)
      : getTeamLogoFallback(toName, explicitToLogo || selectedTeamLogo);

    return {
      fromName: fromName || 'Da aggiornare',
      toName: toName || 'Da aggiornare',
      fromLogo: fromLogo || 'img/database/player-flag.png',
      toLogo: toLogo || 'img/database/player-flag.png'
    };
  }

  function renderPlayerListCard(item, index, values) {
    const fullRole = getRoleFullLabel(item.role);
    const detail = getPositionDetail(item);
    const overall = Math.round(values?.overall || item.manualOverall || item.index || 55);
    const tier = getOverallTier(overall);
    const nationality = cleanSheetText(item.nationality || item.nazione || item.country || 'Nazionalità da aggiornare');
    const logo = cleanSheetText(item.originLogo || item.clubLogo || item.teamLogo || item.nationalityLogo || item.flagImage || 'img/database/player-flag.png');
    const role = cleanSheetText(item.role || 'R');
    const micro = [role, fullRole, detail].filter(Boolean).join(' · ');
    const route = getTransferRouteMeta(item, activeTab);
    const lowerContent = route ? `
          <div class="pf-list-transfer-route" aria-label="Percorso trasferimento">
            <span class="pf-route-club pf-route-from">
              <img src="${escapeHTML(route.fromLogo)}" alt="" loading="lazy" />
              <b>${escapeHTML(route.fromName)}</b>
            </span>
            <span class="pf-route-arrows" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="pf-route-club pf-route-to">
              <img src="${escapeHTML(route.toLogo)}" alt="" loading="lazy" />
              <b>${escapeHTML(route.toName)}</b>
            </span>
          </div>` : `<em class="pf-list-player-origin">${escapeHTML(nationality)}</em>`;

    return `
      <article class="pf-player-list-card-v46 pf-overall-tier is-${tier.key} tier-${tier.key}" data-player-index="${index}" tabindex="0" aria-label="Seleziona ${escapeHTML(item.name)}">
        <div class="pf-list-team-mark" aria-hidden="true">
          <img src="${escapeHTML(logo)}" alt="" loading="lazy" />
        </div>
        <div class="pf-list-identity">
          <span class="pf-list-kicker">${escapeHTML(tabLabel(activeTab))}</span>
          <strong class="pf-list-player-name">${escapeHTML(item.name)}</strong>
          <small class="pf-list-player-meta">${escapeHTML(micro)}</small>
          ${lowerContent}
        </div>
        <div class="pf-list-overall-badge pf-overall-tier is-${tier.key} tier-${tier.key}" aria-label="Overall ${overall}">
          <span>OVR</span>
          <strong>${overall}</strong>
        </div>
      </article>
    `;
  }




  function setupPlayerTools() {
    const search = marketList?.querySelector('[data-player-search]');
    const sort = marketList?.querySelector('[data-player-sort]');

    if (search) {
      const shouldRestoreFocus = document.activeElement?.matches?.('[data-player-search]');
      if (shouldRestoreFocus || search.dataset.restoreFocus === 'true') {
        window.requestAnimationFrame(() => {
          search.focus({ preventScroll: true });
          const end = search.value.length;
          try { search.setSelectionRange(end, end); } catch (_) {}
        });
      }

      search.addEventListener('input', () => {
        playerSearchTerm = search.value || '';
        activePlayerIndex = 0;
        schedulePlayerSearchAnalytics(playerSearchTerm);
        renderMarketList();
        const nextSearch = marketList?.querySelector('[data-player-search]');
        if (nextSearch) {
          nextSearch.dataset.restoreFocus = 'true';
          window.requestAnimationFrame(() => {
            nextSearch.focus({ preventScroll: true });
            const end = nextSearch.value.length;
            try { nextSearch.setSelectionRange(end, end); } catch (_) {}
          });
        }
      });

      search.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
          playerSearchTerm = '';
          activePlayerIndex = 0;
          trackTransferEvent('transfer_player_search_clear', {
            interaction_source: 'escape_key'
          });
          renderMarketList();
        }
      });
    }

    sort?.addEventListener('change', () => {
      playerSortMode = sort.value || 'order';
      activePlayerIndex = 0;
      trackTransferEvent('transfer_player_sort', {
        sort_mode: cleanAnalyticsText(playerSortMode),
        results_count: getCurrentItems().length
      });
      renderMarketList();
    });
  }

  function renderMarketList() {
    if (!marketList) return;
    const allItemsForTab = findMarketItemsForTeamAndTab(activeTeamId, activeTab)
      .filter(item => item && !isPlaceholderValue(item.name));
    const items = getCurrentItems();

    const team = teams.find(team => team.id === activeTeamId) || teams[0];
    const filterBar = `
      <div class="pf-player-tools" aria-label="Strumenti ricerca giocatori">
        <label class="pf-player-search">
          <span>Cerca giocatore</span>
          <input type="search" data-player-search placeholder="Nome, ruolo, club..." value="${escapeHTML(playerSearchTerm)}" autocomplete="off" />
        </label>
        <label class="pf-player-sort">
          <span>Ordina</span>
          <select data-player-sort>
            <option value="order" ${playerSortMode === 'order' ? 'selected' : ''}>Ordine manuale</option>
            <option value="overall" ${playerSortMode === 'overall' ? 'selected' : ''}>PF Overall</option>
            <option value="role" ${playerSortMode === 'role' ? 'selected' : ''}>Ruolo</option>
            <option value="az" ${playerSortMode === 'az' ? 'selected' : ''}>Nome A-Z</option>
            <option value="za" ${playerSortMode === 'za' ? 'selected' : ''}>Nome Z-A</option>
          </select>
        </label>
      </div>
    `;

    if (!items.length) {
      const empty = getTransferEmptyMessage(activeTab, team);
      marketList.innerHTML = `
        <section class="pf-player-focus-system pf-player-focus-system-v9" aria-label="Player Focus ProFantasy">
          <div class="pf-player-focus-header pf-player-focus-header-v37">
            <div>
              <span>Player Focus</span>
              <strong>${escapeHTML(team?.name || 'Team')} · ${escapeHTML(tabLabel(activeTab))}</strong>
            </div>
            <small>${allItemsForTab.length} profili disponibili</small>
          </div>
          ${filterBar}
          <div class="empty-state transfer-empty-state">
            <strong>${escapeHTML(playerSearchTerm ? 'Nessun giocatore trovato.' : empty.title)}</strong>
            <span>${escapeHTML(playerSearchTerm ? 'Prova con un altro nome oppure cambia ordinamento/filtro.' : empty.text)}</span>
          </div>
        </section>
      `;
      renderPlayerInsightPanel(null, null);
      setupPlayerTools();
      trackTransferEvent('transfer_empty_state', {
        selected_tab: cleanAnalyticsText(activeTab || ''),
        has_search: Boolean(playerSearchTerm),
        available_count: allItemsForTab.length
      }, { onceKey: `empty_${activeTeamId}_${activeTab}_${Boolean(playerSearchTerm)}` });
      return;
    }

    activePlayerIndex = Math.max(0, Math.min(activePlayerIndex, items.length - 1));
    const activeItem = items[activePlayerIndex] || items[0];
    const activeValues = getSmartPlayerValues(activeItem);

    marketList.innerHTML = `
      <section class="pf-player-focus-system pf-player-focus-system-v9" aria-label="Player Focus ProFantasy">
        <div class="pf-player-focus-header pf-player-focus-header-v37">
          <div>
            <span>Player Focus</span>
            <strong>${escapeHTML(team?.name || 'Team')} · ${escapeHTML(tabLabel(activeTab))}</strong>
          </div>
          <small>${items.length}${allItemsForTab.length && items.length !== allItemsForTab.length ? ` / ${allItemsForTab.length}` : ''} profili disponibili</small>
        </div>
        ${filterBar}
        <div class="pf-focus-workspace">
          <div class="pf-focus-left">
            <div class="pf-player-focus-stage">
              ${renderSmartPlayerCard(activeItem, true, activePlayerIndex, activeValues)}
            </div>
            <div class="pf-player-stack" aria-label="Lista giocatori selezionabili" data-player-stack>
              ${items.length > 1
                ? items.map((item, index) => ({ item, index })).filter(({ index }) => index !== activePlayerIndex).map(({ item, index }) => renderPlayerListCard(item, index, getSmartPlayerValues(item))).join('')
                : '<div class="pf-mini-list-empty">Nessun altro profilo disponibile in questa categoria.</div>'}
            </div>
          </div>
          <aside class="pf-focus-radar-slot" data-player-radar-slot aria-label="Radar del giocatore selezionato"></aside>
        </div>
      </section>
    `;

    renderPlayerInsightPanel(activeItem, activeValues);
    setupPlayerTools();

    marketList.querySelectorAll('[data-player-index]').forEach(card => {
      const select = () => {
        const selectedIndex = Number(card.dataset.playerIndex || 0);
        const selectedItem = items[selectedIndex];
        trackPlayerSelection(selectedItem, selectedItem ? getSmartPlayerValues(selectedItem) : null, card.classList.contains('pf-player-focus-card') ? 'focus_card' : 'stack_card');
        activePlayerIndex = selectedIndex;
        renderMarketList();
      };
      card.addEventListener('click', select);
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });

    marketList.querySelectorAll('.player-img').forEach((img) => {
      img.onerror = () => {
        img.style.display = 'none';
        img.closest('.pf-player-focus-media')?.classList.add('is-empty');
      };
    });
  }


  init();
})();
