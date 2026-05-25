
(function(){
  const PROFILE_KEYS = ["profantasy_arena_session_cache_v1","pfa_profile_v2","pfa_profile","arenaProfile","profantasyArenaProfile"];
  const MAIN_PROFILE_KEY = "profantasy_arena_session_cache_v1";
  const ADMIN_GROUP_STANDINGS_KEY = "profantasy_arena_admin_group_standings_v1";
  let profile = readProfile();
  let playerId = profile ? (profile.id || profile.email || profile.username || "locale") : "guest";
  let GROUP_BRACKET_KEY = "pfa_group_stage_prediction_" + playerId;
  let TUTORIAL_KEY = "pfa_bracket_tutorial_split_v6_" + playerId;

  function refreshProfileContext(){
    profile = readProfile();
    playerId = profile ? (profile.id || profile.email || profile.username || "locale") : "guest";
    GROUP_BRACKET_KEY = "pfa_group_stage_prediction_" + playerId;
    TUTORIAL_KEY = "pfa_bracket_tutorial_split_v6_" + playerId;
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
    ["Tutorial bracket", "Inizia dai gironi: assegna 1°, 2°, 3° e 4° posizione a ogni nazionale."],
    ["Carousel gironi", "Scorri orizzontalmente i 12 gironi. La logica è la stessa su desktop e mobile."],
    ["Salvataggio definitivo", "Quando salvi la Group Stage Prediction, non potrai più modificarla."],
    ["Knockout più avanti", "La fase a eliminazione diretta verrà sbloccata solo dopo le classifiche reali dei gironi."],
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
    if(!supabase || !profile || !profile.isSupabase || getSaved()) return;
    try{
      const { data, error } = await supabase
        .from("group_predictions")
        .select("group_ranking, created_at")
        .eq("user_id", profile.id)
        .maybeSingle();
      if(error || !data) return;
      const payload = {
        savedAt: data.created_at || new Date().toISOString(),
        phase: "groups",
        groupRanking: data.group_ranking || {},
        knockoutLocked: true
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
    if(!profile){
      show("[data-lock-screen]");
      hide("[data-intro-screen]");
      hide("[data-game-shell]");
      hide("[data-saved-screen]");
      return;
    }

    const saved = getSaved();
    if(saved){
      state.readOnly = true;
      state.groupRanking = saved.groupRanking || {};
      hide("[data-lock-screen]"); hide("[data-intro-screen]"); hide("[data-game-shell]"); show("[data-saved-screen]");
      renderSavedOverview(saved);
      return;
    }

    hide("[data-lock-screen]");
    if(localStorage.getItem(TUTORIAL_KEY)){
      hide("[data-intro-screen]");
      show("[data-game-shell]");
      renderGroups(); renderSafePairings();
    } else {
      show("[data-intro-screen]");
      hide("[data-game-shell]");
    }
    bindEvents();
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
    if(review) review.addEventListener("click", () => {
      hide("[data-saved-screen]"); show("[data-game-shell]"); state.readOnly = true; renderGroups(); renderSafePairings(); window.scrollTo({top:0, behavior:"smooth"});
    });
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
    if(getSaved()){ alert("Group Stage Prediction già salvata: non puoi modificarla."); return; }
    if(!allGroupsComplete()){ alert("Completa tutte le posizioni dei 12 gironi prima di salvare."); return; }
    const payload = { savedAt: new Date().toISOString(), phase: "groups", groupRanking: state.groupRanking, knockoutLocked: true };

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
    const box = $("[data-saved-overview]");
    if(!box || !saved) return;
    const groupsHtml = groups.map(([g,...list]) => {
      const ranks = saved.groupRanking?.[g] || {};
      const ordered = [...list].sort((a,b)=>Number(ranks[a.code]||99)-Number(ranks[b.code]||99));
      return `<article class="saved-group-mini"><h4>Girone ${g}</h4>${ordered.map(team => `<span><i class="flag" style="background-image:url('img/flags/${flagFile(team.code)}.png')"></i><b>${team.name}</b><em>${ranks[team.code] || "-"}°</em></span>`).join("")}</article>`;
    }).join("");
    box.innerHTML = `
      <div class="saved-champion-hero saved-group-stage-hero">
        <span>Modalità salvata</span>
        <strong>Group Stage Prediction</strong>
        <p>Knockout Prediction bloccata fino alla fine dei gironi reali.</p>
      </div>
      <div class="saved-groups-strip">${groupsHtml}</div>
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

  function buildSafePairings(standings){
    if(!standings) return [];
    const pairLabels = [
      ["2A","2B"], ["1C","2F"], ["1F","2C"], ["2E","2I"],
      ["1H","2J"], ["2K","2L"], ["2D","2G"], ["1J","2H"]
    ];
    return pairLabels.map((pair, index) => ({ id:`safe-${index+1}`, a: pickByLabel(standings, pair[0]), b: pickByLabel(standings, pair[1]) }));
  }

  function renderSafePairings(){
    const panel = $("[data-safe-pairings-panel]");
    const mode = $("[data-knockout-mode-card]");
    const status = $("[data-knockout-status]");
    if(!panel) return;
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
    init();
  });
})();
