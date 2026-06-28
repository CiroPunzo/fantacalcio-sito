(function () {
  const STORE_KEY = "profantasy_arena_session_cache_v1";
  const CLEAN_VERSION_FLAG = "profantasy_arena_production_step8_ready";

  function resetLegacyLocaleDataOnce() {
    if (localStorage.getItem(CLEAN_VERSION_FLAG)) return;
    [
      "profantasy_arena_locale_user",
      "profantasy_arena_locale_user_fresh_v1",
      "profantasy_arena_locale_user_v1",
      "profantasy_arena_session_cache_v1",
      "pfa_profile_v2",
      "pfa_profile",
      "arenaProfile",
      "profantasyArenaProfile",
      "profantasy_arena_clean_v1_ready",
      STORE_KEY
    ].forEach((key) => localStorage.removeItem(key));

    Object.keys(localStorage)
      .filter((key) => key.startsWith("pfa_bracket_") || key.startsWith("pfa_bracket_tutorial_"))
      .forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(CLEAN_VERSION_FLAG, "1");
  }

  resetLegacyLocaleDataOnce();
  const COST = 50;
  const EXACT_SCORE_COST = 50;
  const EXACT_SCORE_REWARD = 500;
  const VERSION_BONUS_KEY = "world_cup_arena_v2_bonus";
  const VERSION_BONUS_REWARD = 250;
  const VERSION_BONUS_NOTICE_PREFIX = "pfa_worldcup_match_result_bonus_seen_";
  const XP_PER_PREDICTION = 10;
  const DEFAULT_USER = {
    id: null,
    username: "ProFantasy",
    email: "",
    avatar: "img/avatars/avatar-01.png",
    registered: false,
    tokens: 1000,
    xp: 0,
    level: 1,
    streak: 0,
    predictions: {},
    bracketSaved: false,
    missionRewards: {},
    referralCode: "PF-ARENA",
    referredBy: "",
    referralFriends: 0,
    referralEarned: 0,
    referralQualified: 0,
    referralRewardsClaimed: 0,
    referralInvites: []
  };

  const FIXTURE_SOURCE = Array.isArray(window.WORLD_CUP_FIXTURES) ? window.WORLD_CUP_FIXTURES : [];
  const HAS_COMPLETE_WORLD_CUP_CALENDAR = FIXTURE_SOURCE.length >= 72;
  if (!HAS_COMPLETE_WORLD_CUP_CALENDAR) {
    console.warn("[ProFantasy Arena] Calendario World Cup non caricato o incompleto. Controlla js/world-cup-fixtures.js.", { fixtures: FIXTURE_SOURCE.length });
  }
  // Produzione: countdown reali sul calendario World Cup.
  // Per test: aggiungi ?arenaDate=2026-06-11T18:30:00Z oppure imposta localStorage.pfa_arena_preview_now.
  const FORCE_REAL_WORLD_CUP_TIME = window.PFA_FORCE_REAL_WORLD_CUP_TIME !== false;

  const SUPABASE_ENABLED = Boolean(window.PFA_SUPABASE);
  let SUPABASE_LEADERBOARD_CACHE = null;
  let SUPABASE_ADMIN_CACHE_READY = false;
  let VERSION_BONUS_CACHE = null;
  window.PFA_AUTH_READY = false;

  function getSupabase() {
    return window.PFA_SUPABASE || null;
  }

  function normalizeScoreNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const raw = String(value).trim();
    if (!/^\d+$/.test(raw)) return null;
    const normalized = Number.parseInt(raw, 10);
    if (Number.isNaN(normalized) || normalized < 0 || normalized > 20) return null;
    return normalized;
  }

  function buildScoreString(homeScore, awayScore) {
    const home = normalizeScoreNumber(homeScore);
    const away = normalizeScoreNumber(awayScore);
    if (home === null || away === null) return "";
    return `${home}-${away}`;
  }

  function parseScoreString(score) {
    const parts = String(score || "").match(/(\d+)\s*[-:]\s*(\d+)/);
    if (!parts) return null;
    const home = normalizeScoreNumber(parts[1]);
    const away = normalizeScoreNumber(parts[2]);
    if (home === null || away === null) return null;
    return { home, away, score: `${home}-${away}` };
  }

  function deriveChoiceFromScores(homeScore, awayScore) {
    const home = normalizeScoreNumber(homeScore);
    const away = normalizeScoreNumber(awayScore);
    if (home === null || away === null) return "";
    if (home > away) return "1";
    if (home < away) return "2";
    return "X";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getExactScoreLabel(prediction) {
    if (!prediction || !prediction.exactScoreEnabled) return "";
    const home = normalizeScoreNumber(prediction.exactHomeScore);
    const away = normalizeScoreNumber(prediction.exactAwayScore);
    if (home === null || away === null) return "";
    return `${home}-${away}`;
  }

  function getExactScoreStatusLabel(prediction) {
    if (!prediction || !prediction.exactScoreEnabled) return "";
    if (prediction.exactScoreStatus === "won") return "Perfect Score +500";
    if (prediction.exactScoreStatus === "lost") return "Exact non preso";
    if (prediction.exactScoreStatus === "pending_score") return "Exact in attesa score";
    return "Exact pending";
  }

  async function fetchSupabaseVersionBonus(authUser = null) {
    const supabase = getSupabase();
    if (!supabase) return null;
    let user = authUser;
    try {
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        user = session?.user || null;
      }
      if (!user) {
        VERSION_BONUS_CACHE = null;
        renderVersionBonusNudge();
        return null;
      }
      const { data, error } = await supabase.rpc("pfa_get_version_bonus", { p_campaign_key: VERSION_BONUS_KEY });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      VERSION_BONUS_CACHE = row ? {
        campaignKey: row.campaign_key || VERSION_BONUS_KEY,
        tokenReward: Number(row.token_reward || VERSION_BONUS_REWARD),
        status: row.status || "available",
        claimedAt: row.claimed_at || "",
        title: row.title || "Nuova versione: Match Result",
        body: row.body || "Benvenuto nella nuova versione ProFantasy World Cup Arena: Match Result. Per l’occasione ti sono stati regalati 250 token. Buon divertimento.",
        cta: row.cta || "Ho capito"
      } : null;
      renderVersionBonusNudge();
      return VERSION_BONUS_CACHE;
    } catch (error) {
      // Se la funzione non è ancora installata, non blocchiamo l'Arena.
      console.warn("Version bonus unavailable", error);
      VERSION_BONUS_CACHE = null;
      renderVersionBonusNudge();
      return null;
    }
  }

  async function ackSupabaseVersionBonusNotice() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("pfa_ack_version_bonus", { p_campaign_key: VERSION_BONUS_KEY });
    if (error) throw error;
    VERSION_BONUS_CACHE = { ...(VERSION_BONUS_CACHE || {}), status: "seen" };
    return data;
  }

  function getVersionBonusNoticeStorageKey(bonus = VERSION_BONUS_CACHE) {
    const user = getUser();
    const userKey = user?.id || user?.email || user?.username || "guest";
    const campaign = bonus?.campaignKey || VERSION_BONUS_KEY;
    return `${VERSION_BONUS_NOTICE_PREFIX}${campaign}_${userKey}`;
  }

  function renderVersionBonusNudge() {
    const existing = document.querySelector("[data-version-bonus-nudge]");
    const bonus = VERSION_BONUS_CACHE;

    if (!hasRegisteredUser() || !bonus || bonus.status === "available" || bonus.status === "seen") {
      if (existing) existing.remove();
      return;
    }

    const storageKey = getVersionBonusNoticeStorageKey(bonus);
    if (localStorage.getItem(storageKey) === "1") {
      if (existing) existing.remove();
      return;
    }

    const reward = Number(bonus.tokenReward || VERSION_BONUS_REWARD);
    const html = `
      <div class="pfa-version-bonus-icon" aria-hidden="true">⚡</div>
      <div class="pfa-version-bonus-copy">
        <span>${escapeHtml(bonus.title || "Nuova versione")}</span>
        <strong>+${reward.toLocaleString("it-IT")} token accreditati</strong>
        <p>${escapeHtml(bonus.body || "Benvenuto nella nuova versione ProFantasy World Cup Arena: Match Result. Per l’occasione ti sono stati regalati 250 token. Buon divertimento.")}</p>
      </div>
      <button type="button" data-version-bonus-dismiss>${escapeHtml(bonus.cta || "Ho capito")}</button>
    `;

    const node = existing || document.createElement("aside");
    node.className = "pfa-version-bonus-nudge is-claimed";
    node.setAttribute("data-version-bonus-nudge", "");
    node.setAttribute("role", "status");
    node.innerHTML = html;

    if (!existing) document.body.appendChild(node);

    const btn = node.querySelector("[data-version-bonus-dismiss]");
    if (btn) {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Ok";
        localStorage.setItem(storageKey, "1");
        try {
          await ackSupabaseVersionBonusNotice();
        } catch (error) {
          console.warn("Version bonus ack unavailable", error);
        }
        setTimeout(() => node.remove(), 160);
      });
    }
  }

  function getAuthRedirectUrl() {
    const configured = window.PFA_AUTH_REDIRECT_URL || "";
    if (configured && /^https?:\/\//i.test(configured)) return configured;

    const fallback = "https://ciropunzo.github.io/fantacalcio-sito/login.html";
    try {
      const path = window.location.pathname.replace(/\/[^/]*$/, "/login.html");
      if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        return `${window.location.origin}${path}`;
      }
    } catch (error) {
      console.warn("Auth redirect URL fallback", error);
    }

    return fallback;
  }

  function mapProfileFromSupabase(profile, authUser, predictionMap = null, missionRewardsMap = null, referralStats = null) {
    if (!profile && !authUser) return null;
    const cached = getUser();
    const username = profile?.username || authUser?.user_metadata?.username || (authUser?.email ? authUser.email.split("@")[0] : "Player");
    return {
      ...DEFAULT_USER,
      id: authUser?.id || profile?.id || null,
      username,
      email: authUser?.email || profile?.email || "",
      isSupabase: true,
      isAdmin: Boolean(profile?.is_admin),
      avatar: normalizeAvatarPath(profile?.avatar_url || authUser?.user_metadata?.avatar_url || DEFAULT_USER.avatar),
      registered: true,
      tokens: Number(profile?.tokens ?? 1000),
      xp: Number(profile?.xp ?? 0),
      level: Number(profile?.level ?? 1),
      streak: Number(profile?.daily_streak ?? 0),
      predictionPlayed: Number(profile?.prediction_played ?? 0),
      predictionWon: Number(profile?.prediction_won ?? 0),
      predictionLost: Number(profile?.prediction_lost ?? 0),
      referralCode: profile?.referral_code || "PF-ARENA",
      referredBy: profile?.referred_by || "",
      referralFriends: Number(referralStats?.friends ?? profile?.referral_count ?? 0),
      referralEarned: Number(referralStats?.earned ?? profile?.referral_tokens_earned ?? 0),
      bracketSaved: Boolean(profile?.bracket_group_saved) || Boolean(cached.bracketSaved),
      bracketKnockoutSaved: Boolean(profile?.bracket_knockout_saved) || Boolean(cached.bracketKnockoutSaved),
      predictions: predictionMap || {},
      missionRewards: missionRewardsMap || cached.missionRewards || {},
      referralQualified: Number(referralStats?.qualified ?? cached.referralQualified ?? 0),
      referralRewardsClaimed: Number(referralStats?.claimed ?? cached.referralRewardsClaimed ?? 0),
      referralInvites: Array.isArray(referralStats?.invites) ? referralStats.invites : (Array.isArray(cached.referralInvites) ? cached.referralInvites : [])
    };
  }

  async function fetchSupabaseProfile(authUser) {
    const supabase = getSupabase();
    if (!supabase || !authUser) return null;

    // Production security: read the full private profile only through RPC.
    // The public profiles table no longer exposes email/is_admin directly via REST.
    try {
      const { data, error } = await supabase.rpc("pfa_get_my_profile");
      if (!error && data) return data;
      if (error) console.warn("Supabase pfa_get_my_profile error", error);
    } catch (rpcError) {
      console.warn("Supabase pfa_get_my_profile unavailable", rpcError);
    }

    // Fallback for older SQL while migrating: only request non-sensitive columns.
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, tokens, xp, level, daily_streak, prediction_played, prediction_won, prediction_lost, referral_code, referral_count, referral_tokens_earned, bracket_group_saved, bracket_knockout_saved, last_prediction_date")
      .eq("id", authUser.id)
      .maybeSingle();
    if (error) {
      console.warn("Supabase profile fetch error", error);
      return null;
    }
    return { ...data, email: authUser.email || "", is_admin: false };
  }


  async function fetchSupabasePredictions(authUser) {
    const supabase = getSupabase();
    if (!supabase || !authUser) return {};

    const baseSelect = "match_id, choice, home, away, match_time, cost, reward, status, final_result, score, created_at, resolved_at";
    const exactSelect = baseSelect + ", exact_score_enabled, exact_home_score, exact_away_score, exact_score_cost, exact_score_reward, exact_score_status, exact_score_resolved_at";

    let { data, error } = await supabase
      .from("predictions")
      .select(exactSelect)
      .eq("user_id", authUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      const message = String(error.message || "").toLowerCase();
      if (message.includes("exact_") || message.includes("column")) {
        const fallback = await supabase
          .from("predictions")
          .select(baseSelect)
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });
        data = fallback.data;
        error = fallback.error;
      }
    }

    if (error) {
      // Se non hai ancora eseguito lo script SQL dello Step Token Sync, la tabella non esiste: manteniamo fallback pulito.
      console.warn("Supabase predictions fetch error", error);
      return {};
    }

    return Object.fromEntries((data || []).map((row) => [
      row.match_id,
      {
        choice: row.choice,
        status: row.status || "pending",
        cost: Number(row.cost || COST),
        reward: Number(row.reward || 125),
        home: row.home || getMatchLabels()[row.match_id]?.home || "HOME",
        away: row.away || getMatchLabels()[row.match_id]?.away || "AWAY",
        time: row.match_time || getMatchLabels()[row.match_id]?.time || "",
        playedAt: row.created_at,
        finalResult: row.final_result || "",
        score: row.score || "",
        resolvedAt: row.resolved_at || "",
        exactScoreEnabled: Boolean(row.exact_score_enabled),
        exactHomeScore: row.exact_home_score ?? null,
        exactAwayScore: row.exact_away_score ?? null,
        exactScoreCost: Number(row.exact_score_cost || EXACT_SCORE_COST),
        exactScoreReward: Number(row.exact_score_reward || EXACT_SCORE_REWARD),
        exactScoreStatus: row.exact_score_status || (row.exact_score_enabled ? "pending" : ""),
        exactScoreResolvedAt: row.exact_score_resolved_at || ""
      }
    ]));
  }

  async function fetchSupabaseMissionClaims(authUser) {
    const supabase = getSupabase();
    if (!supabase || !authUser) return {};
    const { data, error } = await supabase
      .from("mission_claims")
      .select("mission_key, tokens_reward, xp_reward, claimed_at")
      .eq("user_id", authUser.id)
      .order("claimed_at", { ascending: false });
    if (error) {
      console.warn("Supabase mission claims fetch error", error);
      return {};
    }
    return Object.fromEntries((data || []).map((row) => [
      row.mission_key,
      {
        claimed: true,
        tokens: Number(row.tokens_reward || 0),
        xp: Number(row.xp_reward || 0),
        claimedAt: row.claimed_at
      }
    ]));
  }


  async function fetchSupabaseReferralStats(authUser) {
    const supabase = getSupabase();
    if (!supabase || !authUser) return null;
    const { data, error } = await supabase.rpc("pfa_get_my_referrals");
    if (error) {
      console.warn("Supabase referral fetch error", error);
      return null;
    }
    const invites = (data || []).map((row) => ({
      id: row.id,
      username: row.referred_username || "Player invitato",
      avatar: normalizeAvatarPath(row.referred_avatar_url || DEFAULT_USER.avatar),
      predictions: Number(row.referred_prediction_count || 0),
      required: Number(row.required_predictions || REFERRAL_REQUIRED_PREDICTIONS),
      rewardClaimed: Boolean(row.claimed_at),
      qualified: Boolean(row.qualified_at) || Number(row.referred_prediction_count || 0) >= Number(row.required_predictions || REFERRAL_REQUIRED_PREDICTIONS),
      tokenReward: Number(row.token_reward || REFERRAL_REWARD),
      xpReward: Number(row.xp_reward || 0),
      joinedAt: row.created_at,
      qualifiedAt: row.qualified_at,
      claimedAt: row.claimed_at,
      status: row.status || "pending"
    }));
    return {
      invites,
      friends: invites.length,
      qualified: invites.filter((item) => item.qualified).length,
      claimed: invites.filter((item) => item.rewardClaimed).length,
      earned: invites.filter((item) => item.rewardClaimed).reduce((sum, item) => sum + Number(item.tokenReward || REFERRAL_REWARD), 0)
    };
  }


  async function refreshSupabaseProfileCache(authUser = null) {
    const supabase = getSupabase();
    if (!supabase) return getUser();
    let user = authUser;
    if (!user) {
      const { data: { session } } = await supabase.auth.getSession();
      user = session?.user || null;
    }
    if (!user) return null;
    const profile = await fetchSupabaseProfile(user);
    const predictions = await fetchSupabasePredictions(user);
    const missionRewards = await fetchSupabaseMissionClaims(user);
    const referralStats = await fetchSupabaseReferralStats(user);
    const mapped = mapProfileFromSupabase(profile, user, predictions, missionRewards, referralStats);
    if (mapped) {
      localStorage.setItem(STORE_KEY, JSON.stringify(mapped));
      renderUser(mapped);
      fetchSupabaseVersionBonus(user).catch((error) => console.warn("Version bonus refresh failed", error));
    }
    return mapped;
  }

  async function submitSupabasePrediction({
    matchId,
    choice,
    home,
    away,
    time,
    exactScoreEnabled = false,
    exactHomeScore = null,
    exactAwayScore = null
  }) {
    const supabase = getSupabase();
    if (!supabase) return null;

    if (exactScoreEnabled) {
      const { data, error } = await supabase.rpc("pfa_submit_prediction_exact", {
        p_match_id: matchId,
        p_choice: choice,
        p_home: home || "HOME",
        p_away: away || "AWAY",
        p_match_time: time || "",
        p_base_cost: COST,
        p_base_reward: 125,
        p_exact_score_enabled: true,
        p_exact_home_score: normalizeScoreNumber(exactHomeScore),
        p_exact_away_score: normalizeScoreNumber(exactAwayScore),
        p_exact_score_cost: EXACT_SCORE_COST,
        p_exact_score_reward: EXACT_SCORE_REWARD
      });
      if (error) {
        const message = String(error.message || "");
        if (message.includes("Could not find the function") || message.includes("schema cache")) {
          throw new Error("Funzione risultato esatto non trovata. Esegui SUPABASE_EXACT_SCORE_V1.sql nel SQL Editor e ricarica la pagina.");
        }
        throw error;
      }
      await refreshSupabaseProfileCache();
      await refreshSupabaseLeaderboard();
      return data;
    }

    const { data, error } = await supabase.rpc("pfa_submit_prediction", {
      p_match_id: matchId,
      p_choice: choice,
      p_home: home || "HOME",
      p_away: away || "AWAY",
      p_match_time: time || "",
      p_cost: COST,
      p_reward: 125
    });
    if (error) {
      const message = String(error.message || "");
      if (message.includes("Could not find the function") || message.includes("schema cache")) {
        throw new Error("Funzione Supabase non trovata. Esegui prima il file SUPABASE_SYNC_FIX_V2_SQL.sql nel SQL Editor e poi ricarica la pagina.");
      }
      throw error;
    }
    await refreshSupabaseProfileCache();
    await refreshSupabaseLeaderboard();
    return data;
  }

  async function resolveSupabasePredictionLocale(matchId, result, score = "") {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("pfa_resolve_my_prediction_locale", {
      p_match_id: matchId,
      p_result: result,
      p_score: score || ""
    });
    if (error) throw error;
    await refreshSupabaseProfileCache();
    return data;
  }

  async function setSupabaseAdminMatchResult(matchId, result, score = "") {
    const supabase = getSupabase();
    if (!supabase) return null;
    const fixture = getFixtureById(matchId);
    const { data, error } = await supabase.rpc("pfa_admin_set_match_result", {
      p_match_id: matchId,
      p_result: result,
      p_score: score || "",
      p_home: fixture ? fixture.home : "HOME",
      p_away: fixture ? fixture.away : "AWAY",
      p_match_time: fixture ? `${fixture.dateLabel} • ${fixture.timeLabel}` : ""
    });
    if (error) {
      const message = String(error.message || "");
      if (message.includes("Could not find the function") || message.includes("schema cache")) {
        throw new Error("Funzione admin Supabase non trovata/aggiornata. Esegui SUPABASE_EXACT_SCORE_V1.sql nel SQL Editor e ricarica.");
      }
      throw error;
    }
    await refreshSupabaseAdminCache();
    await refreshSupabaseProfileCache();
    await refreshSupabaseLeaderboard();
    return data;
  }

  async function clearSupabaseAdminMatchResult(matchId) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("pfa_admin_clear_match_result", {
      p_match_id: matchId
    });
    if (error) {
      const message = String(error.message || "");
      if (message.includes("Could not find the function") || message.includes("schema cache")) {
        throw new Error("Funzione reset risultato non trovata. Esegui SUPABASE_SCALE_STABILITY_STEP12_SQL.sql nel SQL Editor e ricarica.");
      }
      throw error;
    }
    const results = getAdminResults();
    delete results[matchId];
    saveAdminResults(results);
    await refreshSupabaseAdminCache();
    await refreshSupabaseProfileCache();
    await refreshSupabaseLeaderboard();
    return data;
  }

  async function syncSupabaseSessionToLocal() {
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return null;
      const mapped = await refreshSupabaseProfileCache(session.user);
      if (mapped) return mapped;
    } catch (error) {
      console.warn("Supabase session sync failed", error);
    }
    return null;
  }

  async function signOutSupabaseAndLocal() {
    const supabase = getSupabase();
    try {
      if (supabase) await supabase.auth.signOut();
    } catch (error) {
      console.warn("Supabase signout failed", error);
    }
    [STORE_KEY, "pfa_profile_v2", "pfa_profile", "arenaProfile", "profantasyArenaProfile"].forEach((key) => localStorage.removeItem(key));
    window.location.href = "arena.html";
  }

  async function createSupabaseAccount({ username, email, password, avatar, referredBy }) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          username,
          avatar_url: normalizeAvatarPath(avatar),
          referred_by_code: referredBy || ""
        }
      }
    });
    if (error) throw error;

    // Con conferma email attiva Supabase non crea una sessione immediata.
    // In produzione trattiamo questo caso come registrazione corretta in attesa di conferma,
    // evitando messaggi tecnici tipo "sessione non attiva".
    if (!data.session) {
      return { pendingEmail: true, email, redirectUrl: getAuthRedirectUrl() };
    }

    if (data.user) {
      // Il trigger SQL crea il profilo. Aspettiamo un attimo e poi lo leggiamo.
      await new Promise((resolve) => setTimeout(resolve, 650));
      const mapped = await refreshSupabaseProfileCache(data.user);
      if (mapped) return mapped;
    }
    return null;
  }

  async function loginSupabaseAccount({ email, password }) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      const mapped = await refreshSupabaseProfileCache(data.user);
      if (mapped) return mapped;
    }
    return null;
  }

  function getNow() {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get("arenaDate") || localStorage.getItem("pfa_arena_preview_now");
    if (forced) {
      const parsed = new Date(forced);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }

    const realNow = new Date();
    const firstFixture = Array.isArray(window.WORLD_CUP_FIXTURES) && window.WORLD_CUP_FIXTURES.length
      ? new Date(window.WORLD_CUP_FIXTURES[0].kickoffUtc || window.WORLD_CUP_FIXTURES[0].kickoff || window.WORLD_CUP_FIXTURES[0].date)
      : null;

    // Produzione: usiamo sempre l'orario reale del browser.
    // La preview resta disponibile solo con ?arenaDate=... o localStorage.pfa_arena_preview_now.
    if (!FORCE_REAL_WORLD_CUP_TIME && firstFixture && !Number.isNaN(firstFixture.getTime()) && realNow < firstFixture) {
      return new Date("2026-06-11T12:00:00Z");
    }

    return realNow;
  }

  function toLocalDayKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function parseFixtureDayKey(fixture, kickoff) {
    // Il calendario ufficiale della World Cup raggruppa i match per data FIFA/venue.
    // Questo evita che le partite serali in America finiscano nel giorno dopo per gli utenti italiani.
    return fixture.localDate || fixture.dayKey || toLocalDayKey(kickoff);
  }

  function formatOfficialDate(dayKey, fallbackDate) {
    const date = dayKey ? new Date(`${dayKey}T12:00:00Z`) : new Date(fallbackDate);
    if (Number.isNaN(date.getTime())) return "--";
    return date.toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "short" });
  }

  function normalizeFixture(fixture) {
    const kickoff = new Date(fixture.kickoffUtc || fixture.kickoff || fixture.date);
    const dayKey = parseFixtureDayKey(fixture, kickoff);
    return {
      ...fixture,
      id: fixture.id,
      home: fixture.home,
      away: fixture.away,
      homeFlag: fixture.homeFlag || `img/flags/${String(fixture.home || "").toLowerCase()}.png`,
      awayFlag: fixture.awayFlag || `img/flags/${String(fixture.away || "").toLowerCase()}.png`,
      kickoff,
      dayKey,
      officialDateLabel: formatOfficialDate(dayKey, kickoff),
      // Orario mostrato all'utente in base al suo fuso locale; il countdown resta basato su kickoffUtc.
      timeLabel: kickoff.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }),
      dateLabel: formatOfficialDate(dayKey, kickoff)
    };
  }

  function getAllFixtures() {
    return FIXTURE_SOURCE
      .map(normalizeFixture)
      .filter((match) => match.id && !Number.isNaN(match.kickoff.getTime()))
      .sort((a, b) => a.kickoff - b.kickoff || (a.matchNumber || 0) - (b.matchNumber || 0));
  }

  function getFixturePool() {
    return getAllFixtures();
  }

  function getNextFixture(now = getNow()) {
    const fixtures = getFixturePool();
    return fixtures.find((match) => match.kickoff > now) || fixtures[fixtures.length - 1] || null;
  }

  function groupFixturesByDay(fixtures = getFixturePool()) {
    const map = new Map();
    fixtures.forEach((match) => {
      if (!map.has(match.dayKey)) map.set(match.dayKey, []);
      map.get(match.dayKey).push(match);
    });
    return Array.from(map.entries())
      .map(([key, matches]) => {
        const sorted = matches.slice().sort((a, b) => a.kickoff - b.kickoff);
        return {
          key,
          matches: sorted,
          firstKickoff: sorted[0]?.kickoff || null,
          lastKickoff: sorted[sorted.length - 1]?.kickoff || null
        };
      })
      .sort((a, b) => (a.firstKickoff || 0) - (b.firstKickoff || 0));
  }

  function getPredictionUnlockAt(day) {
    if (!day || !day.firstKickoff) return null;
    const first = new Date(day.firstKickoff);
    // Sblocco coerente con il concetto di "matchday": dalla mezzanotte italiana del giorno FIFA.
    // In fallback, se la data ufficiale non è parsabile, apriamo 18h prima del primo kickoff.
    if (day.key && /^\d{4}-\d{2}-\d{2}$/.test(day.key)) {
      const unlock = new Date(`${day.key}T00:01:00+02:00`);
      if (!Number.isNaN(unlock.getTime())) return unlock;
    }
    return new Date(first.getTime() - 18 * 60 * 60 * 1000);
  }

  function isPredictionDayUnlocked(day, now = getNow()) {
    const unlockAt = getPredictionUnlockAt(day);
    if (!unlockAt) return true;
    return now >= unlockAt;
  }

  function getActivePredictionDay(now = getNow()) {
    const fixtures = getFixturePool();
    const todayKey = toLocalDayKey(now);
    const days = groupFixturesByDay(fixtures);
    if (!days.length) return { key: todayKey, matches: [], isToday: true, isFuture: false, unlockAt: null };

    // 1) Se esiste un matchday già sbloccato con almeno una partita futura, resta quello giocabile.
    const playableDay = days.find((day) => day.matches.some((match) => match.kickoff > now) && isPredictionDayUnlocked(day, now));
    if (playableDay) {
      return {
        ...playableDay,
        isToday: true,
        isFuture: false,
        unlockAt: getPredictionUnlockAt(playableDay)
      };
    }

    // 2) Altrimenti mostriamo il prossimo matchday ufficiale bloccato, con countdown di sblocco.
    const nextDay = days.find((day) => day.matches.some((match) => match.kickoff > now)) || days[days.length - 1];
    return {
      ...nextDay,
      isToday: isPredictionDayUnlocked(nextDay, now),
      isFuture: !isPredictionDayUnlocked(nextDay, now),
      unlockAt: getPredictionUnlockAt(nextDay)
    };
  }

  function getMatchLabels() {
    return Object.fromEntries(getFixturePool().map((match) => [
      match.id,
      { home: match.home, away: match.away, time: `${match.dateLabel} • ${match.timeLabel}` }
    ]));
  }

  function getUser() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
      return {
        ...DEFAULT_USER,
        ...stored,
        predictions: stored.predictions || {},
        missionRewards: stored.missionRewards || {},
        referralInvites: Array.isArray(stored.referralInvites) ? stored.referralInvites : []
      };
    } catch (e) {
      return { ...DEFAULT_USER };
    }
  }


  function isAdminUser(user = getUser()) {
    return Boolean(user && user.registered && user.isSupabase && user.isAdmin === true);
  }

  function renderAdminAccessDenied(root) {
    if (!root) return;
    root.classList.add("admin-locked-shell");
    root.innerHTML = `
      <section class="admin-access-denied">
        <div class="admin-lock-orb" aria-hidden="true"></div>
        <span class="game-kicker">Accesso protetto</span>
        <h1>Admin Center bloccato</h1>
        <p>
          Questa sezione è riservata agli account autorizzati. Effettua il login con un profilo admin
          oppure promuovi il tuo account da Supabase prima di accedere al Centro Comandi.
        </p>
        <div class="admin-lock-actions">
          <a class="arena-btn arena-btn-primary" href="login.html?redirect=admin-center.html">Accedi come admin</a>
          <a class="arena-btn arena-btn-secondary" href="arena.html">Torna alla lobby</a>
        </div>
        <small>Step 8: le funzioni admin sono protette anche lato Supabase tramite ruolo admin.</small>
      </section>
    `;
  }

  function getLevelFromXp(xp) {
    const value = Number(xp || 0);
    if (value >= 1500) return 5;
    if (value >= 1000) return 4;
    if (value >= 600) return 3;
    if (value >= 250) return 2;
    return 1;
  }

  function getNextLevelXp(xp) {
    const value = Number(xp || 0);
    if (value < 250) return 250;
    if (value < 600) return 600;
    if (value < 1000) return 1000;
    if (value < 1500) return 1500;
    return 5000;
  }


  function getLevelFloorXp(level) {
    const lvl = Number(level || 1);
    if (lvl <= 1) return 0;
    if (lvl === 2) return 250;
    if (lvl === 3) return 600;
    if (lvl === 4) return 1000;
    if (lvl === 5) return 1500;
    return 1500;
  }

  function getUniquePredictionDays(user) {
    const entries = Object.values((user && user.predictions) || {});
    return Array.from(new Set(entries
      .map((item) => item && item.playedAt ? toLocalDayKey(new Date(item.playedAt)) : null)
      .filter(Boolean)
    )).sort();
  }

  function computeDailyStreak(user) {
    const days = getUniquePredictionDays(user);
    if (!days.length) return 0;
    const daySet = new Set(days);
    let cursor = new Date(days[days.length - 1] + "T12:00:00");
    let count = 0;
    while (daySet.has(toLocalDayKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function getSavedGroupStagePrediction(user = getUser()) {
    const playerId = user && (user.id || user.email || user.username || "locale");
    const keys = [];
    if (playerId) keys.push("pfa_group_stage_prediction_" + playerId);
    keys.push("pfa_group_stage_prediction_guest");
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      } catch (e) {}
    }
    return null;
  }

  function getCompletedBracketGroups(user = getUser()) {
    const saved = getSavedGroupStagePrediction(user);
    if (!saved || !saved.groupRanking) return user.bracketSaved ? 12 : 0;
    return Object.keys(saved.groupRanking).filter((group) => {
      const values = Object.values(saved.groupRanking[group] || {}).filter(Boolean);
      return values.length === 4 && new Set(values).size === 4;
    }).length;
  }

  const PFA_MISSIONS = [
    { key: "first_prediction", progressKey: "firstPrediction", target: 1, tokens: 25, xp: 25 },
    { key: "three_predictions", progressKey: "threePredictions", target: 3, tokens: 75, xp: 60 },
    { key: "daily_streak", progressKey: "dailyStreak", target: 1, tokens: 0, xp: 20 },
    { key: "group_bracket", progressKey: "bracket", target: 12, tokens: 0, xp: 200 },
    { key: "invite_friend", progressKey: "referral", target: 1, tokens: 250, xp: 100 },
    { key: "top_50", progressKey: "rank", target: 50, tokens: 0, xp: 150 }
  ];

  function getMissionByKey(key) {
    return PFA_MISSIONS.find((mission) => mission.key === key) || null;
  }

  function getUserLeaderboardRank(user = getUser()) {
    const leaderboardRows = getLeaderboardRows(user);
    const current = leaderboardRows.find((item) => item.current);
    return Number(current?.rank || 999999);
  }

  function getMissionProgress(key, user = getUser()) {
    const predictions = Object.values(user.predictions || {});
    const bracketGroups = getCompletedBracketGroups(user);
    const qualifiedReferrals = Number(user.referralQualified || user.referralFriends || 0);
    const rank = getUserLeaderboardRank(user);
    switch (key) {
      case "first_prediction": return { value: Math.min(1, predictions.length), target: 1, complete: predictions.length >= 1 };
      case "three_predictions": return { value: Math.min(3, predictions.length), target: 3, complete: predictions.length >= 3 };
      case "daily_streak": {
        const streak = Math.max(Number(user.streak || 0), computeDailyStreak(user));
        return { value: Math.min(1, streak), target: 1, complete: streak >= 1 };
      }
      case "group_bracket": return { value: Math.min(12, bracketGroups), target: 12, complete: bracketGroups >= 12 };
      case "invite_friend": return { value: Math.min(1, qualifiedReferrals), target: 1, complete: qualifiedReferrals >= 1 };
      case "top_50": {
        const played = Number(user.predictionPlayed || Object.keys(user.predictions || {}).length || 0);
        const rankOk = rank <= 50;
        const playedOk = played >= 5;
        return {
          value: Math.min(50, rankOk && playedOk ? 50 : Math.max(0, 50 - Math.min(rank || 999999, 50))),
          target: 50,
          complete: rankOk && playedOk,
          rank,
          played,
          playedTarget: 5
        };
      }
      default: return { value: 0, target: 1, complete: false };
    }
  }

  function getMissionProgressSnapshot(user = getUser()) {
    const completed = PFA_MISSIONS.filter((mission) => getMissionProgress(mission.key, user).complete).length;
    return { completed, total: PFA_MISSIONS.length, percent: Math.min(100, Math.round((completed / PFA_MISSIONS.length) * 100)) };
  }

  function renderProgressionCards(user = getUser()) {
    const playedStreak = Math.max(Number(user.streak || 0), computeDailyStreak(user));
    const mission = getMissionProgressSnapshot(user);
    const bracketGroups = getCompletedBracketGroups(user);
    const leaderboardRows = getLeaderboardRows(user);
    const current = leaderboardRows.find((item) => item.current) || { rank: "--" };
    const referralCount = Math.min(5, Number(user.referralQualified || user.referralFriends || 0));
    const nextXp = getNextLevelXp(user.xp);
    const level = getLevelFromXp(user.xp);
    const floorXp = getLevelFloorXp(level);
    const passPercent = Math.min(100, Math.max(0, Math.round(((Number(user.xp || 0) - floorXp) / Math.max(1, nextXp - floorXp)) * 100)));

    document.querySelectorAll("[data-progression-missions-count]").forEach((el) => el.textContent = mission.completed);
    document.querySelectorAll("[data-progression-missions-bar]").forEach((el) => el.style.width = mission.percent + "%");
    document.querySelectorAll("[data-progression-streak-label]").forEach((el) => el.textContent = `${playedStreak} ${playedStreak === 1 ? "giorno" : "giorni"}`);
    document.querySelectorAll("[data-progression-streak-dots]").forEach((wrap) => {
      wrap.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("is-active", index < Math.min(7, playedStreak)));
    });
    document.querySelectorAll("[data-progression-bracket-count]").forEach((el) => el.textContent = bracketGroups);
    document.querySelectorAll("[data-progression-bracket-bar]").forEach((el) => el.style.width = Math.min(100, Math.round((bracketGroups / 12) * 100)) + "%");
    document.querySelectorAll("[data-progression-referral-count]").forEach((el) => el.textContent = referralCount);
    document.querySelectorAll("[data-progression-referral-dots]").forEach((wrap) => {
      wrap.querySelectorAll("i").forEach((dot, index) => dot.classList.toggle("is-active", index < referralCount));
    });
    document.querySelectorAll("[data-arena-pass-bar]").forEach((el) => el.style.width = passPercent + "%");
    document.querySelectorAll("[data-leaderboard-user-rank]").forEach((el) => el.textContent = `#${current.rank}`);
  }


  function renderLobbyMissionPreview(user = getUser()) {
    document.querySelectorAll("[data-lobby-mission-card]").forEach((card) => {
      const key = card.dataset.lobbyMissionCard;
      const progress = getMissionProgress(key, user);
      const claimed = Boolean(user.missionRewards && user.missionRewards[key]);
      const status = card.querySelector(`[data-lobby-mission-status="${key}"]`);
      card.classList.toggle("is-complete", progress.complete);
      card.classList.toggle("is-claimed", claimed);
      if (!status) return;
      if (claimed) {
        status.textContent = "Riscattata";
      } else if (key === "top_50") {
        status.textContent = progress.complete ? "Pronta" : `Rank #${progress.rank || "--"} · ${progress.played || 0}/5`;
      } else {
        status.textContent = `${progress.value} / ${progress.target}`;
      }
    });
  }

  function renderArenaLiveFeed(user = getUser()) {
    const now = getNow();
    const fixtures = getFixturePool();
    const upcoming = fixtures.filter((match) => match.kickoff > now).slice(0, 3);
    const today = getActivePredictionDay(now);
    const next = upcoming[0] || getNextFixture(now);

    document.querySelectorAll("[data-live-status-label]").forEach((el) => {
      if (next && next.kickoff > now) {
        const diff = Math.max(0, next.kickoff - now);
        const hours = Math.floor(diff / 36e5);
        const minutes = Math.floor((diff % 36e5) / 6e4);
        el.textContent = `Prossimo match tra ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
      } else {
        el.textContent = "Matchday completato";
      }
    });

    document.querySelectorAll("[data-live-match-list]").forEach((wrap) => {
      const rows = (upcoming.length ? upcoming : today.matches.slice(0, 3)).slice(0, 3);
      if (!rows.length) {
        wrap.innerHTML = `<b>Calendario in arrivo <small>--:--</small></b>`;
        return;
      }
      wrap.innerHTML = rows.map((match) => `
        <b><img src="${match.homeFlag}" alt="${match.home}"> ${match.home} vs ${match.away} <img src="${match.awayFlag}" alt="${match.away}"><small>${match.timeLabel}</small></b>
      `).join("");
    });

    document.querySelectorAll("[data-live-user-tokens]").forEach((el) => {
      el.textContent = Number(user.tokens || 0).toLocaleString("it-IT");
    });

    document.querySelectorAll("[data-live-player-goal]").forEach((el) => {
      const wins = Number(user.predictionWon || 0);
      el.textContent = wins > 0 ? `${wins} prediction vinte` : "Diventa il primo campione";
    });
  }

  function ensureLogoutModal() {
    let modal = document.querySelector("[data-logout-modal]");
    if (modal) return modal;
    modal = document.createElement("div");
    modal.className = "logout-modal";
    modal.setAttribute("data-logout-modal", "");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <div class="logout-modal-backdrop" data-logout-cancel></div>
      <section class="logout-modal-card" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title">
        <span class="logout-modal-kicker">Arena Session</span>
        <h2 id="logout-modal-title">Vuoi uscire dall’Arena?</h2>
        <p>La tua progressione resta salvata sul profilo. Potrai rientrare quando vuoi con il login.</p>
        <div class="logout-modal-actions">
          <button type="button" class="arena-btn arena-btn-secondary" data-logout-cancel>Annulla</button>
          <button type="button" class="arena-btn arena-btn-primary" data-logout-confirm>Esci dall’Arena</button>
        </div>
      </section>
    `;
    document.body.appendChild(modal);
    modal.querySelectorAll("[data-logout-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => hideLogoutModal());
    });
    const confirmBtn = modal.querySelector("[data-logout-confirm]");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => signOutSupabaseAndLocal());
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") hideLogoutModal();
    });
    return modal;
  }

  function showLogoutModal() {
    const modal = ensureLogoutModal();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function hideLogoutModal() {
    const modal = document.querySelector("[data-logout-modal]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  }

  function saveUser(user) {
    const clean = { ...DEFAULT_USER, ...user, registered: true };
    clean.avatar = normalizeAvatarPath(clean.avatar || DEFAULT_USER.avatar);
    clean.level = getLevelFromXp(clean.xp);
    clean.streak = Math.max(Number(clean.streak || 0), computeDailyStreak(clean));
    if (!clean.id) clean.id = "pf_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    if (!clean.referralCode || clean.referralCode === "PF-ARENA") clean.referralCode = makeReferralCode(clean.username);
    localStorage.setItem(STORE_KEY, JSON.stringify(clean));
    renderUser(clean);
    if (typeof renderLeaderboard === "function") renderLeaderboard(clean);
    return clean;
  }

  function hasRegisteredUser() {
    try {
      const user = JSON.parse(localStorage.getItem(STORE_KEY));
      return Boolean(user && user.registered);
    } catch (e) {
      return false;
    }
  }

  function makeReferralCode(username) {
    const base = String(username || "PLAYER").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "PLAYER";
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `PF-${base}-${suffix}`;
  }

  function getReferralUrl(user = getUser()) {
    return `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, "register.html")}?ref=${encodeURIComponent(user.referralCode || "PF-ARENA")}`;
  }

  function normalizeAvatarPath(avatar) {
    const raw = String(avatar || DEFAULT_USER.avatar).trim();
    if (!raw) return DEFAULT_USER.avatar;
    if (raw.startsWith("http") || raw.startsWith("img/")) return raw;
    if (raw.startsWith("avatars/")) return "img/" + raw;
    if (raw.startsWith("avatar-")) return "img/avatars/" + raw;
    return raw;
  }


  function updateAdminEntryPoints(user = getUser()) {
    const isAdmin = isAdminUser(user);
    document.body.classList.toggle("is-admin-user", isAdmin);

    // Production rule: the Admin Center has no public entry point inside the game UI.
    // Admin access remains available only by opening admin-center.html directly.
    document.querySelectorAll("[data-admin-entry], [data-admin-entry-auto], .arena-btn-admin, .arena-header-admin-link").forEach((el) => {
      el.remove();
    });
  }

  function renderUser(user = getUser()) {
    user.level = getLevelFromXp(user.xp);
    user.avatar = normalizeAvatarPath(user.avatar);
    const isAuth = hasRegisteredUser();
    document.body.classList.toggle("is-authenticated", isAuth);
    document.body.classList.add("auth-ready");
    updateAdminEntryPoints(user);

    document.querySelectorAll("[data-user-tokens]").forEach((el) => {
      el.textContent = Number(user.tokens || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-user-xp]").forEach((el) => {
      el.textContent = Number(user.xp || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-user-level]").forEach((el) => {
      el.textContent = user.level;
    });
    document.querySelectorAll("[data-user-name]").forEach((el) => {
      el.textContent = user.username || "ProFantasy";
    });
    document.querySelectorAll("[data-user-streak]").forEach((el) => {
      el.textContent = Number(user.streak || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-user-referral-code]").forEach((el) => {
      el.textContent = user.referralCode || "PF-ARENA";
    });
    document.querySelectorAll("[data-user-referral-earned], [data-referral-earned]").forEach((el) => {
      el.textContent = Number(user.referralEarned || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-referral-friends]").forEach((el) => {
      el.textContent = Number(user.referralFriends || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-referral-qualified]").forEach((el) => {
      el.textContent = Number(user.referralQualified || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-referral-claimed]").forEach((el) => {
      el.textContent = Number(user.referralRewardsClaimed || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-user-xp-bar]").forEach((el) => {
      el.style.width = Math.min(100, Math.round((Number(user.xp || 0) / 5000) * 100)) + "%";
    });
    document.querySelectorAll("[data-user-avatar]").forEach((img) => {
      const avatarPath = normalizeAvatarPath(user.avatar || DEFAULT_USER.avatar);
      img.src = avatarPath;
      img.removeAttribute("hidden");
      img.hidden = false;
      img.style.display = "block";
      img.onerror = () => {
        img.style.display = "none";
        const wrap = img.closest(".profile-avatar, .leader-avatar, .leader-mini-avatar, .avatar-option");
        const fallback = wrap ? wrap.querySelector("[data-user-avatar-fallback]") : null;
        if (fallback) fallback.hidden = false;
      };
      img.onload = () => {
        img.style.display = "block";
        const wrap = img.closest(".profile-avatar, .leader-avatar, .leader-mini-avatar, .avatar-option");
        const fallback = wrap ? wrap.querySelector("[data-user-avatar-fallback]") : null;
        if (fallback) fallback.hidden = true;
      };
    });
    document.querySelectorAll("[data-user-avatar-fallback]").forEach((el) => {
      el.textContent = String(user.username || "P").charAt(0).toUpperCase();
      if (user.avatar) el.hidden = true;
    });
    document.querySelectorAll("[data-referral-link]").forEach((input) => {
      input.value = getReferralUrl(user);
    });

    renderMissionsPage(user);

    const playedToday = Object.keys(user.predictions || {}).length;
    document.querySelectorAll("[data-user-prediction-count]").forEach((el) => {
      el.textContent = Number(playedToday || 0).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-user-xp-next]").forEach((el) => {
      el.textContent = Number(getNextLevelXp(user.xp)).toLocaleString("it-IT");
    });
    document.querySelectorAll("[data-user-streak-bar]").forEach((el) => {
      el.style.width = Math.min(100, Math.round((Number(user.streak || 0) / 7) * 100)) + "%";
    });
    document.querySelectorAll("[data-referral-card-bar]").forEach((el) => {
      const qualified = Number(user.referralQualified || 0);
      el.style.width = Math.min(100, Math.round((qualified / 3) * 100)) + "%";
    });

    renderProgressionCards(user);
    renderLobbyMissionPreview(user);
    renderArenaLiveFeed(user);
    renderPredictionHistory(user);
    renderLobbyPredictionPreview(user);
    renderLobbyNextMatch(user);
  }

  function getNextPredictionResetTarget(now = getNow()) {
    const days = groupFixturesByDay(getFixturePool());
    if (!days.length) return null;

    const activeDay = getActivePredictionDay(now);
    const nextFutureDay = days.find((day) =>
      day.key !== activeDay.key && day.matches.some((match) => match.kickoff > now)
    );

    if (activeDay.isFuture && activeDay.unlockAt) {
      return {
        type: "unlock",
        date: activeDay.unlockAt,
        day: activeDay,
        label: `Le prediction del ${activeDay.matches[0]?.dateLabel || "prossimo matchday"} si sbloccano alle 00:01.`
      };
    }

    if (nextFutureDay) {
      const unlockAt = getPredictionUnlockAt(nextFutureDay);
      const targetDate = unlockAt && unlockAt > now ? unlockAt : nextFutureDay.firstKickoff;
      return {
        type: "next-day",
        date: targetDate,
        day: nextFutureDay,
        label: `Prossimo reset: ${nextFutureDay.matches[0]?.dateLabel || "matchday successivo"} alle 00:01.`
      };
    }

    const nextMatch = getNextFixture(now);
    if (nextMatch) {
      return {
        type: "match",
        date: nextMatch.kickoff,
        day: null,
        label: `Prossimo match: ${nextMatch.home} vs ${nextMatch.away}.`
      };
    }

    return null;
  }

  function countdownToMidnight() {
    const now = getNow();
    const target = getNextPredictionResetTarget(now);

    document.querySelectorAll("[data-midnight-countdown]").forEach((el) => {
      if (!target || !target.date) {
        el.textContent = "--:--:--";
        return;
      }
      el.textContent = formatCountdown(target.date - now);
    });

    document.querySelectorAll("[data-next-prediction-label]").forEach((el) => {
      el.textContent = target?.label || "Nessuna prediction futura programmata.";
    });
  }

  function renderMissionsPage(user = getUser()) {
    document.querySelectorAll("[data-mission-card]").forEach((card) => {
      const key = card.dataset.missionCard;
      const mission = getMissionByKey(key);
      const progress = getMissionProgress(key, user);
      const claimed = Boolean(user.missionRewards && user.missionRewards[key]);
      const percent = Math.min(100, Math.round((progress.value / Math.max(1, progress.target)) * 100));
      const bar = card.querySelector("[data-mission-progress]");
      const count = card.querySelector("[data-mission-count]");
      const claim = card.querySelector("[data-mission-claim]");
      const status = card.querySelector("[data-mission-status]");

      if (bar) bar.style.width = percent + "%";
      if (count) {
        if (key === "top_50") count.textContent = progress.complete ? "Top 50" : `Rank #${progress.rank || "--"} · ${progress.played || 0}/5 pron.`;
        else count.textContent = `${progress.value} / ${progress.target}`;
      }

      card.classList.toggle("is-complete", progress.complete);
      card.classList.toggle("is-claimed", claimed);

      if (claim) {
        claim.disabled = claimed || !progress.complete;
        claim.textContent = claimed ? "Riscattata" : progress.complete ? "Riscatta reward" : "Non completata";
      }

      if (status) {
        status.textContent = claimed ? "Reward già accreditato" : progress.complete ? "Missione completata: reward pronto" : "Completa l’obiettivo per sbloccare il reward";
      }
    });
  }

  async function claimSupabaseMission(missionKey) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("pfa_claim_mission", { p_mission_key: missionKey });
    if (error) {
      const message = String(error.message || "");
      if (message.includes("Could not find the function") || message.includes("schema cache") || message.includes("mission_claims")) {
        throw new Error("Funzione missioni Supabase non trovata. Esegui SUPABASE_MISSIONS_STEP3_SQL.sql e SUPABASE_MISSION_TOP50_LIVE_FIX_SQL.sql nel SQL Editor e ricarica.");
      }
      throw error;
    }
    await refreshSupabaseProfileCache();
    await refreshSupabaseLeaderboard();
    return data;
  }

  function claimLocalMission(missionKey) {
    const mission = getMissionByKey(missionKey);
    const user = getUser();
    if (!mission) return user;
    const progress = getMissionProgress(missionKey, user);
    if (!progress.complete) throw new Error("Missione non ancora completata.");
    if (user.missionRewards && user.missionRewards[missionKey]) throw new Error("Reward già riscattato.");
    const updated = {
      ...user,
      tokens: Number(user.tokens || 0) + Number(mission.tokens || 0),
      xp: Number(user.xp || 0) + Number(mission.xp || 0),
      missionRewards: {
        ...(user.missionRewards || {}),
        [missionKey]: { claimed: true, tokens: mission.tokens || 0, xp: mission.xp || 0, claimedAt: new Date().toISOString() }
      }
    };
    return saveUser(updated);
  }

  function setupMissions() {
    const root = document.querySelector("[data-missions-page]");
    if (!root) return;
    renderMissionsPage(getUser());
    root.querySelectorAll("[data-mission-claim]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const card = btn.closest("[data-mission-card]");
        const key = card ? card.dataset.missionCard : "";
        if (!key) return;
        if (!hasRegisteredUser()) { window.location.href = "register.html"; return; }
        const status = card.querySelector("[data-mission-status]");
        btn.disabled = true;
        if (status) status.textContent = "Accredito reward in corso...";
        try {
          if (SUPABASE_ENABLED && getUser().isSupabase) await claimSupabaseMission(key);
          else claimLocalMission(key);
          renderMissionsPage(getUser());
          if (status) status.textContent = "Reward accreditato sul profilo.";
        } catch (error) {
          console.error(error);
          if (status) status.textContent = error.message || "Reward non riscattabile.";
          renderMissionsPage(getUser());
        }
      });
    });
  }

  function activateLocalPreviewUser() {
    const existing = getUser();
    const user = { ...DEFAULT_USER, ...existing, registered: true };
    if (!localStorage.getItem(STORE_KEY)) {
      user.tokens = 1000;
      user.xp = 0;
      user.level = 1;
      user.predictions = {};
      user.referralCode = makeReferralCode(user.username);
    }
    return saveUser(user);
  }

  function setupRegistration() {
    const form = document.querySelector("[data-register-form]");

    const params = new URLSearchParams(window.location.search);
    if (form) {
    const ref = params.get("ref") || "";
    const referredInput = form.querySelector("[data-referred-by]");
    const refNote = document.querySelector("[data-ref-note]");
    const refLabel = document.querySelector("[data-ref-code-label]");
    if (ref && referredInput) {
      referredInput.value = ref;
      if (refNote) refNote.hidden = false;
      if (refLabel) refLabel.textContent = ref;
    }

    form.querySelectorAll("[data-avatar-option]").forEach((btn) => {
      btn.addEventListener("click", () => {
        form.querySelectorAll("[data-avatar-option]").forEach((item) => item.classList.remove("is-selected"));
        btn.classList.add("is-selected");
        const hidden = form.querySelector("[data-selected-avatar]");
        if (hidden) hidden.value = btn.dataset.avatarOption;
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const username = String(data.get("username") || "").trim();
      const email = String(data.get("email") || "").trim();
      const password = String(data.get("password") || "").trim();
      const avatar = String(data.get("avatar") || DEFAULT_USER.avatar);
      const referredBy = String(data.get("referredBy") || "").trim();
      const message = document.querySelector("[data-auth-message]");
      const submit = form.querySelector("button[type='submit']");
      if (!username || !email || !password) return;

      if (message) message.textContent = "Creo il profilo reale su Supabase...";
      if (submit) submit.disabled = true;

      try {
        if (SUPABASE_ENABLED) {
          const user = await createSupabaseAccount({ username, email, password, avatar, referredBy });
          if (user && user.pendingEmail) {
            if (message) message.textContent = "Registrazione creata. Controlla la tua email, clicca su Verifica account e poi accedi all’Arena.";
            if (submit) submit.disabled = false;
            return;
          }
          if (!user) throw new Error("Profilo creato, ma sessione non attiva. Controlla se la conferma email è abilitata su Supabase.");
          renderUser(user);
          window.location.href = "arena.html";
          return;
        }

        const user = {
          ...DEFAULT_USER,
          id: "pf_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
          username,
          email,
          avatar,
          referredBy,
          registered: true,
          tokens: 1000,
          xp: 0,
          level: 1,
          streak: 0,
          predictions: {},
          missionRewards: {},
          bracketSaved: false,
          referralCode: makeReferralCode(username),
          referralFriends: 0,
          referralEarned: 0,
          referralQualified: 0,
          referralRewardsClaimed: 0,
          referralInvites: []
        };
        saveUser(user);
        window.location.href = "arena.html";
      } catch (error) {
        console.error(error);
        if (message) message.textContent = error.message || "Registrazione non riuscita.";
        if (submit) submit.disabled = false;
      }
    });

    }

    const loginForm = document.querySelector("[data-login-form]");
    if (loginForm) {
      const confirmNote = document.querySelector("[data-confirm-note]");
      const authParams = new URLSearchParams(window.location.search);
      if (confirmNote && (authParams.get("confirmed") === "1" || window.location.hash.includes("access_token"))) {
        confirmNote.hidden = false;
      }

      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const data = new FormData(loginForm);
        const email = String(data.get("email") || "").trim();
        const password = String(data.get("password") || "").trim();
        const message = document.querySelector("[data-login-message]");
        const submit = loginForm.querySelector("button[type='submit']");
        if (!email || !password) return;
        if (message) message.textContent = "Accesso in corso...";
        if (submit) submit.disabled = true;
        try {
          const user = await loginSupabaseAccount({ email, password });
          if (!user) throw new Error("Accesso non riuscito. Verifica email e password.");
          renderUser(user);
          const redirectTarget = new URLSearchParams(window.location.search).get("redirect");
          const safeRedirects = new Set([
            "index.html",
            "world-cup.html",
            "arena.html",
            "admin-center.html",
            "daily-prediction.html",
            "missions.html",
            "bracket.html",
            "leaderboard.html",
            "referral.html",
            "legal.html"
          ]);
          // Production flow: a normal login returns to the page that opened login.html
          // when the redirect is explicitly allowed. Admin Center remains reachable
          // only through direct URL / explicit redirect=admin-center.html.
          const destination = safeRedirects.has(redirectTarget) ? redirectTarget : "arena.html";
          window.location.href = destination;
        } catch (error) {
          console.error(error);
          if (message) message.textContent = error.message || "Accesso non riuscito.";
          if (submit) submit.disabled = false;
        }
      });
    }
  }

  function readExactScoreSelection(card, choice) {
    const toggle = card.querySelector("[data-exact-score-toggle]");
    const enabled = Boolean(toggle && toggle.checked);
    if (!enabled) {
      return {
        enabled: false,
        homeScore: null,
        awayScore: null,
        score: "",
        cost: 0,
        reward: 0
      };
    }

    const homeInput = card.querySelector("[data-exact-home-score]");
    const awayInput = card.querySelector("[data-exact-away-score]");
    const homeScore = normalizeScoreNumber(homeInput && homeInput.value);
    const awayScore = normalizeScoreNumber(awayInput && awayInput.value);

    if (homeScore === null || awayScore === null) {
      throw new Error("Inserisci entrambi i gol del risultato esatto.");
    }

    const scoreChoice = deriveChoiceFromScores(homeScore, awayScore);
    if (choice && scoreChoice && choice !== scoreChoice) {
      throw new Error(`Il risultato esatto ${homeScore}-${awayScore} non è coerente con la scelta ${choice}.`);
    }

    return {
      enabled: true,
      homeScore,
      awayScore,
      score: `${homeScore}-${awayScore}`,
      cost: EXACT_SCORE_COST,
      reward: EXACT_SCORE_REWARD
    };
  }

  function setupExactScorePanels(scope = document) {
    scope.querySelectorAll("[data-exact-score-panel]").forEach((panel) => {
      const toggle = panel.querySelector("[data-exact-score-toggle]");
      const fields = panel.querySelector("[data-exact-fields]");
      const hint = panel.querySelector("[data-exact-score-hint]");
      const card = panel.closest("[data-match-card]");
      if (!toggle || !fields || panel.dataset.exactPanelReady === "1") return;
      panel.dataset.exactPanelReady = "1";
      const sync = () => {
        panel.classList.toggle("is-enabled", toggle.checked);
        fields.setAttribute("aria-hidden", toggle.checked ? "false" : "true");
        fields.querySelectorAll("input").forEach((input) => { input.disabled = !toggle.checked; });
        if (card) card.querySelectorAll("button[data-choice]").forEach((btn) => btn.classList.remove("is-suggested-choice"));
        if (!hint) return;
        if (!toggle.checked) {
          hint.textContent = "Attiva questa opzione prima di cliccare 1/X/2: il click sull’esito invia la giocata.";
          return;
        }
        const home = normalizeScoreNumber(panel.querySelector("[data-exact-home-score]")?.value);
        const away = normalizeScoreNumber(panel.querySelector("[data-exact-away-score]")?.value);
        const choice = deriveChoiceFromScores(home, away);
        if (!choice) {
          hint.textContent = "Inserisci i gol, poi clicca l’esito coerente: 1, X o 2.";
          return;
        }
        const choiceLabel = choice === "1" ? "1 · Casa" : choice === "2" ? "2 · Ospite" : "X · Pareggio";
        hint.textContent = `Score ${home}-${away}: ora devi cliccare ${choiceLabel} per inviare.`;
        if (card) {
          const suggested = card.querySelector(`button[data-choice="${choice}"]`);
          if (suggested) suggested.classList.add("is-suggested-choice");
        }
      };
      toggle.addEventListener("change", sync);
      fields.querySelectorAll("input").forEach((input) => input.addEventListener("input", sync));
      sync();
    });
  }

  function setupPredictions() {
    renderDailyPredictionPage();
    setupExactScorePanels(document);
    const cards = document.querySelectorAll("[data-match-card]");
    if (!cards.length) return;

    let user = getUser();
    cards.forEach((card) => {
      const id = card.dataset.matchId;
      const saved = user.predictions && user.predictions[id];
      applyCardState(card, saved);

      card.querySelectorAll("button[data-choice]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (!hasRegisteredUser()) {
            window.location.href = "register.html";
            return;
          }
          user = getUser();
          if (user.predictions && user.predictions[id]) return;

          let exactSelection;
          try {
            exactSelection = readExactScoreSelection(card, btn.dataset.choice);
          } catch (error) {
            alert(error.message || "Controlla il risultato esatto inserito.");
            return;
          }

          const totalCost = COST + Number(exactSelection.cost || 0);
          if ((user.tokens || 0) < totalCost) {
            alert(`Token insufficienti per questa giocata. Servono ${totalCost} token.`);
            return;
          }

          const matchInfo = {
            home: card.dataset.home || getMatchLabels()[id]?.home || "HOME",
            away: card.dataset.away || getMatchLabels()[id]?.away || "AWAY",
            time: card.dataset.time || getMatchLabels()[id]?.time || "Oggi"
          };

          card.querySelectorAll("button[data-choice]").forEach((choiceBtn) => choiceBtn.disabled = true);
          card.querySelectorAll("[data-exact-score-toggle], [data-exact-home-score], [data-exact-away-score]").forEach((input) => input.disabled = true);

          try {
            if (SUPABASE_ENABLED && user.id) {
              await submitSupabasePrediction({
                matchId: id,
                choice: btn.dataset.choice,
                exactScoreEnabled: exactSelection.enabled,
                exactHomeScore: exactSelection.homeScore,
                exactAwayScore: exactSelection.awayScore,
                ...matchInfo
              });
              user = getUser();
              applyCardState(card, user.predictions && user.predictions[id]);
              renderDailyPredictionPage();
              return;
            }

            user.tokens -= totalCost;
            user.xp = Number(user.xp || 0) + XP_PER_PREDICTION;
            user.level = getLevelFromXp(user.xp);
            user.predictions = user.predictions || {};
            user.predictions[id] = {
              choice: btn.dataset.choice,
              status: "pending",
              cost: totalCost,
              reward: 125,
              exactScoreEnabled: exactSelection.enabled,
              exactHomeScore: exactSelection.homeScore,
              exactAwayScore: exactSelection.awayScore,
              exactScoreCost: exactSelection.enabled ? EXACT_SCORE_COST : 0,
              exactScoreReward: exactSelection.enabled ? EXACT_SCORE_REWARD : 0,
              exactScoreStatus: exactSelection.enabled ? "pending" : "",
              playedAt: new Date().toISOString(),
              ...matchInfo
            };

            user.streak = Math.max(Number(user.streak || 0), computeDailyStreak(user));
            saveUser(user);
            applyCardState(card, user.predictions[id]);
          } catch (error) {
            console.error(error);
            alert(error.message || "Prediction non salvata. Controlla di aver eseguito lo script SQL Token Sync su Supabase.");
            card.querySelectorAll("button[data-choice]").forEach((choiceBtn) => choiceBtn.disabled = false);
            setupExactScorePanels(card);
          }
        });
      });
    });
  }

  function applyCardState(card, saved) {
    if (!saved) return;
    card.classList.add("is-played");
    if (saved.status === "won") card.classList.add("is-won");
    if (saved.status === "lost") card.classList.add("is-lost");

    const exactLabel = getExactScoreLabel(saved);
    const exactStatus = getExactScoreStatusLabel(saved);
    const status = card.querySelector("[data-match-status]") || card.querySelector(".daily-match-top b");
    const statusLabel = saved.status === "won"
      ? `Vinta${saved.exactScoreStatus === "won" ? " · Perfect Score" : ""}`
      : saved.status === "lost"
        ? `Persa · esito ${saved.finalResult || ""}`
        : `Giocata: ${saved.choice}${exactLabel ? ` · ${exactLabel}` : ""}`;
    if (status) status.textContent = statusLabel;

    const toggle = card.querySelector("[data-exact-score-toggle]");
    const homeInput = card.querySelector("[data-exact-home-score]");
    const awayInput = card.querySelector("[data-exact-away-score]");
    if (toggle && saved.exactScoreEnabled) toggle.checked = true;
    if (homeInput && saved.exactHomeScore !== null && saved.exactHomeScore !== undefined) homeInput.value = saved.exactHomeScore;
    if (awayInput && saved.exactAwayScore !== null && saved.exactAwayScore !== undefined) awayInput.value = saved.exactAwayScore;
    card.querySelectorAll("[data-exact-score-toggle], [data-exact-home-score], [data-exact-away-score]").forEach((input) => { input.disabled = true; });
    if (saved.exactScoreEnabled) card.classList.add("has-exact-score");

    const msg = card.querySelector("[data-played-message]");
    if (msg) {
      const exactCopy = exactLabel
        ? `<span class="daily-exact-result-copy">Risultato esatto: <b>${exactLabel}</b>${exactStatus ? ` · ${exactStatus}` : ""}</span>`
        : "";
      if (saved.status === "won") {
        msg.innerHTML = `<strong>${saved.exactScoreStatus === "won" ? "Perfect Score" : "Prediction vinta"}</strong><span>Scelta ${saved.choice} corretta. Reward base accreditato.</span>${exactCopy}`;
      } else if (saved.status === "lost") {
        msg.innerHTML = `<strong>Prediction persa</strong><span>Scelta ${saved.choice}. Esito finale ${saved.finalResult || "-"}.</span>${exactCopy}`;
      } else {
        msg.innerHTML = `<strong>Pronostico inviato</strong><span>Scelta ${saved.choice} salvata. In attesa risultato.</span>${exactCopy}`;
      }
    }

    card.querySelectorAll("button[data-choice]").forEach((btn) => {
      btn.disabled = true;
      if (btn.dataset.choice === saved.choice) btn.classList.add("is-selected");
    });
  }

  function renderPredictionHistory(user = getUser()) {
    const list = document.querySelector("[data-prediction-history]");
    if (!list) return;
    const entries = Object.entries(user.predictions || {});
    if (!entries.length) {
      list.innerHTML = `<article class="history-empty">Nessuna prediction giocata oggi.</article>`;
      return;
    }

    list.innerHTML = entries.map(([id, item]) => {
      const home = item.home || getMatchLabels()[id]?.home || "HOME";
      const away = item.away || getMatchLabels()[id]?.away || "AWAY";
      const exactLabel = getExactScoreLabel(item);
      const exactStatus = getExactScoreStatusLabel(item);
      const status = item.status === "won"
        ? (item.exactScoreStatus === "won" ? "Vinta · Perfect Score" : "Vinta")
        : item.status === "lost"
          ? "Persa"
          : "In attesa risultato";
      return `
        <article class="history-row ${item.exactScoreStatus === "won" ? "is-perfect" : ""}">
          <span>${home} vs ${away}</span>
          <strong>Scelta ${item.choice}${exactLabel ? ` · ${exactLabel}` : ""}</strong>
          <b>- ${Number(item.cost || COST).toLocaleString("it-IT")} token</b>
          <em>${status}${exactStatus && item.status !== "won" ? ` · ${exactStatus}` : ""}</em>
        </article>
      `;
    }).join("");
  }



  function getDailyMatchesWithDates() {
    return getActivePredictionDay().matches;
  }

  function formatClock(date) {
    return new Date(date).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDateShort(date) {
    return new Date(date).toLocaleDateString("it-IT", { weekday: "short", day: "2-digit", month: "short" });
  }

  function formatCountdown(ms) {
    const safe = Math.max(0, Number(ms || 0));
    const days = Math.floor(safe / 864e5);
    const h = String(Math.floor((safe % 864e5) / 36e5)).padStart(2, "0");
    const m = String(Math.floor((safe % 36e5) / 6e4)).padStart(2, "0");
    const s = String(Math.floor((safe % 6e4) / 1000)).padStart(2, "0");
    return days > 0 ? `${days}g ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
  }

  function getNextLobbyMatch() {
    const now = getNow();
    const next = getNextFixture(now);
    if (!next) return null;
    const todayKey = toLocalDayKey(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = toLocalDayKey(tomorrow);
    const dayKey = toLocalDayKey(next.kickoff);
    return {
      ...next,
      dayLabel: dayKey === todayKey ? "Oggi" : (dayKey === tomorrowKey ? "Domani" : formatDateShort(next.kickoff)),
      isTomorrow: dayKey !== todayKey,
      isClosed: false
    };
  }

  function getPredictionStateForMatch(match, user, now = getNow()) {
    const saved = user.predictions && user.predictions[match.id];
    const result = getAdminResult(match.id);
    if (saved && saved.status === "won") return { label: "Vinta", type: "played" };
    if (saved && saved.status === "lost") return { label: "Persa", type: "played" };
    if (saved) return { label: `Scelta ${saved.choice}`, type: "played" };
    if (result && result.status === "finished") return { label: `Finita · ${result.result}`, type: "locked" };
    if (match.kickoff <= now) return { label: "Live / Chiusa", type: "locked" };
    return { label: "Da giocare", type: "open" };
  }

  function renderLobbyNextMatch(user = getUser()) {
    const card = document.querySelector("[data-nextmatch-card]");
    if (!card) return;

    const next = getNextLobbyMatch();
    const now = getNow();
    const activeDay = getActivePredictionDay(now);
    const activeMatches = activeDay.matches;
    const playedActive = activeMatches.filter((match) => user.predictions && user.predictions[match.id]).length;
    const remainingActive = activeMatches.filter((match) => {
      const state = getPredictionStateForMatch(match, user, now);
      return state.type === "open";
    }).length;

    const countEl = card.querySelector("[data-user-prediction-count]");
    const homeEl = card.querySelector("[data-nextmatch-home]");
    const awayEl = card.querySelector("[data-nextmatch-away]");
    const homeFlag = card.querySelector("[data-nextmatch-home-flag]");
    const awayFlag = card.querySelector("[data-nextmatch-away-flag]");
    const kickoffEl = card.querySelector("[data-nextmatch-kickoff]");
    const countdownEl = card.querySelector("[data-nextmatch-countdown]");
    const statusEl = card.querySelector("[data-nextmatch-status]");
    const totalEl = card.querySelector("[data-daily-match-total]");

    if (countEl) countEl.textContent = Number(playedActive || 0).toLocaleString("it-IT");
    if (!next) {
      if (homeEl) homeEl.textContent = "---";
      if (awayEl) awayEl.textContent = "---";
      if (kickoffEl) kickoffEl.textContent = "Calendario non disponibile";
      if (countdownEl) countdownEl.textContent = "--";
      if (statusEl) statusEl.textContent = "Carica il calendario per attivare la lobby live";
      return;
    }

    if (homeEl) homeEl.textContent = next.home;
    if (awayEl) awayEl.textContent = next.away;
    if (homeFlag) { homeFlag.src = next.homeFlag; homeFlag.alt = next.homeName || next.home; }
    if (awayFlag) { awayFlag.src = next.awayFlag; awayFlag.alt = next.awayName || next.away; }
    if (kickoffEl) kickoffEl.textContent = `${next.dayLabel} • ${formatClock(next.kickoff)}`;
    if (countdownEl) countdownEl.textContent = formatCountdown(next.kickoff - now);
    if (totalEl) totalEl.textContent = activeMatches.length;

    if (statusEl) {
      if (!activeDay.isToday) {
        statusEl.innerHTML = `Prossimo matchday · <strong>${formatDateShort(next.kickoff)}</strong>`;
      } else if (remainingActive === 0) {
        statusEl.innerHTML = "Hai completato o chiuso tutte le prediction di oggi";
      } else {
        statusEl.innerHTML = `<strong>${remainingActive}</strong> prediction disponibili oggi`;
      }
    }

    const progressWindow = Math.max(1, next.kickoff - now);
    const fill = Math.min(100, Math.max(0, 100 - ((progressWindow / (24 * 60 * 60 * 1000)) * 100)));
    card.style.setProperty("--nextmatch-progress", `${fill}%`);
  }

  function renderLobbyPredictionPreview(user = getUser()) {
    const list = document.querySelector("[data-lobby-prediction-list]");
    if (!list) return;

    const now = getNow();
    const activeDay = getActivePredictionDay(now);
    const matches = activeDay.matches;
    if (!matches.length) {
      list.innerHTML = `<article class="is-locked"><span>Calendario non disponibile</span><b>--</b><em>LOCK</em></article>`;
      return;
    }

    list.innerHTML = matches.map((match) => {
      const state = getPredictionStateForMatch(match, user, now);
      const locked = state.type === "locked" || !activeDay.isToday;
      const played = state.type === "played";
      return `
        <article class="${played ? "is-played" : ""} ${locked && !played ? "is-locked" : ""}">
          <span><img src="${match.homeFlag}" alt="${match.homeName || match.home}" loading="lazy"> ${match.home} vs ${match.away} <img src="${match.awayFlag}" alt="${match.awayName || match.away}" loading="lazy"></span>
          <b>${formatClock(match.kickoff)}</b>
          <em>${!activeDay.isToday && !played ? "LOCK" : state.label}</em>
        </article>
      `;
    }).join("");
  }

  function updateFixtureCountdowns() {
    const now = getNow();
    document.querySelectorAll("[data-match-countdown][data-kickoff]").forEach((el) => {
      const kickoff = new Date(el.dataset.kickoff);
      if (Number.isNaN(kickoff.getTime())) return;
      const diff = kickoff - now;
      el.textContent = diff <= 0 ? "Live / chiusa" : formatCountdown(diff);
    });
    document.querySelectorAll("[data-unlock-countdown][data-unlock]").forEach((el) => {
      const unlockAt = new Date(el.dataset.unlock);
      if (Number.isNaN(unlockAt.getTime())) return;
      const diff = unlockAt - now;
      el.textContent = diff <= 0 ? "Disponibile" : formatCountdown(diff);
    });
  }

  function matchCardTemplate(match, user, activeDay, lockedByDay = false) {
    const now = getNow();
    const saved = user.predictions && user.predictions[match.id];
    const hasStarted = match.kickoff <= now;
    const unlockAt = activeDay?.unlockAt || null;
    const dayLocked = lockedByDay || !activeDay.isToday;
    const locked = dayLocked || hasStarted;
    const status = saved ? getMatchAdminStatus(match, user, now) : (getAdminResult(match.id) ? getMatchAdminStatus(match, user, now) : (locked ? "LOCK" : "Disponibile"));
    const classes = ["daily-match-card", saved ? "is-played" : "", locked && !saved ? "is-locked" : "is-open"].join(" ");
    const lockCopy = dayLocked && unlockAt
      ? `Si sblocca tra <strong data-unlock-countdown data-unlock="${unlockAt.toISOString()}">${formatCountdown(unlockAt - now)}</strong>`
      : "Prediction chiusa o match già iniziato";
    const exactHomeValue = saved && saved.exactHomeScore !== null && saved.exactHomeScore !== undefined ? saved.exactHomeScore : "";
    const exactAwayValue = saved && saved.exactAwayScore !== null && saved.exactAwayScore !== undefined ? saved.exactAwayScore : "";
    const exactChecked = saved && saved.exactScoreEnabled ? "checked" : "";
    const choices = locked && !saved ? `<p class="locked-copy">${lockCopy}</p>` : `
      <div class="daily-economy"><span>Costo base 50 token</span><strong>Reward +125</strong></div>
      <div class="daily-exact-score" data-exact-score-panel>
        <label class="daily-exact-toggle">
          <input type="checkbox" data-exact-score-toggle ${exactChecked} ${saved ? "disabled" : ""}>
          <span>🎯 Risultato esatto</span>
          <strong>+50 token · premio +500</strong>
        </label>
        <div class="daily-exact-fields" data-exact-fields aria-hidden="true">
          <label><span>${escapeHtml(match.home)}</span><input type="number" min="0" max="20" inputmode="numeric" data-exact-home-score value="${escapeHtml(exactHomeValue)}" placeholder="0"></label>
          <i>-</i>
          <label><span>${escapeHtml(match.away)}</span><input type="number" min="0" max="20" inputmode="numeric" data-exact-away-score value="${escapeHtml(exactAwayValue)}" placeholder="0"></label>
          <small data-exact-score-hint>Attiva questa opzione prima di cliccare 1/X/2: il click sull’esito invia la giocata.</small>
        </div>
      </div>
      <div class="daily-choice-helper"><span>Step finale</span><strong>Clicca 1 / X / 2 solo quando sei sicuro: invia subito la prediction.</strong></div>
      <div class="daily-choice-row">
        <button type="button" data-choice="1">1<small>Casa</small></button>
        <button type="button" data-choice="X">X<small>Pari</small></button>
        <button type="button" data-choice="2">2<small>Ospite</small></button>
      </div>
      <div class="daily-played-message" data-played-message></div>
    `;
    return `
      <article class="${classes}" data-match-card data-match-id="${match.id}" data-home="${match.home}" data-away="${match.away}" data-time="${match.dateLabel} • ${match.timeLabel}">
        <div class="daily-match-bg match-bg-fixture" aria-hidden="true"></div>
        ${locked && !saved ? `<div class="lock-badge">LOCK</div>` : ""}
        <div class="daily-match-top"><span>${match.dateLabel} • ${match.timeLabel}</span><b data-match-status>${status}</b></div>
        <div class="daily-match-countdown"><span>${hasStarted ? "Stato match" : "Inizia tra"}</span><strong data-match-countdown data-kickoff="${match.kickoff.toISOString()}">${hasStarted ? "Live / chiusa" : formatCountdown(match.kickoff - now)}</strong></div>
        <div class="daily-teams daily-teams-flags">
          <strong><img src="${match.homeFlag}" alt="${match.homeName || match.home}" loading="lazy">${match.home}</strong>
          <span>VS</span>
          <strong>${match.away}<img src="${match.awayFlag}" alt="${match.awayName || match.away}" loading="lazy"></strong>
        </div>
        <p class="daily-match-meta">${match.group || "Group"} · ${match.stadium || "Stadium"}</p>
        ${choices}
      </article>
    `;
  }

  function renderDailyPredictionPage() {
    const openGrid = document.querySelector("[data-daily-match-grid]");
    const lockedGrid = document.querySelector("[data-daily-locked-grid]");
    if (!openGrid && !lockedGrid) return;

    const user = getUser();
    const activeDay = getActivePredictionDay();
    const fixtureDays = groupFixturesByDay(getFixturePool());
    const now = getNow();
    const todayPlayable = activeDay.isToday
      ? activeDay.matches.filter((match) => match.kickoff > now || (user.predictions && user.predictions[match.id]))
      : [];
    const nextVisibleDays = fixtureDays
      .filter((day) => day.matches.some((match) => match.kickoff > now) && day.key !== activeDay.key)
      .slice(0, 3);
    const futureMatches = activeDay.isToday
      ? nextVisibleDays.flatMap((day) => day.matches.slice(0, 4).map((match) => ({ match, day }))).slice(0, 12)
      : activeDay.matches.map((match) => ({ match, day: activeDay }));

    if (openGrid) {
      if (!todayPlayable.length) {
        const nextMatch = activeDay.matches[0];
        const unlockAt = activeDay.unlockAt;
        const countdownLabel = unlockAt && unlockAt > now
          ? `Si sblocca tra <b data-unlock-countdown data-unlock="${unlockAt.toISOString()}">${formatCountdown(unlockAt - now)}</b>`
          : (nextMatch ? `Inizia tra <b data-match-countdown data-kickoff="${nextMatch.kickoff.toISOString()}">${formatCountdown(nextMatch.kickoff - now)}</b>` : "Il prossimo matchday è in arrivo.");
        openGrid.innerHTML = `<article class="daily-empty-state"><strong>Prossimo matchday: ${nextMatch ? activeDay.matches[0].dateLabel : "--"}</strong><span>${countdownLabel}</span></article>`;
      } else {
        openGrid.innerHTML = todayPlayable.map((match) => matchCardTemplate(match, user, activeDay, false)).join("");
      }
    }
    if (lockedGrid) {
      lockedGrid.innerHTML = futureMatches.map(({ match, day }) => matchCardTemplate(match, user, { ...day, isToday: false, unlockAt: getPredictionUnlockAt(day) }, true)).join("");
    }

    document.querySelectorAll("[data-active-matchday-label]").forEach((el) => {
      el.textContent = activeDay.matches[0] ? activeDay.matches[0].dateLabel : "--";
    });
  }

  function setupBracket() {
    const btn = document.querySelector("[data-save-bracket]");
    if (!btn) return;
    const user = getUser();
    if (!hasRegisteredUser()) {
      btn.textContent = "Registrati per salvare";
    }
    if (user.bracketSaved) {
      document.querySelector(".bracket-arena")?.classList.add("is-saved");
      btn.textContent = "Bracket salvato";
      btn.disabled = true;
    }
    btn.addEventListener("click", () => {
      if (!hasRegisteredUser()) {
        window.location.href = "register.html";
        return;
      }
      const user = getUser();
      user.bracketSaved = true;
      user.xp = Number(user.xp || 0) + 200;
      saveUser(user);
      document.querySelector(".bracket-arena")?.classList.add("is-saved");
      btn.textContent = "Bracket salvato";
      btn.disabled = true;
    });
  }

  const REFERRAL_REWARD = 500;
  const REFERRAL_REQUIRED_PREDICTIONS = 3;

  async function claimSupabaseReferralReward(referralId) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("pfa_claim_referral_reward", { p_referral_id: referralId });
    if (error) {
      const message = String(error.message || "");
      if (message.includes("Could not find the function") || message.includes("schema cache") || message.includes("referrals")) {
        throw new Error("Funzione referral Supabase non trovata. Esegui SUPABASE_REFERRAL_STEP4_SQL.sql nel SQL Editor e ricarica.");
      }
      throw error;
    }
    await refreshSupabaseProfileCache();
    await refreshSupabaseLeaderboard();
    return data;
  }

  function normalizeReferralStats(user) {
    const invites = Array.isArray(user.referralInvites) ? user.referralInvites : [];
    user.referralInvites = invites;
    user.referralFriends = invites.length;
    user.referralQualified = invites.filter((item) => Number(item.predictions || 0) >= REFERRAL_REQUIRED_PREDICTIONS).length;
    user.referralRewardsClaimed = invites.filter((item) => item.rewardClaimed).length;
    user.referralEarned = user.referralRewardsClaimed * REFERRAL_REWARD;
    return user;
  }

  function addLocalReferral() {
    let user = getUser();
    if (!hasRegisteredUser()) {
      window.location.href = "register.html";
      return;
    }
    if (SUPABASE_ENABLED && user.id) {
      alert("Referral manuale disattivato: i bonus sono gestiti da Supabase.");
      return;
    }
    user.referralInvites = Array.isArray(user.referralInvites) ? user.referralInvites : [];
    const count = user.referralInvites.length + 1;
    user.referralInvites.push({
      id: "ref_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      username: `FriendPlayer${String(count).padStart(2, "0")}`,
      predictions: 0,
      rewardClaimed: false,
      joinedAt: new Date().toISOString()
    });
    user = normalizeReferralStats(user);
    saveUser(user);
    renderReferralPanel(user);
  }

  function updateReferralPrediction(id) {
    let user = getUser();
    if (SUPABASE_ENABLED && user.id) return;
    user.referralInvites = Array.isArray(user.referralInvites) ? user.referralInvites : [];
    const invite = user.referralInvites.find((item) => item.id === id);
    if (!invite || invite.rewardClaimed) return;
    invite.predictions = Math.min(REFERRAL_REQUIRED_PREDICTIONS, Number(invite.predictions || 0) + 1);
    user = normalizeReferralStats(user);
    saveUser(user);
    renderReferralPanel(user);
  }

  function claimReferralReward(id) {
    let user = getUser();
    if (SUPABASE_ENABLED && user.id) return;
    user.referralInvites = Array.isArray(user.referralInvites) ? user.referralInvites : [];
    const invite = user.referralInvites.find((item) => item.id === id);
    if (!invite || invite.rewardClaimed || Number(invite.predictions || 0) < REFERRAL_REQUIRED_PREDICTIONS) return;
    invite.rewardClaimed = true;
    invite.claimedAt = new Date().toISOString();
    user.tokens = Number(user.tokens || 0) + REFERRAL_REWARD;
    user.xp = Number(user.xp || 0) + 100;
    user = normalizeReferralStats(user);
    saveUser(user);
    renderReferralPanel(user);
  }

  function renderReferralPanel(user = getUser()) {
    if (!(SUPABASE_ENABLED && user.id)) user = normalizeReferralStats(user);
    const list = document.querySelector("[data-referral-list]");
    if (!list) return;

    if (!hasRegisteredUser()) {
      list.innerHTML = `<article class="referral-empty-state">Registrati per generare il tuo link e attivare i referral.</article>`;
      return;
    }

    const invites = Array.isArray(user.referralInvites) ? user.referralInvites : [];
    if (!invites.length) {
      list.innerHTML = `<article class="referral-empty-state">Nessun referral ancora registrato. Condividi il tuo link: appena un amico si registra da quel link comparirà qui.</article>`;
      return;
    }

    list.innerHTML = invites.map((invite) => {
      const required = Number(invite.required || REFERRAL_REQUIRED_PREDICTIONS);
      const predictions = Math.min(required, Number(invite.predictions || 0));
      const progress = Math.round((predictions / Math.max(1, required)) * 100);
      const qualified = Boolean(invite.qualified) || predictions >= required;
      const claimed = Boolean(invite.rewardClaimed);
      const status = claimed ? "Reward riscattato" : qualified ? "Reward disponibile" : `${predictions}/${required} prediction`;
      const reward = Number(invite.tokenReward || REFERRAL_REWARD);
      return `
        <article class="referral-progress-card ${qualified ? "is-qualified" : ""} ${claimed ? "is-claimed" : ""}">
          <div class="referral-progress-top">
            <span><i class="leader-mini-avatar"><img src="${invite.avatar || DEFAULT_USER.avatar}" alt=""></i>${invite.username}</span>
            <strong>${status}</strong>
          </div>
          <div class="referral-progress-bar"><i style="width:${progress}%;"></i></div>
          <div class="referral-progress-meta">
            <span>Condizione: ${required} pronostici</span>
            <b>Reward: +${reward} token</b>
          </div>
          <div class="referral-progress-actions">
            ${SUPABASE_ENABLED && user.id
              ? `<button type="button" data-referral-claim-real="${invite.id}" ${!qualified || claimed ? "disabled" : ""}>${claimed ? "Riscattato" : "Riscatta reward"}</button>`
              : `<button type="button" data-referral-add-prediction="${invite.id}" ${qualified || claimed ? "disabled" : ""}>+1 prediction</button><button type="button" data-referral-claim="${invite.id}" ${!qualified || claimed ? "disabled" : ""}>Riscatta reward</button>`
            }
          </div>
        </article>
      `;
    }).join("");

    list.querySelectorAll("[data-referral-add-prediction]").forEach((btn) => {
      btn.addEventListener("click", () => updateReferralPrediction(btn.dataset.referralAddPrediction));
    });

    list.querySelectorAll("[data-referral-claim]").forEach((btn) => {
      btn.addEventListener("click", () => claimReferralReward(btn.dataset.referralClaim));
    });

    list.querySelectorAll("[data-referral-claim-real]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Accredito...";
        try {
          await claimSupabaseReferralReward(btn.dataset.referralClaimReal);
          renderUser(getUser());
          renderReferralPanel(getUser());
        } catch (error) {
          alert(error.message || "Referral non riscattabile.");
          await refreshSupabaseProfileCache();
          renderReferralPanel(getUser());
        }
      });
    });
  }

  async function setupReferral() {
    const copy = document.querySelector("[data-copy-referral]");
    const input = document.querySelector("[data-referral-link]");
    const addLocale = document.querySelector("[data-add-locale-referral]");

    if (input && !hasRegisteredUser()) {
      input.value = "Registrati per generare il tuo link referral";
    }

    if (copy && input) {
      copy.addEventListener("click", async () => {
        if (!hasRegisteredUser()) {
          window.location.href = "register.html";
          return;
        }
        try {
          await navigator.clipboard.writeText(input.value);
          copy.textContent = "Copiato";
          setTimeout(() => (copy.textContent = "Copia"), 1400);
        } catch (e) {
          input.select();
          document.execCommand("copy");
        }
      });
    }

    if (addLocale) {
      if (SUPABASE_ENABLED && getUser().id) {
        addLocale.hidden = true;
      } else {
        addLocale.addEventListener("click", addLocalReferral);
      }
    }

    if (SUPABASE_ENABLED && getUser().id) await refreshSupabaseProfileCache();
    const user = SUPABASE_ENABLED && getUser().id ? getUser() : normalizeReferralStats(getUser());
    if (!(SUPABASE_ENABLED && user.id)) localStorage.setItem(STORE_KEY, JSON.stringify(user));
    renderUser(user);
    renderReferralPanel(user);
  }

  function setupAuthUi() {
    if (document.body.dataset.authUiReady === "true") return;
    document.body.dataset.authUiReady = "true";
    ensureLogoutModal();
    document.querySelectorAll("[data-logout-button]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        showLogoutModal();
      });
    });

    document.querySelectorAll("[data-auth-action]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const action = btn.dataset.authAction;
        if (action === "register") {
          event.preventDefault();
          const target = btn.getAttribute("href") || "register.html";
          window.location.href = target === "#" ? "register.html" : target;
          return;
        }
        if (action === "login") {
          event.preventDefault();
          window.location.href = "login.html";
        }
      });
    });
  }



  const LEADERBOARD_PREVIEW_PLAYERS = [
    { id: "bot-01", username: "ArenaKing", tokens: 12480, streak: 18, avatar: "img/avatars/avatar-02.png" },
    { id: "bot-02", username: "TokenWizard", tokens: 8940, streak: 14, avatar: "img/avatars/avatar-03.png" },
    { id: "bot-03", username: "GoalOracle", tokens: 7820, streak: 11, avatar: "img/avatars/avatar-04.png" },
    { id: "bot-04", username: "FinalBoss", tokens: 6920, streak: 12, avatar: "img/avatars/avatar-05.png" },
    { id: "bot-05", username: "CyberStriker", tokens: 6450, streak: 9, avatar: "img/avatars/avatar-06.png" },
    { id: "bot-06", username: "GoldenPick", tokens: 5990, streak: 7, avatar: "img/avatars/avatar-07.png" },
    { id: "bot-07", username: "NeonCaptain", tokens: 4380, streak: 6, avatar: "img/avatars/avatar-08.png" },
    { id: "bot-08", username: "BracketMaster", tokens: 3250, streak: 4, avatar: "img/avatars/avatar-09.png" },
    { id: "bot-09", username: "DailyHunter", tokens: 2100, streak: 3, avatar: "img/avatars/avatar-10.png" },
    { id: "bot-10", username: "RookieFC", tokens: 850, streak: 1, avatar: "img/avatars/avatar-01.png" }
  ];

  async function refreshSupabaseLeaderboard() {
    const supabase = getSupabase();
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.rpc("pfa_get_leaderboard", { p_limit: 100 });
      if (error) throw error;
      SUPABASE_LEADERBOARD_CACHE = (data || []).map((row) => ({
        id: row.id,
        username: row.username || "Player",
        tokens: Number(row.tokens || 0),
        streak: Number(row.daily_streak || 0),
        avatar: normalizeAvatarPath(row.avatar_url || DEFAULT_USER.avatar),
        rank: Number(row.rank || 0),
        current: row.id === getUser().id
      }));
      renderLeaderboard(getUser());
      renderProgressionCards(getUser());
      return SUPABASE_LEADERBOARD_CACHE;
    } catch (error) {
      console.warn("Supabase leaderboard fetch error", error);
      return null;
    }
  }

  function getLeaderboardRows(user = getUser()) {
    if (SUPABASE_ENABLED && !SUPABASE_LEADERBOARD_CACHE) {
      return hasRegisteredUser() ? [{
        id: user.id || "current-user",
        username: user.username || "Tu",
        tokens: Number(user.tokens || 0),
        xp: Number(user.xp || 0),
        streak: Number(user.streak || 0),
        avatar: user.avatar || DEFAULT_USER.avatar,
        rank: "--",
        current: true,
        loading: true
      }] : [];
    }
    if (SUPABASE_LEADERBOARD_CACHE && SUPABASE_LEADERBOARD_CACHE.length) {
      const currentId = user.id;
      const rows = SUPABASE_LEADERBOARD_CACHE.map((row) => {
        const current = row.id === currentId;
        return current ? {
          ...row,
          tokens: Number(user.tokens || row.tokens || 0),
          xp: Number(user.xp || row.xp || 0),
          streak: Number(user.streak || row.streak || 0),
          avatar: user.avatar || row.avatar,
          username: user.username || row.username,
          current: true
        } : { ...row, current: false };
      });
      if (currentId && !rows.some((row) => row.current)) {
        rows.push({
          id: currentId,
          username: user.username || "Tu",
          tokens: Number(user.tokens || 0),
          streak: Number(user.streak || 0),
          avatar: user.avatar || DEFAULT_USER.avatar,
          rank: rows.length + 1,
          current: true
        });
      }
      return rows.sort((a, b) => Number(a.rank || 9999) - Number(b.rank || 9999));
    }

    const player = {
      id: user.id || "current-user",
      username: hasRegisteredUser() ? (user.username || "ProFantasy") : "Tu",
      tokens: Number(user.tokens || 0),
      streak: Number(user.streak || 0),
      avatar: user.avatar || DEFAULT_USER.avatar,
      current: true
    };

    return [...LEADERBOARD_PREVIEW_PLAYERS, player]
      .sort((a, b) => Number(b.tokens || 0) - Number(a.tokens || 0))
      .map((item, index) => ({ ...item, rank: index + 1 }));
  }

  function renderLeaderboard(user = getUser()) {
    const podium = document.querySelector("[data-leaderboard-podium]");
    const list = document.querySelector("[data-leaderboard-list]");
    const rankEls = document.querySelectorAll("[data-leaderboard-user-rank]");
    if (!podium && !list && !rankEls.length) return;

    const rows = getLeaderboardRows(user);
    if (!rows.length) {
      rankEls.forEach((el) => { el.textContent = "#--"; });
      if (podium) podium.innerHTML = `<article class="leaderboard-loading"><strong>Classifica in caricamento</strong><span>Stiamo leggendo i profili reali da Supabase.</span></article>`;
      if (list) list.innerHTML = `<div class="leader-row current-user"><span>--</span><strong>Classifica in caricamento</strong><b>--</b><em>--</em></div>`;
      return;
    }
    const current = rows.find((item) => item.current) || rows[rows.length - 1];

    rankEls.forEach((el) => {
      el.textContent = `#${current && current.rank ? current.rank : "--"}`;
    });

    if (podium) {
      const first = rows[0];
      const second = rows[1];
      const third = rows[2];
      podium.innerHTML = [second, first, third].filter(Boolean).map((item) => `
        <article class="${item.rank === 1 ? "is-first" : ""} ${item.current ? "current-user" : ""}">
          <span>#${item.rank}</span>
          <div class="leader-avatar"><img src="${item.avatar}" alt=""></div>
          <strong>${item.username}</strong>
          <b>${Number(item.tokens || 0).toLocaleString("it-IT")}</b>
        </article>
      `).join("");
    }

    if (list) {
      list.innerHTML = rows.map((item) => `
        <div class="leader-row ${item.current ? "current-user" : ""}">
          <span>#${item.rank}</span>
          <strong><i class="leader-mini-avatar"><img src="${item.avatar}" alt=""></i>${item.username}</strong>
          <b>${Number(item.tokens || 0).toLocaleString("it-IT")}</b>
          <em>${Number(item.streak || 0)} giorni</em>
        </div>
      `).join("");
    }
  }



  const ADMIN_RESULTS_KEY = "profantasy_arena_admin_match_results_v1";
  const ADMIN_TRANSACTION_KEY = "profantasy_arena_admin_transactions_v1";

  function getAdminResults() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_RESULTS_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveAdminResults(results) {
    localStorage.setItem(ADMIN_RESULTS_KEY, JSON.stringify(results || {}));
  }

  function getAdminTransactions() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_TRANSACTION_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveAdminTransactions(rows) {
    localStorage.setItem(ADMIN_TRANSACTION_KEY, JSON.stringify(rows || []));
  }

  async function fetchSupabaseMatchResults() {
    const supabase = getSupabase();
    if (!supabase) return getAdminResults();
    const { data, error } = await supabase
      .from("match_results")
      .select("match_id, result, score, status, home, away, match_time, updated_at")
      .order("updated_at", { ascending: false });
    if (error) {
      console.warn("Supabase match_results fetch error", error);
      return getAdminResults();
    }
    const mapped = {};
    (data || []).forEach((row) => {
      mapped[row.match_id] = {
        matchId: row.match_id,
        result: row.result,
        status: row.status || "finished",
        score: row.score || "",
        home: row.home || "HOME",
        away: row.away || "AWAY",
        time: row.match_time || "",
        updatedAt: row.updated_at
      };
    });
    saveAdminResults(mapped);
    return mapped;
  }

  async function fetchSupabaseTransactions() {
    const supabase = getSupabase();
    if (!supabase) return getAdminTransactions();
    const { data, error } = await supabase.rpc("pfa_admin_recent_transactions", { p_limit: 30 });
    if (error) {
      console.warn("Supabase admin transactions fetch error", error);
      return getAdminTransactions();
    }
    const rows = (data || []).map((tx) => ({
      id: tx.id,
      type: tx.type,
      username: tx.username || "Player",
      matchId: tx.match_id || "",
      label: tx.description || tx.match_id || tx.type,
      amount: Number(tx.amount || 0),
      xp: Number(tx.xp || 0),
      balanceAfter: Number(tx.balance_after || 0),
      createdAt: tx.created_at
    }));
    saveAdminTransactions(rows);
    return rows;
  }

  async function fetchSupabaseGroupStandings() {
    const supabase = getSupabase();
    if (!supabase) return getAdminGroupStandings();
    const { data, error } = await supabase.rpc("pfa_admin_get_group_standings");
    if (error) {
      console.warn("Supabase group standings fetch error", error);
      return getAdminGroupStandings();
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.standings) return getAdminGroupStandings();
    const payload = {
      standings: row.standings || {},
      knockoutPreview: buildAdminKnockoutPreview(row.standings || {}),
      updatedAt: row.updated_at || new Date().toISOString(),
      resolvedAt: row.resolved_at || "",
      resolvedPredictions: Number(row.resolved_predictions || 0),
      totalTokens: Number(row.total_tokens || 0),
      totalXp: Number(row.total_xp || 0)
    };
    saveAdminGroupStandings(payload);
    return payload;
  }

  async function setSupabaseAdminGroupStandings(standings) {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("pfa_admin_save_group_standings", {
      p_standings: standings
    });
    if (error) {
      const message = String(error.message || "");
      if (message.includes("Could not find the function") || message.includes("schema cache")) {
        throw new Error("Funzione classifiche gironi non trovata. Esegui SUPABASE_BRACKET_REWARDS_V1_SQL.sql e ricarica Admin Center.");
      }
      throw error;
    }
    await fetchSupabaseGroupStandings();
    return data;
  }

  async function resolveSupabaseAdminGroupRewards() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("pfa_admin_resolve_group_predictions");
    if (error) {
      const message = String(error.message || "");
      if (message.includes("Could not find the function") || message.includes("schema cache")) {
        throw new Error("Funzione reward bracket non trovata. Esegui SUPABASE_BRACKET_REWARDS_V1_SQL.sql e ricarica Admin Center.");
      }
      throw error;
    }
    await fetchSupabaseGroupStandings();
    await fetchSupabaseTransactions();
    await refreshSupabaseLeaderboard();
    await refreshSupabaseProfileCache();
    return data;
  }

  async function refreshSupabaseAdminCache() {
    if (!SUPABASE_ENABLED || !getSupabase()) return;
    try {
      await fetchSupabaseMatchResults();
      await fetchSupabaseTransactions();
      await fetchSupabaseGroupStandings();
      SUPABASE_ADMIN_CACHE_READY = true;
    } catch (error) {
      console.warn("Supabase admin cache refresh failed", error);
    }
  }

  function getFixtureById(matchId) {
    return getFixturePool().find((match) => match.id === matchId) || null;
  }

  function getAdminResult(matchId) {
    const results = getAdminResults();
    return results[matchId] || null;
  }

  async function setAdminResult(matchId, result, options = {}) {
    if (!matchId || !["1", "X", "2"].includes(result)) return null;
    const fixture = getFixtureById(matchId);

    if (SUPABASE_ENABLED && getUser().id) {
      try {
        const data = await setSupabaseAdminMatchResult(matchId, result, options.score || "");
        renderUser(getUser());
        renderDailyPredictionPage();
        renderAdminConsole();
        return data;
      } catch (error) {
        console.error(error);
        alert(error.message || "Esito Supabase non salvato. Controlla di aver eseguito lo SQL Step 2.");
        return null;
      }
    }

    const results = getAdminResults();
    results[matchId] = {
      matchId,
      result,
      status: "finished",
      score: options.score || "",
      note: options.note || "",
      updatedAt: new Date().toISOString(),
      home: fixture ? fixture.home : "HOME",
      away: fixture ? fixture.away : "AWAY",
      time: fixture ? `${fixture.dateLabel} • ${fixture.timeLabel}` : ""
    };
    saveAdminResults(results);

    const resolved = resolveUserPredictionsForResults();
    renderUser(getUser());
    renderDailyPredictionPage();
    renderAdminConsole();
    return { result: results[matchId], resolved };
  }

  async function clearAdminResult(matchId) {
    if (!matchId) return;

    if (SUPABASE_ENABLED && getUser().id) {
      try {
        await clearSupabaseAdminMatchResult(matchId);
        renderUser(getUser());
        renderDailyPredictionPage();
        renderAdminConsole();
        return;
      } catch (error) {
        console.error(error);
        alert(error.message || "Reset risultato non riuscito. Controlla lo SQL Step 12.");
        return;
      }
    }

    const results = getAdminResults();
    delete results[matchId];
    saveAdminResults(results);
    renderDailyPredictionPage();
    renderAdminConsole();
  }

  function resolveUserPredictionsForResults() {
    const user = getUser();
    const results = getAdminResults();
    const transactions = getAdminTransactions();
    let changed = false;
    let resolved = 0;

    Object.entries(user.predictions || {}).forEach(([matchId, prediction]) => {
      const adminResult = results[matchId];
      if (!adminResult || adminResult.status !== "finished") return;

      const basePending = !prediction.status || prediction.status === "pending";
      const exactPending = Boolean(prediction.exactScoreEnabled) && (!["won", "lost"].includes(prediction.exactScoreStatus || ""));
      if (!basePending && !exactPending) return;

      const scoreParts = parseScoreString(adminResult.score || "");
      const won = prediction.choice === adminResult.result;

      if (basePending) {
        prediction.status = won ? "won" : "lost";
        prediction.finalResult = adminResult.result;
        prediction.resolvedAt = new Date().toISOString();
        prediction.score = adminResult.score || "";

        if (won) {
          const reward = Number(prediction.reward || 125);
          user.tokens = Number(user.tokens || 0) + reward;
          user.xp = Number(user.xp || 0) + 25;
          transactions.unshift({
            id: "tx_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
            type: "prediction_reward",
            matchId,
            label: `${prediction.home || "HOME"} vs ${prediction.away || "AWAY"}`,
            amount: reward,
            xp: 25,
            createdAt: new Date().toISOString()
          });
        }
        resolved += 1;
        changed = true;
      }

      if (exactPending && prediction.exactScoreEnabled) {
        prediction.score = adminResult.score || prediction.score || "";
        if (!scoreParts) {
          prediction.exactScoreStatus = "pending_score";
          changed = true;
        } else {
          const exactWon = normalizeScoreNumber(prediction.exactHomeScore) === scoreParts.home && normalizeScoreNumber(prediction.exactAwayScore) === scoreParts.away;
          prediction.exactScoreStatus = exactWon ? "won" : "lost";
          prediction.exactScoreResolvedAt = new Date().toISOString();
          if (exactWon) {
            const exactReward = Number(prediction.exactScoreReward || EXACT_SCORE_REWARD);
            user.tokens = Number(user.tokens || 0) + exactReward;
            transactions.unshift({
              id: "tx_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
              type: "exact_score_reward",
              matchId,
              label: `Perfect Score · ${prediction.home || "HOME"} vs ${prediction.away || "AWAY"} ${scoreParts.score}`,
              amount: exactReward,
              xp: 0,
              createdAt: new Date().toISOString()
            });
          }
          changed = true;
        }
      }
    });

    if (changed) {
      user.level = getLevelFromXp(user.xp);
      localStorage.setItem(STORE_KEY, JSON.stringify(user));
      saveAdminTransactions(transactions.slice(0, 40));
    }
    return resolved;
  }

  function getMatchAdminStatus(match, user = getUser(), now = getNow()) {
    const result = getAdminResult(match.id);
    const saved = user.predictions && user.predictions[match.id];
    if (result && result.status === "finished") {
      const scoreLabel = result.score ? ` · ${result.score}` : "";
      if (saved && saved.exactScoreStatus === "won") return `Perfect Score · ${result.result}${scoreLabel}`;
      if (saved && saved.status === "won") return `Vinta · esito ${result.result}${scoreLabel}`;
      if (saved && saved.status === "lost") return `Persa · esito ${result.result}${scoreLabel}`;
      return `Finita · esito ${result.result}${scoreLabel}`;
    }
    if (saved) {
      const exactLabel = getExactScoreLabel(saved);
      return `Giocata: ${saved.choice}${exactLabel ? ` · ${exactLabel}` : ""}`;
    }
    if (match.kickoff <= now) return "Live / Chiusa";
    return "Disponibile";
  }

  function getAdminScoreInputs(row) {
    if (!row) return { home: null, away: null };
    return {
      home: row.querySelector("[data-admin-home-score]"),
      away: row.querySelector("[data-admin-away-score]")
    };
  }

  function readAdminScoreFromRow(row) {
    const inputs = getAdminScoreInputs(row);
    const home = normalizeScoreNumber(inputs.home && inputs.home.value);
    const away = normalizeScoreNumber(inputs.away && inputs.away.value);
    if (home === null && away === null) return null;
    if (home === null || away === null) throw new Error("Inserisci sia i gol della squadra di casa sia quelli della squadra ospite.");
    return { home, away, score: `${home}-${away}`, result: deriveChoiceFromScores(home, away) };
  }

  async function setAdminResultFromScore(matchId, row) {
    const score = readAdminScoreFromRow(row);
    if (!score) {
      alert("Inserisci il risultato esatto prima di salvare lo score.");
      return null;
    }
    return setAdminResult(matchId, score.result, { score: score.score });
  }

  function renderAdminConsole() {
    const root = document.querySelector("[data-admin-console]");
    if (!root) return;
    const fixtures = getFixturePool();
    const results = getAdminResults();
    const user = getUser();
    const rowsWrap = root.querySelector("[data-admin-match-list]");
    const resultCount = root.querySelector("[data-admin-result-count]");
    const pendingCount = root.querySelector("[data-admin-pending-count]");
    const txList = root.querySelector("[data-admin-transactions]");

    const predictions = user.predictions || {};
    const pendingPredictions = Object.values(predictions).filter((item) => !item.status || item.status === "pending" || (item.exactScoreEnabled && !["won", "lost"].includes(item.exactScoreStatus || ""))).length;
    if (resultCount) resultCount.textContent = Object.keys(results).length;
    if (pendingCount) pendingCount.textContent = pendingPredictions;

    if (rowsWrap) {
      const relevant = fixtures.slice(0, 72);
      rowsWrap.innerHTML = relevant.map((match) => {
        const current = results[match.id];
        const pred = predictions[match.id];
        const scoreParts = current && current.score ? parseScoreString(current.score) : null;
        const exactLabel = pred ? getExactScoreLabel(pred) : "";
        const exactStatus = pred ? getExactScoreStatusLabel(pred) : "";
        const predLabel = pred
          ? `Scelta ${pred.choice}${exactLabel ? ` · Exact ${exactLabel}` : ""} · ${pred.status === "won" ? "Vinta" : pred.status === "lost" ? "Persa" : "Pending"}${exactStatus ? ` · ${exactStatus}` : ""}`
          : "Nessuna giocata";
        return `
          <article class="admin-match-row ${current ? "is-finished" : ""} ${pred ? "has-prediction" : ""}" data-admin-row="${match.id}">
            <div class="admin-match-main">
              <span>${match.group || "Group"} · ${match.dateLabel} · ${match.timeLabel}${current && current.score ? ` · Score ${current.score}` : ""}</span>
              <strong><img src="${match.homeFlag}" alt=""> ${match.home} <i>vs</i> ${match.away} <img src="${match.awayFlag}" alt=""></strong>
              <em>${predLabel}</em>
            </div>
            <div class="admin-result-tools">
              <div class="admin-score-editor" data-admin-score-editor="${match.id}">
                <label><span>${escapeHtml(match.home)}</span><input type="number" min="0" max="20" inputmode="numeric" data-admin-home-score value="${scoreParts ? scoreParts.home : ""}" placeholder="0"></label>
                <i>-</i>
                <label><span>${escapeHtml(match.away)}</span><input type="number" min="0" max="20" inputmode="numeric" data-admin-away-score value="${scoreParts ? scoreParts.away : ""}" placeholder="0"></label>
                <button type="button" data-admin-set-score-result="${match.id}">Salva score</button>
              </div>
              <div class="admin-result-buttons" data-admin-result-buttons="${match.id}">
                <button type="button" data-admin-set-result="${match.id}" data-result="1" class="${current && current.result === "1" ? "is-selected" : ""}">1</button>
                <button type="button" data-admin-set-result="${match.id}" data-result="X" class="${current && current.result === "X" ? "is-selected" : ""}">X</button>
                <button type="button" data-admin-set-result="${match.id}" data-result="2" class="${current && current.result === "2" ? "is-selected" : ""}">2</button>
                <button type="button" data-admin-clear-result="${match.id}">Reset</button>
              </div>
            </div>
          </article>
        `;
      }).join("");

      rowsWrap.querySelectorAll("[data-admin-set-score-result]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const row = btn.closest("[data-admin-row]");
          try { await setAdminResultFromScore(btn.dataset.adminSetScoreResult, row); }
          catch (error) { alert(error.message || "Score non valido."); }
        });
      });
      rowsWrap.querySelectorAll("[data-admin-set-result]").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const row = btn.closest("[data-admin-row]");
          let options = {};
          try {
            const score = readAdminScoreFromRow(row);
            if (score) {
              if (score.result !== btn.dataset.result) {
                alert(`Lo score inserito produce ${score.result}, non ${btn.dataset.result}. Usa “Salva score” oppure correggi i gol.`);
                return;
              }
              options.score = score.score;
            }
            await setAdminResult(btn.dataset.adminSetResult, btn.dataset.result, options);
          } catch (error) {
            alert(error.message || "Esito non valido.");
          }
        });
      });
      rowsWrap.querySelectorAll("[data-admin-clear-result]").forEach((btn) => {
        btn.addEventListener("click", async () => { await clearAdminResult(btn.dataset.adminClearResult); });
      });
    }

    if (txList) {
      const transactions = getAdminTransactions();
      if (!transactions.length) {
        txList.innerHTML = `<article class="admin-empty-log">Nessun reward accreditato.</article>`;
      } else {
        txList.innerHTML = transactions.slice(0, 10).map((tx) => `
          <article>
            <span>${new Date(tx.createdAt).toLocaleString("it-IT")}</span>
            <strong>+${Number(tx.amount || 0).toLocaleString("it-IT")} token</strong>
            <p>${tx.label || tx.matchId} · +${Number(tx.xp || 0)} XP</p>
          </article>
        `).join("");
      }
    }
  }



  const ADMIN_GROUP_STANDINGS_KEY = "profantasy_arena_admin_group_standings_v1";

  function getAdminGroupTeams() {
    const fixtures = getFixturePool();
    const groups = {};
    fixtures.forEach((match) => {
      if (match.phase && match.phase !== "group") return;
      const groupName = match.group || "Group";
      const keyMatch = String(groupName).match(/[A-L]$/i);
      if (!keyMatch) return;
      const groupKey = keyMatch[0].toUpperCase();
      groups[groupKey] ||= { key: groupKey, name: groupName.replace("Group", "Girone"), teams: [] };
      [
        { code: match.home, name: match.homeName || match.home, flag: match.homeFlag },
        { code: match.away, name: match.awayName || match.away, flag: match.awayFlag }
      ].forEach((team) => {
        if (!team.code) return;
        if (!groups[groupKey].teams.some((item) => item.code === team.code)) groups[groupKey].teams.push(team);
      });
    });
    return Object.values(groups)
      .filter((group) => group.teams.length)
      .sort((a, b) => String(a.key).localeCompare(String(b.key), "it"))
      .map((group) => ({ ...group, teams: group.teams.slice(0, 4) }));
  }

  function getAdminGroupStandings() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_GROUP_STANDINGS_KEY)) || null;
    } catch (e) {
      return null;
    }
  }

  function saveAdminGroupStandings(payload) {
    localStorage.setItem(ADMIN_GROUP_STANDINGS_KEY, JSON.stringify(payload || {}));
  }

  function buildAdminStandingsFromForm(root) {
    const standings = {};
    root.querySelectorAll("[data-admin-group-card]").forEach((card) => {
      const group = card.dataset.adminGroupCard;
      standings[group] = {};
      card.querySelectorAll("[data-admin-group-rank]").forEach((select) => {
        const code = select.dataset.teamCode;
        if (select.value) standings[group][code] = select.value;
      });
    });
    return standings;
  }

  function areAdminGroupsComplete(standings, groups = getAdminGroupTeams()) {
    return groups.every((group) => {
      const ranks = standings && standings[group.key];
      if (!ranks) return false;
      const values = group.teams.map((team) => ranks[team.code]).filter(Boolean);
      const unique = new Set(values);
      return values.length === group.teams.length && unique.size === group.teams.length;
    });
  }

  function createAdminAutoStandings(groups = getAdminGroupTeams()) {
    const standings = {};
    groups.forEach((group) => {
      standings[group.key] = {};
      group.teams.forEach((team, index) => standings[group.key][team.code] = String(index + 1));
    });
    return standings;
  }

  function getStaticKnockoutPreview() {
    const fixtures = Array.isArray(window.PFA_KNOCKOUT_FIXTURES) ? window.PFA_KNOCKOUT_FIXTURES : [];
    if (!fixtures.length) return null;
    return fixtures.map((fixture) => ({
      id: `m-${fixture.matchNumber}`,
      fixture: true,
      a: { code: fixture.home, name: fixture.homeName || fixture.home, flag: fixture.homeFlag || `img/flags/${String(fixture.home || "tbd").toLowerCase()}.png`, label: `M${fixture.matchNumber}` },
      b: { code: fixture.away, name: fixture.awayName || fixture.away, flag: fixture.awayFlag || `img/flags/${String(fixture.away || "tbd").toLowerCase()}.png`, label: fixture.localDate || "Sedicesimi" },
      stadium: fixture.stadium || "Stadium",
      kickoffUtc: fixture.kickoffUtc || ""
    }));
  }

  function buildAdminKnockoutPreview(standings, groups = getAdminGroupTeams()) {
    const staticPreview = getStaticKnockoutPreview();
    if (staticPreview) return staticPreview;
    if (!areAdminGroupsComplete(standings, groups)) return null;
    const byKey = {};
    groups.forEach((group) => { byKey[group.key] = group; });
    const pick = (label) => {
      const position = String(label).charAt(0);
      const groupKey = String(label).slice(1);
      const group = byKey[groupKey];
      if (!group) return { code: "TBD", name: "Da definire", flag: "img/flags/tbd.png", label };
      const code = Object.keys(standings[groupKey] || {}).find((teamCode) => String(standings[groupKey][teamCode]) === position);
      const team = group.teams.find((item) => item.code === code) || { code: "TBD", name: "Da definire", flag: "img/flags/tbd.png" };
      return { ...team, label };
    };
    const safePairs = [
      ["2A", "2B"],
      ["1C", "2F"],
      ["1F", "2C"],
      ["2E", "2I"],
      ["1H", "2J"],
      ["2K", "2L"],
      ["2D", "2G"],
      ["1J", "2H"]
    ];
    return safePairs.map((pair, index) => ({ id: `safe-${index + 1}`, a: pick(pair[0]), b: pick(pair[1]), safe: true }));
  }

  function renderAdminGroupsPanel() {
    const root = document.querySelector("[data-admin-console]");
    if (!root) return;
    const grid = root.querySelector("[data-admin-groups-grid]");
    const preview = root.querySelector("[data-admin-knockout-preview]");
    if (!grid) return;

    const groups = getAdminGroupTeams();
    const saved = getAdminGroupStandings();
    const standings = saved && saved.standings ? saved.standings : {};

    grid.innerHTML = groups.map((group) => `
      <article class="admin-group-card" data-admin-group-card="${group.key}">
        <h3>Girone ${group.key}<small>${group.teams.length} squadre</small></h3>
        ${group.teams.map((team) => `
          <label class="admin-group-team">
            <span><img src="${team.flag}" alt=""> <b>${team.code}</b> <em>${team.name || team.code}</em></span>
            <select data-admin-group-rank="${group.key}:${team.code}" data-team-code="${team.code}">
              <option value="">Pos.</option>
              <option value="1" ${standings[group.key]?.[team.code] === "1" ? "selected" : ""}>1°</option>
              <option value="2" ${standings[group.key]?.[team.code] === "2" ? "selected" : ""}>2°</option>
              <option value="3" ${standings[group.key]?.[team.code] === "3" ? "selected" : ""}>3°</option>
              <option value="4" ${standings[group.key]?.[team.code] === "4" ? "selected" : ""}>4°</option>
            </select>
          </label>
        `).join("")}
      </article>
    `).join("");

    grid.querySelectorAll("[data-admin-group-rank]").forEach((select) => {
      select.addEventListener("change", () => {
        const [groupKey, code] = select.dataset.adminGroupRank.split(":");
        if (!select.value) return;
        grid.querySelectorAll(`[data-admin-group-rank^="${groupKey}:"]`).forEach((other) => {
          if (other === select) return;
          if (other.value === select.value) other.value = "";
        });
      });
    });

    if (preview) {
      const liveStandings = buildAdminStandingsFromForm(root);
      const knockout = buildAdminKnockoutPreview(saved && saved.standings ? saved.standings : liveStandings, groups);
      if (!knockout) {
        preview.innerHTML = `<article class="admin-empty-log">Sedicesimi in caricamento: controlla che js/world-cup-knockout-fixtures.js sia incluso prima di arena-game.js.</article>`;
      } else {
        const savedPayload = saved && saved.standings ? saved : null;
        const rewardAudit = savedPayload && savedPayload.resolvedAt ? `
          <div class="admin-group-reward-audit">
            <article><span>Prediction risolte</span><strong>${Number(savedPayload.resolvedPredictions || 0).toLocaleString("it-IT")}</strong></article>
            <article><span>Token accreditati</span><strong>+${Number(savedPayload.totalTokens || 0).toLocaleString("it-IT")}</strong></article>
            <article><span>XP accreditati</span><strong>+${Number(savedPayload.totalXp || 0).toLocaleString("it-IT")}</strong></article>
          </div>
        ` : `
          <div class="admin-group-reward-audit is-pending">
            <article><span>Reward bracket</span><strong>Pronto</strong><p>+25 token per posizione esatta, +50 bonus per girone perfetto.</p></article>
          </div>
        `;
        preview.innerHTML = `
          <div class="admin-knockout-head">
            <span>Anteprima tabellone</span>
            <strong>Sedicesimi collegati</strong>
          </div>
          ${rewardAudit}
          <div class="admin-knockout-scroll">
            ${knockout.map((match) => `
              <article class="admin-ko-match">
                <small>${match.id.toUpperCase().replace("-", " #")}</small>
                <span><img src="${match.a.flag}" alt=""> ${match.a.code} <em>${match.a.label}</em></span>
                <b>VS</b>
                <span><img src="${match.b.flag}" alt=""> ${match.b.code} <em>${match.b.label}</em></span>
              </article>
            `).join("")}
          </div>
        `;
      }
    }
  }

  function setupAdminGroupsPanel() {
    const root = document.querySelector("[data-admin-console]");
    if (!root || root.classList.contains("admin-locked-shell")) return;
    if (SUPABASE_ENABLED && !isAdminUser()) return;
    renderAdminGroupsPanel();

    const saveBtn = root.querySelector("[data-admin-save-groups]");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const groups = getAdminGroupTeams();
        const standings = buildAdminStandingsFromForm(root);
        if (!areAdminGroupsComplete(standings, groups)) {
          alert("Completa tutte le posizioni dei 12 gironi prima di salvare.");
          return;
        }
        const preview = buildAdminKnockoutPreview(standings, groups);
        try {
          if (SUPABASE_ENABLED && isAdminUser()) await setSupabaseAdminGroupStandings(standings);
          saveAdminGroupStandings({
            standings,
            knockoutPreview: preview,
            updatedAt: new Date().toISOString()
          });
          renderAdminGroupsPanel();
          alert("Classifiche gironi salvate. Puoi ora calcolare i reward bracket quando sei sicuro dei risultati.");
        } catch (error) {
          console.error(error);
          alert(error.message || "Errore durante il salvataggio classifiche gironi.");
        }
      });
    }

    const resolveGroupsBtn = root.querySelector("[data-admin-resolve-groups]");
    if (resolveGroupsBtn) {
      resolveGroupsBtn.addEventListener("click", async () => {
        const groups = getAdminGroupTeams();
        const standings = buildAdminStandingsFromForm(root);
        if (!areAdminGroupsComplete(standings, groups)) {
          alert("Completa tutte le posizioni dei 12 gironi prima di calcolare i reward.");
          return;
        }
        if (!confirm("Confermi il calcolo reward per tutte le Group Stage Prediction salvate? L'accredito non sarà duplicabile.")) return;
        try {
          if (SUPABASE_ENABLED && isAdminUser()) {
            await setSupabaseAdminGroupStandings(standings);
            const result = await resolveSupabaseAdminGroupRewards();
            renderAdminGroupsPanel();
            renderAdminConsole();
            alert(`Reward bracket calcolati. Prediction risolte: ${Number(result?.resolved_predictions || 0)} · Token accreditati: ${Number(result?.total_tokens || 0).toLocaleString("it-IT")}`);
            return;
          }
          alert("Il calcolo reward reale richiede Supabase attivo e account admin.");
        } catch (error) {
          console.error(error);
          alert(error.message || "Errore durante il calcolo reward bracket.");
        }
      });
    }

    const autoBtn = root.querySelector("[data-admin-autofill-groups]");
    if (autoBtn) {
      autoBtn.addEventListener("click", () => {
        saveAdminGroupStandings({
          standings: createAdminAutoStandings(),
          knockoutPreview: buildAdminKnockoutPreview(createAdminAutoStandings()),
          updatedAt: new Date().toISOString()
        });
        renderAdminGroupsPanel();
      });
    }

    const clearBtn = root.querySelector("[data-admin-clear-groups]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!confirm("Vuoi cancellare le classifiche gironi salvate in questa sessione?")) return;
        localStorage.removeItem(ADMIN_GROUP_STANDINGS_KEY);
        renderAdminGroupsPanel();
      });
    }
  }

  async function setupAdminConsole() {
    const root = document.querySelector("[data-admin-console]");
    if (!root) return;
    if (SUPABASE_ENABLED) {
      await refreshSupabaseProfileCache();
      if (!isAdminUser()) {
        renderAdminAccessDenied(root);
        return;
      }
      await refreshSupabaseAdminCache();
    }
    renderAdminConsole();
    const resolveBtn = root.querySelector("[data-admin-resolve-all]");
    if (resolveBtn) {
      resolveBtn.addEventListener("click", () => {
        const count = resolveUserPredictionsForResults();
        renderUser(getUser());
        renderAdminConsole();
        alert(count ? `${count} prediction risolte.` : "Nessuna prediction pending da risolvere.");
      });
    }
    const clearBtn = root.querySelector("[data-admin-clear-results]");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!confirm("Vuoi cancellare la cache locale degli esiti? Le prediction reali già risolte restano salvate su Supabase.")) return;
        saveAdminResults({});
        renderDailyPredictionPage();
        renderAdminConsole();
      });
    }
  }



  function setupDailyPredictionTutorial() {
    const layer = document.querySelector("[data-daily-tutorial]");
    const openButtons = document.querySelectorAll("[data-open-daily-tutorial]");
    if (!layer || !openButtons.length || layer.dataset.dailyTutorialReady === "1") return;
    layer.dataset.dailyTutorialReady = "1";
    const closeButtons = layer.querySelectorAll("[data-close-daily-tutorial]");
    const open = () => {
      layer.classList.add("is-visible");
      layer.setAttribute("aria-hidden", "false");
      document.body.classList.add("daily-tutorial-open");
    };
    const close = () => {
      layer.classList.remove("is-visible");
      layer.setAttribute("aria-hidden", "true");
      document.body.classList.remove("daily-tutorial-open");
      localStorage.setItem("pfa_daily_prediction_tutorial_v1", "done");
    };
    openButtons.forEach((btn) => btn.addEventListener("click", open));
    closeButtons.forEach((btn) => btn.addEventListener("click", close));
    layer.addEventListener("click", (event) => {
      if (event.target === layer) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && layer.classList.contains("is-visible")) close();
    });
    if (!localStorage.getItem("pfa_daily_prediction_tutorial_v1") && document.querySelector(".daily-game-page")) {
      setTimeout(open, 900);
    }
  }

  function setupMobileNavigation() {
    const header = document.querySelector(".arena-header");
    const nav = header ? header.querySelector(".arena-nav") : null;
    if (!header || !nav || header.querySelector("[data-mobile-menu-toggle]")) return;

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "mobile-menu-toggle";
    toggle.setAttribute("data-mobile-menu-toggle", "");
    toggle.setAttribute("aria-label", "Apri menu Arena");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<i aria-hidden=\"true\"></i>";

    const panel = document.createElement("div");
    panel.className = "mobile-nav-panel";
    panel.setAttribute("data-mobile-nav-panel", "");
    panel.setAttribute("aria-hidden", "true");
    const links = Array.from(nav.querySelectorAll("a")).map((a) => `<a href="${a.getAttribute("href") || "#"}" class="${a.classList.contains("is-active") ? "is-active" : ""}">${a.textContent.trim()}</a>`).join("");
    panel.innerHTML = `<div class="mobile-nav-card">${links}</div>`;
    document.body.appendChild(panel);

    header.insertBefore(toggle, header.firstElementChild);

    const close = () => {
      document.body.classList.remove("mobile-menu-open");
      panel.classList.remove("is-open");
      panel.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
    };
    const open = () => {
      document.body.classList.add("mobile-menu-open");
      panel.classList.add("is-open");
      panel.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    };
    toggle.addEventListener("click", () => panel.classList.contains("is-open") ? close() : open());
    panel.addEventListener("click", (event) => {
      if (event.target === panel || event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    // First paint: render the cached Supabase profile immediately to avoid the
    // visible guest -> logged-in switch while the network session refreshes.
    document.body.classList.add("pfa-booting");
    renderUser(getUser());
    setupAuthUi();
    setupMobileNavigation();

    await syncSupabaseSessionToLocal();
    if (SUPABASE_ENABLED && getUser().id) {
      await refreshSupabaseAdminCache();
      await refreshSupabaseLeaderboard();
      await fetchSupabaseVersionBonus();
    } else if (SUPABASE_ENABLED) {
      await refreshSupabaseLeaderboard();
      renderVersionBonusNudge();
    }
    window.PFA_AUTH_READY = true;
    window.dispatchEvent(new CustomEvent("pfa:auth-ready", { detail: { user: getUser() } }));

    // Hotfix V3.1: la lobby può arrivare da cache con sessione Supabase già valida.
    // Facciamo due controlli ritardati così la notifica +250 appare al primo accesso
    // anche se il profilo viene sincronizzato qualche istante dopo il DOMContentLoaded.
    if (SUPABASE_ENABLED) {
      window.setTimeout(() => {
        if (getUser().id) fetchSupabaseVersionBonus().catch((error) => console.warn("Version bonus delayed check failed", error));
      }, 700);
      window.setTimeout(() => {
        if (getUser().id && !document.querySelector("[data-version-bonus-nudge]")) {
          fetchSupabaseVersionBonus().catch((error) => console.warn("Version bonus final check failed", error));
        }
      }, 2200);
    }

    resolveUserPredictionsForResults();
    renderUser();
    setupRegistration();
    setupPredictions();
    setupDailyPredictionTutorial();
    setupMissions();
    setupBracket();
    await setupReferral();
    await setupAdminConsole();
    setupAdminGroupsPanel();
    setupAuthUi();
    setupMobileNavigation();
    renderLeaderboard();
    document.body.classList.remove("pfa-booting");
    document.body.classList.add("pfa-ready");
    countdownToMidnight();
    setInterval(countdownToMidnight, 1000);
    let lastDailyRenderMinute = "";
    setInterval(() => {
      const currentUser = getUser();
      renderLobbyNextMatch(currentUser);
      renderArenaLiveFeed(currentUser);
      updateFixtureCountdowns();

      // La pagina Daily deve cambiare stato quando un match scatta da disponibile a live/chiuso.
      // Non la ridisegniamo ogni secondo per non perdere fluidità/mobile performance.
      const minuteKey = String(Math.floor(Date.now() / 60000));
      if (minuteKey !== lastDailyRenderMinute && document.querySelector("[data-daily-match-grid]")) {
        lastDailyRenderMinute = minuteKey;
        renderDailyPredictionPage();
        setupPredictions();
        updateFixtureCountdowns();
      }
    }, 1000);
    updateFixtureCountdowns();
  });
  window.PFA_AUTH_HELPERS = { syncSupabaseSessionToLocal, refreshSupabaseProfileCache, refreshSupabaseLeaderboard, refreshSupabaseAdminCache, fetchSupabaseVersionBonus, ackSupabaseVersionBonusNotice, signOutSupabaseAndLocal, getUser, hasRegisteredUser, isAdminUser, updateAdminEntryPoints };
})();
