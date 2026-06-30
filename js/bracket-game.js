
(function(){
  const BUILD_VERSION = "admin-knockout-v5";
  console.info("[PFA] bracket-game loaded", BUILD_VERSION);
  const PROFILE_KEYS = ["profantasy_arena_session_cache_v1","pfa_profile_v2","pfa_profile","arenaProfile","profantasyArenaProfile"];
  const MAIN_PROFILE_KEY = "profantasy_arena_session_cache_v1";
  const ADMIN_GROUP_STANDINGS_KEY = "profantasy_arena_admin_group_standings_v1";
  const GROUP_STAGE_CLOSED = true;
  let profile = readProfile();
  let playerId = profile ? (profile.id || profile.email || profile.username || "locale") : "guest";
  let GROUP_BRACKET_KEY = "pfa_group_stage_prediction_" + playerId;
  let KNOCKOUT_BRACKET_KEY = "pfa_knockout_prediction_" + playerId;
  let TUTORIAL_KEY = "pfa_bracket_tutorial_split_v7_" + playerId;
  let KNOCKOUT_BANNER_KEY = "pfa_knockout_banner_closed_v1_" + playerId;

  function refreshProfileContext(){
    profile = readProfile();
    playerId = profile ? (profile.id || profile.email || profile.username || "locale") : "guest";
    GROUP_BRACKET_KEY = "pfa_group_stage_prediction_" + playerId;
    KNOCKOUT_BRACKET_KEY = "pfa_knockout_prediction_" + playerId;
    TUTORIAL_KEY = "pfa_bracket_tutorial_split_v7_" + playerId;
    KNOCKOUT_BANNER_KEY = "pfa_knockout_banner_closed_v1_" + playerId;
  }

  const groups = [
    ["A", {code:"MEX", name:"Messico"}, {code:"ZAF", name:"Sudafrica"}, {code:"KOR", name:"Corea del Sud"}, {code:"CZE", name:"Cechia"}],
    ["B", {code:"CAN", name:"Canada"}, {code:"BIH", name:"Bosnia-Erzegovina"}, {code:"QAT", name:"Qatar"}, {code:"SUI", name:"Svizzera"}],
    ["C", {code:"BRA", name:"Brasile"}, {code:"MAR", name:"Marocco"}, {code:"HAI", name:"Haiti"}, {code:"SCO", name:"Scozia"}],
    ["D", {code:"USA", name:"Stati Uniti"}, {code:"PRY", name:"Paraguay"}, {code:"AUS", name:"Australia"}, {code:"TUR", name:"Turchia"}],
    ["E", {code:"GER", name:"Germania"}, {code:"CUW", name:"Curaçao"}, {code:"CIV", name:"Costa d’Avorio"}, {code:"ECU", name:"Ecuador"}],
    ["F", {code:"NED", name:"Paesi Bassi"}, {code:"JPN", name:"Giappone"}, {code:"SWE", name:"Svezia"}, {code:"TUN", name:"Tunisia"}],
    ["G", {code:"BEL", name:"Belgio"}, {code:"EGY", name:"Egitto"}, {code:"IRN", name:"Iran"}, {code:"NZL", name:"Nuova Zelanda"}],
    ["H", {code:"ESP", name:"Spagna"}, {code:"CPV", name:"Capo Verde"}, {code:"KSA", name:"Arabia Saudita"}, {code:"URU", name:"Uruguay"}],
    ["I", {code:"FRA", name:"Francia"}, {code:"SEN", name:"Senegal"}, {code:"IRQ", name:"Iraq"}, {code:"NOR", name:"Norvegia"}],
    ["J", {code:"ARG", name:"Argentina"}, {code:"ALG", name:"Algeria"}, {code:"AUT", name:"Austria"}, {code:"JOR", name:"Giordania"}],
    ["K", {code:"POR", name:"Portogallo"}, {code:"COD", name:"RD Congo"}, {code:"UZB", name:"Uzbekistan"}, {code:"COL", name:"Colombia"}],
    ["L", {code:"ENG", name:"Inghilterra"}, {code:"CRO", name:"Croazia"}, {code:"GHA", name:"Ghana"}, {code:"PAN", name:"Panama"}]
  ];

  const state = { groupRanking: {}, readOnly: false };
  const tutorialSteps = [
    ["Bracket Knockout", "La fase a gironi è chiusa: ora si gioca dai sedicesimi fino alla finale. Scegli il vincente di ogni partita e il tabellone successivo si aggiorna automaticamente."],
    ["Salvataggio definitivo", "Quando premi Salva Knockout Prediction ti verrà chiesta una conferma finale. Dopo la conferma il bracket viene bloccato e non potrà più essere modificato."],
    ["Reward per turno", "Ogni vincente indovinato nel turno corretto vale 50 token: sedicesimi, ottavi, quarti, semifinali, finale 3° posto e finale."],
    ["Bonus accoppiamento", "Se avevi previsto correttamente una partita futura, ad esempio le due squadre che si incontrano agli ottavi, ricevi un bonus da 100 token per quell'accoppiamento."],
    ["Consiglio", "Compila tutto con calma: prima scegli i vincenti dei sedicesimi, poi controlla gli ottavi generati, continua fino al campione e solo alla fine salva."],
  ];
  let tutorialIndex = 0;

  function $(sel){ return document.querySelector(sel); }
  function $$(sel){ return Array.from(document.querySelectorAll(sel)); }
  function show(sel){
    const el=$(sel);
    if(!el) return;
    el.classList.remove("hidden");
    if(el.matches("[data-game-shell]")) el.classList.add("is-visible");
  }
  function hide(sel){
    const el=$(sel);
    if(!el) return;
    el.classList.add("hidden");
    if(el.matches("[data-game-shell]")) el.classList.remove("is-visible");
  }

  function isValidRegisteredProfile(profile){
    return Boolean(profile && profile.registered === true && (profile.id || profile.email || profile.username));
  }

  function findProfileKey(){
    return PROFILE_KEYS.find((key) => {
      try { return isValidRegisteredProfile(JSON.parse(localStorage.getItem(key))); } catch(e) { return false; }
    });
  }

  function readProfile(){
    for(const key of PROFILE_KEYS){
      try {
        const raw = localStorage.getItem(key);
        if(!raw) continue;
        const parsed = JSON.parse(raw);
        if(isValidRegisteredProfile(parsed)) return parsed;
        // Rimuove profili fallback non registrati, tipo ProFantasy/PF-ARENA.
        if(parsed && parsed.registered !== true) localStorage.removeItem(key);
      } catch(e) {}
    }
    return null;
  }
  function getSaved(){ try { return JSON.parse(localStorage.getItem(GROUP_BRACKET_KEY)); } catch(e){ return null; } }
  function flagFile(code){ return String(code || "").trim().toLowerCase(); }
  function teamName(code){
    for(const [, ...list] of groups){
      const found = list.find(t => t.code === code);
      if(found) return found.name;
    }
    return code || "---";
  }

  function normalizeAvatarPath(value){
    if(!value) return "";
    const file = String(value).split("/").pop();
    return file ? `img/avatars/${file}` : "";
  }


  function getSupabase(){
    return window.PFA_SUPABASE || null;
  }

  function waitForArenaAuthReady(timeout = 2500){
    if (window.PFA_AUTH_READY) return Promise.resolve();
    return new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.removeEventListener("pfa:auth-ready", finish);
        resolve();
      };
      window.addEventListener("pfa:auth-ready", finish, { once: true });
      setTimeout(finish, timeout);
    });
  }

  async function saveGroupPredictionToSupabase(payload){
    const supabase = getSupabase();
    if(!supabase || !profile || !profile.isSupabase) return null;
    const { data, error } = await supabase.rpc("pfa_save_group_prediction", {
      p_group_ranking: payload.groupRanking,
      p_xp_reward: 100
    });
    if(error){
      const message = String(error.message || "");
      if(message.includes("Could not find the function") || message.includes("schema cache")){
        throw new Error("Funzione Supabase non trovata. Esegui il file SUPABASE_SYNC_FIX_V2_SQL.sql nel SQL Editor e poi ricarica bracket.html.");
      }
      throw error;
    }
    if (window.PFA_AUTH_HELPERS && typeof window.PFA_AUTH_HELPERS.syncSupabaseSessionToLocal === "function") {
      await window.PFA_AUTH_HELPERS.syncSupabaseSessionToLocal();
      refreshProfileContext();
      renderProfile();
    }
    return data;
  }


  async function hydrateGroupPredictionFromSupabase(){
    const supabase = getSupabase();
    if(!supabase || !profile || !profile.isSupabase) return;
    try{
      let data = null;
      let error = null;
      try {
        const response = await supabase.rpc("pfa_get_my_group_prediction");
        error = response.error;
        data = Array.isArray(response.data) ? response.data[0] : response.data;
      } catch(rpcError) {
        error = rpcError;
      }
      if(error || !data) {
        const fallback = await supabase
          .from("group_predictions")
          .select("group_ranking, created_at, status, resolved_at, exact_positions, perfect_groups, tokens_reward, xp_reward, xp_reward_total, result_details")
          .eq("user_id", profile.id)
          .maybeSingle();
        if(fallback.error || !fallback.data) return;
        data = { ...fallback.data, updated_at: fallback.data.resolved_at || fallback.data.created_at, xp_reward: fallback.data.xp_reward_total ?? fallback.data.xp_reward ?? 0 };
      }
      const exactPositions = Number(data.exact_positions ?? data.exactPositions ?? 0);
      const perfectGroups = Number(data.perfect_groups ?? data.perfectGroups ?? 0);
      const tokensReward = Number(data.tokens_reward ?? data.tokensReward ?? 0);
      const xpReward = Number(data.xp_reward_total ?? data.xpRewardTotal ?? data.xp_reward ?? data.xpReward ?? 0);
      const resultDetails = data.result_details ?? data.resultDetails ?? null;
      const rawStatus = String(data.status || "").toLowerCase();
      const isResolved = ["resolved", "completed", "complete", "rewarded", "paid"].includes(rawStatus) || Boolean(data.resolved_at || data.resolvedAt) || tokensReward > 0 || exactPositions > 0 || perfectGroups > 0 || Boolean(resultDetails);
      const payload = {
        savedAt: data.created_at || data.createdAt || new Date().toISOString(),
        phase: "groups",
        groupRanking: data.group_ranking || data.groupRanking || {},
        knockoutLocked: false,
        status: isResolved ? "resolved" : (data.status || "saved"),
        resolvedAt: data.resolved_at || data.resolvedAt || (isResolved ? (data.updated_at || data.updatedAt || new Date().toISOString()) : ""),
        exactPositions,
        perfectGroups,
        tokensReward,
        xpReward,
        resultDetails
      };
      localStorage.setItem(GROUP_BRACKET_KEY, JSON.stringify(payload));
    }catch(e){
      console.warn("Group prediction Supabase hydrate failed", e);
    }
  }

  function renderProfile(){
    const isLogged = !!profile;
    $$(".bracket-guest-only").forEach(el => el.style.display = isLogged ? "none" : "inline-flex");
    $$(".bracket-user-only").forEach(el => el.style.display = isLogged ? "inline-flex" : "none");
    const hud = $("[data-profile-hud]");
    if(hud) hud.style.display = isLogged ? "" : "none";
    if(!profile) return;
    const name = profile.username || profile.name || "Player";
    const avatarBox = $("[data-profile-avatar]");
    const avatar = normalizeAvatarPath(profile.avatar || profile.avatarUrl || profile.avatar_url);
    if(avatarBox){
      avatarBox.innerHTML = avatar ? `<img src="${avatar}" alt="${name}"><span>${name.charAt(0).toUpperCase()}</span>` : `<span>${name.charAt(0).toUpperCase()}</span>`;
    }
    const set = (sel, val) => { const el=$(sel); if(el) el.textContent = val; };
    set("[data-profile-name]", name);
    set("[data-profile-tokens]", Number(profile.tokens || 0).toLocaleString("it-IT"));
    set("[data-profile-xp]", Number(profile.xp || 0).toLocaleString("it-IT"));
    set("[data-profile-ref]", profile.referralCode || profile.referral_code || "---");
  }

  function init(){
    refreshProfileContext();
    renderProfile();
    bindEvents();
    if(!profile){
      show("[data-lock-screen]");
      hide("[data-intro-screen]");
      hide("[data-game-shell]");
      hide("[data-saved-screen]");
      return;
    }

    const saved = getSaved();
    state.readOnly = true;
    hide("[data-lock-screen]");
    hide("[data-intro-screen]");
    hide("[data-game-shell]");
    show("[data-saved-screen]");

    if(saved){
      state.groupRanking = saved.groupRanking || {};
      renderSavedOverview(saved);
    } else {
      renderClosedGroupStageOverview();
    }
    renderKnockoutBanner();
  }

  function clearBracketAuthForVerifica(){
    PROFILE_KEYS.forEach((key) => localStorage.removeItem(key));
    Object.keys(localStorage)
      .filter((key) => key.startsWith("pfa_group_stage_prediction_") || key.startsWith("pfa_bracket_tutorial_"))
      .forEach((key) => localStorage.removeItem(key));
    if (window.PFA_AUTH_HELPERS && typeof window.PFA_AUTH_HELPERS.signOutSupabaseAndLocal === "function") { window.PFA_AUTH_HELPERS.signOutSupabaseAndLocal(); return; }
    window.location.href = "bracket.html";
  }

  function bindEvents(){
    const logout = $("[data-bracket-logout]");
    if(logout) logout.addEventListener("click", clearBracketAuthForVerifica);

    const start = $("[data-start-bracket]");
    if(start) start.addEventListener("click", () => { localStorage.setItem(TUTORIAL_KEY, "started"); hide("[data-intro-screen]"); show("[data-game-shell]"); renderGroups(); renderSafePairings(); openTutorial(); });
    const auto = $("[data-autofill]");
    if(auto) auto.addEventListener("click", autofillGroups);
    const save1 = $("[data-save-groups]");
    const save2 = $("[data-save-groups-top]");
    if(save1) save1.addEventListener("click", saveGroups);
    if(save2) save2.addEventListener("click", saveGroups);
    const tutorial = $("[data-open-tutorial]");
    if(tutorial) tutorial.addEventListener("click", openTutorial);
    const closeT = $("[data-close-tutorial]");
    if(closeT) closeT.addEventListener("click", closeTutorial);
    const nextT = $("[data-next-tutorial]");
    if(nextT) nextT.addEventListener("click", nextTutorial);
    const review = $("[data-review-saved]");
    if(review) review.addEventListener("click", openKnockoutPrediction);
    document.addEventListener("click", handleKoPanelClick);
  }

  function renderGroups(){
    const box = $("[data-groups-carousel]");
    if(!box) return;
    box.innerHTML = groups.map(([g,...list]) => `
      <article class="group-card ${state.readOnly ? "is-readonly" : ""}" data-group="${g}">
        <div class="group-card-head"><span>Girone ${g}</span><strong>4 squadre</strong></div>
        ${list.map(team => `
          <div class="team-rank-row">
            <div class="team-rank-info"><div class="flag" style="background-image:url('img/flags/${flagFile(team.code)}.png')"></div><b>${team.name}</b><small>${team.code}</small></div>
            <select data-rank-select="${g}:${team.code}" ${state.readOnly ? "disabled" : ""}>
              <option value="">Pos.</option>
              <option value="1">1°</option>
              <option value="2">2°</option>
              <option value="3">3°</option>
              <option value="4">4°</option>
            </select>
          </div>
        `).join("")}
      </article>
    `).join("");
    $$("[data-rank-select]").forEach(sel => {
      const [g,code]=sel.dataset.rankSelect.split(":");
      sel.value = state.groupRanking[g]?.[code] || "";
      sel.addEventListener("change", updateGroupRanking);
    });
  }

  function updateGroupRanking(e){
    const [g,code]=e.target.dataset.rankSelect.split(":");
    state.groupRanking[g] ||= {};
    const val = e.target.value;
    const duplicate = Object.entries(state.groupRanking[g]).find(([team,pos]) => team !== code && pos === val && val);
    if(duplicate){
      const other = document.querySelector(`[data-rank-select="${g}:${duplicate[0]}"]`);
      if(other) other.value = "";
      delete state.groupRanking[g][duplicate[0]];
    }
    if(val) state.groupRanking[g][code]=val; else delete state.groupRanking[g][code];
  }

  function autofillGroups(){
    groups.forEach(([g,...list]) => {
      state.groupRanking[g] = {};
      list.forEach((team,i) => state.groupRanking[g][team.code]=String(i+1));
    });
    renderGroups();
  }

  function allGroupsComplete(){
    return groups.every(([g,...list]) => {
      const ranks = state.groupRanking[g] || {};
      const values = list.map(t => ranks[t.code]).filter(Boolean);
      return values.length === 4 && new Set(values).size === 4;
    });
  }

  async function saveGroups(){
    if(GROUP_STAGE_CLOSED){ alert("La Group Stage Prediction è chiusa: ora puoi giocare il Bracket Knockout dai sedicesimi in poi."); return; }
    if(getSaved()){ alert("Group Stage Prediction già salvata: non puoi modificarla."); return; }
    if(!allGroupsComplete()){ alert("Completa tutte le posizioni dei 12 gironi prima di salvare."); return; }
    const payload = { savedAt: new Date().toISOString(), phase: "groups", groupRanking: state.groupRanking, knockoutLocked: true, status: "saved" };

    try {
      await saveGroupPredictionToSupabase(payload);
    } catch(error) {
      alert(error.message || "Errore durante il salvataggio della Group Stage Prediction.");
      return;
    }

    localStorage.setItem(GROUP_BRACKET_KEY, JSON.stringify(payload));
    try{
      const p = profile || {};
      if(!p.isSupabase) p.xp = Number(p.xp || 0) + 100;
      p.bracketSaved = true;
      p.groupStageSaved = true;
      localStorage.setItem(findProfileKey() || MAIN_PROFILE_KEY, JSON.stringify(p));
    }catch(e){}
    state.readOnly = true;
    renderSavedOverview(payload);
    hide("[data-game-shell]"); show("[data-saved-screen]"); window.scrollTo({ top:0, behavior:"smooth" });
    alert(profile && profile.isSupabase ? "Prediction gironi salvata. Reward: +100 XP." : "Prediction gironi salvata e bloccata. Reward: +100 XP.");
  }

  function renderSavedOverview(saved){
    const btn = $("[data-review-saved]");
    if(btn) btn.innerHTML = "Vai al Bracket Knockout <span>›</span>";
    const box = $("[data-saved-overview]");
    if(!box || !saved) return;
    const groupsHtml = groups.map(([g,...list]) => {
      const ranks = saved.groupRanking?.[g] || {};
      const details = saved.resultDetails?.[g] || null;
      const ordered = [...list].sort((a,b)=>Number(ranks[a.code]||99)-Number(ranks[b.code]||99));
      const rewardTag = details ? `<small class="saved-group-score ${details.perfect ? "is-perfect" : ""}">${Number(details.exact_positions || 0)}/4 esatte${details.perfect ? " · Perfetto" : ""}</small>` : "";
      return `<article class="saved-group-mini"><h4>Girone ${g}${rewardTag}</h4>${ordered.map(team => `<span><i class="flag" style="background-image:url('img/flags/${flagFile(team.code)}.png')"></i><b>${team.name}</b><em>${ranks[team.code] || "-"}°</em></span>`).join("")}</article>`;
    }).join("");
    const resolved = saved.status === "resolved" || saved.resolvedAt || Number(saved.tokensReward || 0) > 0 || Number(saved.exactPositions || 0) > 0 || Number(saved.perfectGroups || 0) > 0;
    const rewardSummary = resolved ? `
      <div class="bracket-reward-summary">
        <article><span>Posizioni esatte</span><strong>${Number(saved.exactPositions || 0)}/48</strong></article>
        <article><span>Gironi perfetti</span><strong>${Number(saved.perfectGroups || 0)}/12</strong></article>
        <article><span>Reward token</span><strong>+${Number(saved.tokensReward || 0).toLocaleString("it-IT")}</strong></article>
        <article><span>Reward XP</span><strong>+${Number(saved.xpReward || 0).toLocaleString("it-IT")}</strong></article>
      </div>
    ` : `
      <div class="bracket-reward-summary is-complete">
        <article><span>Reward gironi</span><strong>Bracket salvato</strong><p>La prediction è registrata sul profilo. Se il saldo token è già stato aggiornato, il reward admin è passato: i dettagli numerici appariranno appena Supabase restituisce i campi reward.</p></article>
      </div>
    `;
    box.innerHTML = `
      <div class="saved-champion-hero saved-group-stage-hero">
        <span>Modalità salvata</span>
        <strong>Group Stage Prediction</strong>
        <p>Bracket sincronizzato. I sedicesimi sono live e collegati a Daily Prediction, Home e Admin Center.</p>
      </div>
      ${rewardSummary}
      <div class="saved-groups-strip">${groupsHtml}</div>
    `;
  }

  function renderClosedGroupStageOverview(){
    const box = $("[data-saved-overview]");
    const title = document.querySelector("[data-saved-screen] h2");
    const copy = document.querySelector("[data-saved-screen] p");
    const badge = document.querySelector("[data-saved-screen] .intro-badge");
    if(badge) badge.textContent = "Gironi chiusi";
    if(title) title.textContent = "La Group Stage Prediction è terminata";
    if(copy) copy.textContent = "Il tempo per compilare i gironi è scaduto. Puoi comunque entrare nella Knockout Prediction e compilare il tabellone dai sedicesimi fino alla finale.";
    const btn = $("[data-review-saved]");
    if(btn) btn.innerHTML = "Vai al Bracket Knockout <span>›</span>";
    if(!box) return;
    box.innerHTML = `
      <div class="saved-champion-hero saved-group-stage-hero">
        <span>Fase chiusa</span>
        <strong>Group Stage terminata</strong>
        <p>Non hai una prediction gironi salvata su questo profilo/browser, quindi non ci sono token bracket gironi da mostrare qui.</p>
      </div>
      <div class="bracket-reward-summary is-complete">
        <article><span>Reward gironi</span><strong>Non disponibile</strong><p>La nuova fase disponibile è il tabellone knockout.</p></article>
        <article><span>Prossimo step</span><strong>Sedicesimi live</strong><p>Scegli i vincenti e completa il percorso fino alla finale.</p></article>
      </div>
    `;
  }

  function getAdminStandings(){
    try { return JSON.parse(localStorage.getItem(ADMIN_GROUP_STANDINGS_KEY)); } catch(e) { return null; }
  }

  function pickByLabel(standings, label){
    const group = label.slice(1);
    const pos = label[0];
    const ranks = standings?.[group] || {};
    const code = Object.keys(ranks).find(c => String(ranks[c]) === String(pos));
    return code ? { code, label } : { code:"TBD", label };
  }

  function getTeamInfo(code){
    for(const [, ...list] of groups){
      const found = list.find(t => t.code === code);
      if(found) return found;
    }
    const names = {
      ZAF:"Sudafrica", CAN:"Canada", BRA:"Brasile", JPN:"Giappone", GER:"Germania", PRY:"Paraguay", NED:"Paesi Bassi", MAR:"Marocco",
      CIV:"Costa d’Avorio", NOR:"Norvegia", FRA:"Francia", SWE:"Svezia", MEX:"Messico", ECU:"Ecuador", ENG:"Inghilterra", COD:"RD Congo",
      BEL:"Belgio", SEN:"Senegal", USA:"Stati Uniti", BIH:"Bosnia-Erzegovina", ESP:"Spagna", AUT:"Austria", POR:"Portogallo", CRO:"Croazia",
      SUI:"Svizzera", ALG:"Algeria", AUS:"Australia", EGY:"Egitto", ARG:"Argentina", CPV:"Capo Verde", COL:"Colombia", GHA:"Ghana"
    };
    return { code, name: names[code] || code };
  }

  function formatKoDate(value){
    if(!value) return "--";
    const date = new Date(`${value}T12:00:00Z`);
    if(Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("it-IT", { weekday:"short", day:"2-digit", month:"short" });
  }

  function buildSafePairings(standings){
    if(!standings) return [];
    const pairLabels = [
      ["2A","2B"], ["1C","2F"], ["1F","2C"], ["2E","2I"],
      ["1H","2J"], ["2K","2L"], ["2D","2G"], ["1J","2H"]
    ];
    return pairLabels.map((pair, index) => ({ id:`safe-${index+1}`, a: pickByLabel(standings, pair[0]), b: pickByLabel(standings, pair[1]) }));
  }

  function renderKoMatchCard(match){
    const home = getTeamInfo(match.home);
    const away = getTeamInfo(match.away);
    return `
      <article class="safe-pairing-card ko-fixture-card">
        <small>M${match.matchNumber} · ${formatKoDate(match.localDate)} · ${match.stadium || "Stadium"}</small>
        <span><i class="flag" style="background-image:url('img/flags/${flagFile(home.code)}.png')"></i><b>${home.name}</b></span>
        <em>VS</em>
        <span><i class="flag" style="background-image:url('img/flags/${flagFile(away.code)}.png')"></i><b>${away.name}</b></span>
      </article>`;
  }

  function renderKoPathCard(match){
    return `
      <article class="ko-path-card">
        <small>M${match.matchNumber} · ${formatKoDate(match.date)}</small>
        <strong>${match.title || match.label}</strong>
        <span>${match.title ? match.label : (match.stadium || "Stadium")}</span>
      </article>`;
  }

  function renderOfficialKnockout(panel, mode, status){
    const path = window.PFA_KNOCKOUT_PATH || null;
    const fixtures = Array.isArray(window.PFA_KNOCKOUT_FIXTURES) ? window.PFA_KNOCKOUT_FIXTURES : [];
    if(!path || !fixtures.length) return false;
    if(status) status.textContent = "Live";
    if(mode){ mode.classList.remove("is-locked"); mode.classList.add("is-partial"); }
    panel.innerHTML = `
      <h3>Sedicesimi ufficiali collegati alle Daily Prediction</h3>
      <p>Le 16 partite sotto sono nello stesso calendario usato da Home, Daily Prediction e Admin Center. Gli step successivi sono mostrati per numero match.</p>
      <div class="safe-pairings-scroll ko-fixtures-scroll">
        ${fixtures.map(renderKoMatchCard).join("")}
      </div>
      <div class="ko-path-board">
        <section><h4>Ottavi</h4>${(path.round16 || []).map(renderKoPathCard).join("")}</section>
        <section><h4>Quarti</h4>${(path.quarterFinals || []).map(renderKoPathCard).join("")}</section>
        <section><h4>Semifinali</h4>${(path.semiFinals || []).map(renderKoPathCard).join("")}</section>
        <section><h4>Finali</h4>${(path.finals || []).map(renderKoPathCard).join("")}</section>
      </div>
    `;
    return true;
  }

  function renderSafePairings(){
    const panel = $("[data-safe-pairings-panel]");
    const mode = $("[data-knockout-mode-card]");
    const status = $("[data-knockout-status]");
    if(!panel) return;
    if(renderOfficialKnockout(panel, mode, status)) return;
    const admin = getAdminStandings();
    const standings = admin?.standings;
    const pairs = buildSafePairings(standings);
    if(!pairs.length){
      panel.innerHTML = `<h3>Accoppiamenti non disponibili</h3><p>Il Centro Comandi Admin non ha ancora salvato le classifiche reali dei gironi.</p>`;
      if(status) status.textContent = "Bloccata";
      if(mode) mode.classList.add("is-locked");
      return;
    }
    if(status) status.textContent = "Parziale admin";
    if(mode) mode.classList.add("is-partial");
    panel.innerHTML = `
      <h3>Accoppiamenti sicuri già calcolabili</h3>
      <p>Questi sono gli incroci tra prime/seconde già definiti dal format. Le migliori terze verranno gestite nella fase Knockout più avanti.</p>
      <div class="safe-pairings-scroll">
        ${pairs.map(match => `
          <article class="safe-pairing-card">
            <small>${match.a.label} vs ${match.b.label}</small>
            <span><i class="flag" style="background-image:url('img/flags/${flagFile(match.a.code)}.png')"></i><b>${teamName(match.a.code)}</b></span>
            <em>VS</em>
            <span><i class="flag" style="background-image:url('img/flags/${flagFile(match.b.code)}.png')"></i><b>${teamName(match.b.code)}</b></span>
          </article>`).join("")}
      </div>
    `;
  }

  function getSavedKnockout(){
    try { return JSON.parse(localStorage.getItem(KNOCKOUT_BRACKET_KEY)); } catch(e) { return null; }
  }

  function setSavedKnockout(payload){
    localStorage.setItem(KNOCKOUT_BRACKET_KEY, JSON.stringify(payload));
  }


  function isKnockoutSaved(){
    const saved = getSavedKnockout();
    return Boolean(saved && saved.status === "saved");
  }

  function shouldShowKnockoutBanner(){
    if(!profile) return false;
    if(isKnockoutSaved()) return false;
    return localStorage.getItem(KNOCKOUT_BANNER_KEY) !== "closed";
  }

  function renderKnockoutBanner(){
    const existing = document.querySelector("[data-ko-compile-banner]");
    if(!shouldShowKnockoutBanner()){
      if(existing) existing.remove();
      return;
    }
    const html = `
      <div class="ko-compile-banner-inner">
        <div>
          <span>Nuova fase live</span>
          <strong>COMPILA IL BRACKET</strong>
          <p>Sedicesimi, ottavi, quarti, semifinali e finale: salva la tua Knockout Prediction prima dei match.</p>
        </div>
        <div class="ko-compile-banner-actions">
          <button type="button" class="ko-compile-banner-btn" data-open-ko-banner>Vai al bracket</button>
          <button type="button" class="ko-compile-banner-close" data-close-ko-banner aria-label="Chiudi notifica">×</button>
        </div>
      </div>`;
    if(existing){ existing.innerHTML = html; existing.classList.add("is-visible"); return; }
    const banner = document.createElement("div");
    banner.className = "ko-compile-banner is-visible";
    banner.setAttribute("data-ko-compile-banner", "");
    banner.innerHTML = html;
    const page = document.querySelector(".bracket-page") || document.body;
    page.prepend(banner);
  }

  function closeKnockoutBanner(){
    localStorage.setItem(KNOCKOUT_BANNER_KEY, "closed");
    renderKnockoutBanner();
  }

  async function hydrateKnockoutPredictionFromSupabase(){
    const supabase = getSupabase();
    if(!supabase || !profile || !profile.isSupabase) return;
    if(isKnockoutSaved()) return;
    try{
      const { data, error } = await supabase
        .from("knockout_predictions")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle();
      if(error) throw error;
      if(!data) return;
      const payload = data.bracket || {
        savedAt: data.saved_at || data.updated_at || new Date().toISOString(),
        phase: "knockout",
        status: data.status || "saved",
        picks: data.picks || {},
        champion: data.champion || data.picks?.["104"] || "",
        championName: data.champion_name || getTeamInfo(data.champion || data.picks?.["104"] || "").name
      };
      if(payload && payload.picks) setSavedKnockout({ ...payload, status: payload.status || "saved" });
    }catch(e){
      console.warn("Knockout Supabase hydrate skipped", e);
    }
  }

  function getKnockoutPicks(){
    const saved = getSavedKnockout();
    return saved && saved.picks ? saved.picks : {};
  }

  function normalizeKoStage(){
    const path = window.PFA_KNOCKOUT_PATH || {};
    const fixtures = Array.isArray(window.PFA_KNOCKOUT_FIXTURES) ? window.PFA_KNOCKOUT_FIXTURES : [];
    const r32 = fixtures.slice().sort((a,b)=>Number(a.matchNumber||0)-Number(b.matchNumber||0)).map((m)=>({
      stage: "Sedicesimi", matchNumber: Number(m.matchNumber), home: m.home, away: m.away,
      label: `${getTeamInfo(m.home).name} vs ${getTeamInfo(m.away).name}`,
      date: m.kickoffUtc || m.localDate, stadium: m.stadium || "Stadium"
    }));
    const mk = (stage, list) => (list || []).map((m)=>({
      stage,
      matchNumber: Number(m.matchNumber),
      home: m.home || sourceFromLabel(m.label, 0, m.matchNumber),
      away: m.away || sourceFromLabel(m.label, 1, m.matchNumber),
      label: m.title || m.label || `Match ${m.matchNumber}`,
      date: m.kickoffUtc || m.date || m.localDate,
      stadium: m.stadium || "Stadium",
      title: m.title || ""
    }));
    return [
      { key:"round32", title:"Sedicesimi", matches:r32 },
      { key:"round16", title:"Ottavi", matches:mk("Ottavi", path.round16) },
      { key:"quarterFinals", title:"Quarti", matches:mk("Quarti", path.quarterFinals) },
      { key:"semiFinals", title:"Semifinali", matches:mk("Semifinali", path.semiFinals) },
      { key:"finals", title:"Finali", matches:mk("Finali", path.finals) }
    ];
  }

  function sourceFromLabel(label, index, matchNumber){
    const nums = String(label || "").match(/M(\d+)/g) || [];
    if(!nums[index]) return matchNumber === 103 ? (index === 0 ? "L101" : "L102") : "TBD";
    return `W${nums[index].replace("M", "")}`;
  }

  function getAllKoMatches(){
    return normalizeKoStage().flatMap(stage => stage.matches);
  }

  function getKoMatch(matchNumber){
    return getAllKoMatches().find(m => Number(m.matchNumber) === Number(matchNumber));
  }

  function resolveSlot(slot, picks){
    if(!slot) return null;
    const raw = String(slot);
    if(raw === "TBD") return null;
    if(raw.startsWith("W")){
      const winner = picks[raw.slice(1)];
      return winner ? getTeamInfo(winner) : { code: raw, name: `Vincente M${raw.slice(1)}`, placeholder: true };
    }
    if(raw.startsWith("L")){
      const match = getKoMatch(raw.slice(1));
      const participants = getParticipants(match, picks).filter(Boolean).filter(p => !p.placeholder);
      const winner = picks[raw.slice(1)];
      const loser = participants.find(p => p.code !== winner);
      return loser || { code: raw, name: `Perdente M${raw.slice(1)}`, placeholder: true };
    }
    return getTeamInfo(raw);
  }

  function getParticipants(match, picks){
    if(!match) return [];
    return [resolveSlot(match.home, picks), resolveSlot(match.away, picks)];
  }

  function isMatchPlayable(match, picks){
    const participants = getParticipants(match, picks);
    return participants.length === 2 && participants.every(p => p && !p.placeholder && p.code && p.code !== "TBD");
  }

  function pruneInvalidPicks(picks){
    const next = { ...picks };
    let changed = true;
    while(changed){
      changed = false;
      getAllKoMatches().forEach(match => {
        const key = String(match.matchNumber);
        if(!next[key]) return;
        const participants = getParticipants(match, next).filter(Boolean).map(p => p.code);
        if(!participants.includes(next[key])){ delete next[key]; changed = true; }
      });
    }
    return next;
  }

  function renderTeamButton(match, team, picked, locked){
    if(!team) return `<button type="button" class="ko-team-pick is-placeholder" disabled>Da definire</button>`;
    const isPlaceholder = team.placeholder;
    const isPicked = picked && picked === team.code;
    return `
      <button type="button" class="ko-team-pick ${isPicked ? "is-picked" : ""} ${isPlaceholder ? "is-placeholder" : ""}" data-ko-pick="${match.matchNumber}:${team.code}" ${locked || isPlaceholder ? "disabled" : ""}>
        <i class="flag" style="background-image:url('img/flags/${flagFile(team.code)}.png')"></i>
        <span>${team.name}</span>
      </button>`;
  }

  function renderKnockoutMatch(match, picks, savedLocked){
    const participants = getParticipants(match, picks);
    const picked = picks[String(match.matchNumber)] || "";
    const playable = isMatchPlayable(match, picks);
    const locked = Boolean(savedLocked);
    const winnerName = picked ? getTeamInfo(picked).name : (playable ? "Scegli vincente" : "Completa il turno precedente");
    return `
      <article class="ko-prediction-card ${picked ? "is-complete" : ""} ${!playable ? "is-waiting" : ""}" data-ko-match="${match.matchNumber}">
        <div class="ko-prediction-head"><span>M${match.matchNumber}</span><strong>${match.title || match.stage}</strong></div>
        <small>${formatKoDate(match.date)} · ${match.stadium || "Stadium"}</small>
        <div class="ko-pick-row">
          ${renderTeamButton(match, participants[0], picked, locked)}
          <em>VS</em>
          ${renderTeamButton(match, participants[1], picked, locked)}
        </div>
        <p>Prediction: <b>${winnerName}</b></p>
      </article>`;
  }

  function renderKnockoutPrediction(options = {}){
    const panel = $("[data-safe-pairings-panel]");
    if(!panel) return;
    const previousBoard = panel.querySelector(".ko-prediction-board");
    const previousScrollLeft = previousBoard ? previousBoard.scrollLeft : 0;
    const previousScrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const savedKo = getSavedKnockout();
    const savedLocked = Boolean(savedKo && savedKo.status === "saved");
    const picks = pruneInvalidPicks(savedKo?.picks || window.__PFA_KO_DRAFT__ || {});
    window.__PFA_KO_DRAFT__ = picks;
    const stages = normalizeKoStage();
    const allMatches = stages.flatMap(stage => stage.matches);
    const completedCount = allMatches.filter(match => picks[String(match.matchNumber)]).length;
    const champion = picks["104"] ? getTeamInfo(picks["104"]) : null;
    const complete = Boolean(champion);
    panel.innerHTML = `
      <div class="ko-prediction-shell">
        <div class="ko-prediction-hero">
          <div>
            <span class="intro-badge">Knockout Prediction</span>
            <h2>Compila il tabellone dai sedicesimi alla finale</h2>
            <p>Scegli il vincente di ogni match. Gli ottavi, i quarti, le semifinali e la finale si popolano in automatico in base alle tue scelte. Salvataggio definitivo dopo conferma.</p>
          </div>
          <aside>
            <span>Campione scelto</span>
            <strong>${champion ? champion.name : "---"}</strong>
            <small>${savedLocked ? "Prediction salvata e bloccata" : `${completedCount}/${allMatches.length} scelte completate`}</small>
          </aside>
        </div>
        <div class="ko-prediction-actions">
          <button class="primary-cta" type="button" data-save-knockout ${!complete || savedLocked ? "disabled" : ""}>${savedLocked ? "Knockout salvato" : "Salva Knockout Prediction"}</button>
          <button class="ghost-cta" type="button" data-reset-knockout ${savedLocked ? "disabled" : ""}>Reset scelte</button>
        </div>
        <div class="ko-rules-card">
          <article><span>Reward turno</span><strong>+50 token</strong><p>Per ogni vincente previsto nel turno corretto.</p></article>
          <article><span>Bonus partita</span><strong>+100 token</strong><p>Se prevedi correttamente l'accoppiamento futuro, ad esempio le due squadre agli ottavi.</p></article>
          <article><span>Blocco scelta</span><strong>Definitivo</strong><p>Dopo il salvataggio il bracket non sarà più modificabile.</p></article>
        </div>
        <div class="ko-prediction-board">
          ${stages.map(stage => `<section class="ko-prediction-round"><h3>${stage.title}</h3>${stage.matches.map(match => renderKnockoutMatch(match, picks, savedLocked)).join("")}</section>`).join("")}
        </div>
      </div>`;
    if(options.preserveScroll){
      requestAnimationFrame(() => {
        const board = panel.querySelector(".ko-prediction-board");
        if(board) board.scrollLeft = previousScrollLeft;
        window.scrollTo(0, previousScrollTop);
      });
    }
    renderKnockoutBanner();
  }

  function openKnockoutPrediction(){
    const page = document.querySelector(".bracket-page");
    if(page) page.classList.add("is-ko-mode");
    hide("[data-saved-screen]");
    hide("[data-intro-screen]");
    hide("[data-lock-screen]");
    show("[data-game-shell]");
    state.readOnly = true;
    const groupStatus = $("[data-group-mode-status]");
    if(groupStatus) groupStatus.textContent = "Chiusa";
    const koStatus = $("[data-knockout-status]");
    if(koStatus) koStatus.textContent = getSavedKnockout()?.status === "saved" ? "Salvata" : "Live";
    const mode = $("[data-knockout-mode-card]");
    if(mode){ mode.classList.remove("is-locked"); mode.classList.add("is-partial"); }
    renderKnockoutPrediction();
    window.scrollTo({top:0, behavior:"smooth"});
  }

  function handleKoPanelClick(event){
    const closeBanner = event.target.closest("[data-close-ko-banner]");
    if(closeBanner){
      event.preventDefault();
      closeKnockoutBanner();
      return;
    }
    const openBanner = event.target.closest("[data-open-ko-banner]");
    if(openBanner){
      event.preventDefault();
      openKnockoutPrediction();
      return;
    }
    const pickBtn = event.target.closest("[data-ko-pick]");
    if(pickBtn){
      event.preventDefault();
      event.stopPropagation();
      if(getSavedKnockout()?.status === "saved") return;
      const [matchNumber, code] = pickBtn.dataset.koPick.split(":");
      const picks = { ...(window.__PFA_KO_DRAFT__ || {}) };
      picks[String(matchNumber)] = code;
      window.__PFA_KO_DRAFT__ = pruneInvalidPicks(picks);
      renderKnockoutPrediction({ preserveScroll: true, activeMatchNumber: matchNumber });
      return;
    }
    const reset = event.target.closest("[data-reset-knockout]");
    if(reset){
      if(getSavedKnockout()?.status === "saved") return;
      if(confirm("Vuoi cancellare le scelte knockout non salvate?")){
        window.__PFA_KO_DRAFT__ = {};
        renderKnockoutPrediction({ preserveScroll: true });
      }
      return;
    }
    const save = event.target.closest("[data-save-knockout]");
    if(save){
      event.preventDefault();
      saveKnockoutPrediction();
    }
  }

  async function saveKnockoutPrediction(){
    if(isKnockoutSaved()){ alert("Knockout Prediction già salvata e bloccata."); return; }
    const picks = pruneInvalidPicks(window.__PFA_KO_DRAFT__ || {});
    if(!picks["104"]){ alert("Completa il tabellone fino alla finale prima di salvare."); return; }
    const championName = getTeamInfo(picks["104"]).name;
    const confirmed = confirm(`Confermi definitivamente la Knockout Prediction?\n\nCampione scelto: ${championName}\n\nDopo il salvataggio non potrai più modificare il bracket.`);
    if(!confirmed) return;
    const payload = {
      savedAt: new Date().toISOString(),
      phase: "knockout",
      status: "saved",
      locked: true,
      picks,
      champion: picks["104"],
      championName,
      rewardRules: {
        correctWinnerPerRoundTokens: 50,
        correctFutureMatchupBonusTokens: 100
      }
    };
    setSavedKnockout(payload);
    try{
      const p = profile || {};
      p.bracketKnockoutSaved = true;
      p.knockoutChampion = payload.championName;
      localStorage.setItem(findProfileKey() || MAIN_PROFILE_KEY, JSON.stringify(p));
    }catch(e){}
    try { await saveKnockoutPredictionToSupabase(payload); } catch(e) { console.warn("Knockout Supabase save skipped", e); }
    renderKnockoutBanner();
    alert(`Knockout Prediction salvata e bloccata. Campione scelto: ${payload.championName}.`);
    renderKnockoutPrediction({ preserveScroll: true });
  }

  async function saveKnockoutPredictionToSupabase(payload){
    const supabase = getSupabase();
    if(!supabase || !profile || !profile.isSupabase) return null;
    try{
      await supabase.from("profiles").update({ bracket_knockout_saved: true }).eq("id", profile.id);
    }catch(e){ console.warn("profiles bracket_knockout_saved update skipped", e); }
    try{
      const fullRecord = {
        user_id: profile.id,
        bracket: payload,
        picks: payload.picks,
        champion: payload.champion,
        champion_name: payload.championName,
        status: "saved",
        saved_at: payload.savedAt,
        updated_at: new Date().toISOString()
      };
      let { error } = await supabase.from("knockout_predictions").upsert(fullRecord, { onConflict: "user_id" });
      if(error){
        const minimalRecord = {
          user_id: profile.id,
          bracket: payload,
          picks: payload.picks,
          champion: payload.champion,
          status: "saved"
        };
        const fallback = await supabase.from("knockout_predictions").upsert(minimalRecord, { onConflict: "user_id" });
        if(fallback.error) throw fallback.error;
      }
    }catch(e){
      // Tabella opzionale: se non esiste, il salvataggio locale resta valido e non blocca l'utente.
      console.warn("knockout_predictions table unavailable", e);
    }
    if (window.PFA_AUTH_HELPERS && typeof window.PFA_AUTH_HELPERS.syncSupabaseSessionToLocal === "function") {
      await window.PFA_AUTH_HELPERS.syncSupabaseSessionToLocal();
      refreshProfileContext();
      renderProfile();
    }
  }

  function openTutorial(){ tutorialIndex = 0; updateTutorial(); const layer=$("[data-tutorial]"); if(layer) layer.classList.add("is-visible"); }
  function closeTutorial(){ localStorage.setItem(TUTORIAL_KEY, "done"); const layer=$("[data-tutorial]"); if(layer) layer.classList.remove("is-visible"); }
  function nextTutorial(){ tutorialIndex += 1; if(tutorialIndex >= tutorialSteps.length) return closeTutorial(); updateTutorial(); }
  function updateTutorial(){
    const step = tutorialSteps[tutorialIndex] || tutorialSteps[0];
    const title=$("[data-tutorial-title]"); const text=$("[data-tutorial-text]");
    if(title) title.textContent = step[0];
    if(text) text.textContent = step[1];
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await waitForArenaAuthReady();
    if (window.PFA_AUTH_HELPERS && typeof window.PFA_AUTH_HELPERS.syncSupabaseSessionToLocal === "function") {
      await window.PFA_AUTH_HELPERS.syncSupabaseSessionToLocal();
      refreshProfileContext();
    }
    await hydrateGroupPredictionFromSupabase();
    await hydrateKnockoutPredictionFromSupabase();
    init();
  });
})();
