/* =========================================================
   ProFantasy World Cup Profile Bridge
   - collega la pagina World Cup/Home all'account Arena Supabase
   - aggiorna navbar e mini player hub senza esporre admin
   ========================================================= */

(function () {
  "use strict";

  const SUPABASE_URL = "https://ofivlxquvkfzabarsjsx.supabase.co";
  const SUPABASE_KEY = "sb_publishable_pRe0PkY4s0cxgk66eyrL1g_nYjeM65v";

  const nf = new Intl.NumberFormat("it-IT");

  function formatTokens(value) {
    const n = Number(value || 0);
    return nf.format(Number.isFinite(n) ? n : 0);
  }

  function getInitial(nameOrEmail) {
    const value = String(nameOrEmail || "P").trim();
    return value ? value.charAt(0).toUpperCase() : "P";
  }

  function normalizeProfile(data) {
    if (!data) return null;
    if (Array.isArray(data)) return data[0] || null;
    return data;
  }

  function findClient() {
    if (window.PFA_SUPABASE_CLIENT) return window.PFA_SUPABASE_CLIENT;
    if (window.pfaSupabase) return window.pfaSupabase;
    if (window.PFA_SUPABASE) return window.PFA_SUPABASE;
    if (window.supabaseClient) return window.supabaseClient;

    if (window.supabase && typeof window.supabase.createClient === "function") {
      window.PFA_SUPABASE_CLIENT = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      return window.PFA_SUPABASE_CLIENT;
    }

    return null;
  }

  async function getSession(client) {
    if (!client || !client.auth || typeof client.auth.getSession !== "function") return null;
    const { data } = await client.auth.getSession();
    return data && data.session ? data.session : null;
  }

  async function getProfile(client, userId) {
    if (!client || !userId) return null;

    try {
      if (typeof client.rpc === "function") {
        const { data, error } = await client.rpc("pfa_get_my_profile");
        if (!error && data) return normalizeProfile(data);
      }
    } catch (_) {}

    try {
      const { data, error } = await client
        .from("profiles")
        .select("id, username, avatar_url, tokens, xp, level, daily_streak, prediction_won")
        .eq("id", userId)
        .single();

      if (!error && data) return data;
    } catch (_) {}

    return null;
  }

  async function getRank(client, userId) {
    if (!client || !userId || typeof client.rpc !== "function") return null;

    const attempts = [
      () => client.rpc("pfa_get_leaderboard", { p_limit: 500 }),
      () => client.rpc("pfa_get_leaderboard"),
    ];

    for (const run of attempts) {
      try {
        const { data, error } = await run();
        if (error || !Array.isArray(data)) continue;

        const index = data.findIndex((row) => {
          return row.user_id === userId ||
                 row.profile_id === userId ||
                 row.id === userId ||
                 row.player_id === userId;
        });

        if (index >= 0) return index + 1;
      } catch (_) {}
    }

    return null;
  }

  function renderNavGuest(container) {
    if (!container) return;

    container.innerHTML = `
      <a href="login.html" class="wc-btn wc-btn-login wc-auth-guest">Accedi</a>
      <a href="register.html" class="wc-btn wc-btn-register wc-auth-guest">Registrati</a>
    `;
    container.removeAttribute("data-loading");
  }

  function renderNavUser(container, profile, session) {
    if (!container || !profile) return;

    const username = profile.username || session?.user?.email || "Player";
    const tokens = formatTokens(profile.tokens);
    const avatarUrl = profile.avatar_url || "";
    const avatar = avatarUrl
      ? `<img src="${avatarUrl}" alt="${username}">`
      : `<span>${getInitial(username)}</span>`;

    container.innerHTML = `
      <div class="wc-auth-user-chip" title="${username}">
        <div class="wc-auth-avatar">${avatar}</div>
        <div class="wc-auth-user-meta">
          <strong>${username}</strong>
          <small>${tokens} token</small>
        </div>
      </div>
      <a href="arena.html" class="wc-btn wc-btn-register">Apri Arena</a>
    `;
    container.removeAttribute("data-loading");
  }

  function renderHubGuest() {
    const hub = document.querySelector(".wc-player-hub");
    if (hub) hub.classList.remove("is-logged");

    const title = document.getElementById("wc-hub-title");
    const copy = document.getElementById("wc-hub-copy");
    const token = document.getElementById("wc-hub-token");
    const streak = document.getElementById("wc-hub-streak");
    const xp = document.getElementById("wc-hub-xp");
    const rank = document.getElementById("wc-hub-rank");
    const action = document.getElementById("wc-hub-action");

    if (title) title.textContent = "Crea il tuo profilo Arena";
    if (copy) copy.textContent = "Registrati, ricevi 1000 token iniziali e inizia a giocare nella World Cup Arena.";
    if (token) token.textContent = "1.000";
    if (streak) streak.textContent = "0 giorni";
    if (xp) xp.textContent = "0 XP";
    if (rank) rank.textContent = "#---";
    if (action) {
      action.href = "register.html";
      action.childNodes[0].nodeValue = "Crea profilo ";
    }
  }

  function renderHubUser(profile, rankValue) {
    const hub = document.querySelector(".wc-player-hub");
    if (hub) hub.classList.add("is-logged");

    const username = profile.username || "Player";
    const title = document.getElementById("wc-hub-title");
    const copy = document.getElementById("wc-hub-copy");
    const token = document.getElementById("wc-hub-token");
    const streak = document.getElementById("wc-hub-streak");
    const xp = document.getElementById("wc-hub-xp");
    const rank = document.getElementById("wc-hub-rank");
    const action = document.getElementById("wc-hub-action");

    if (title) title.textContent = `Bentornato, ${username}`;
    if (copy) copy.textContent = "Il tuo profilo Arena è attivo: continua a giocare, completa missioni e scala la classifica globale.";
    if (token) token.textContent = formatTokens(profile.tokens);
    if (streak) streak.textContent = `${Number(profile.daily_streak || 0)} giorni`;
    if (xp) xp.textContent = `${formatTokens(profile.xp)} XP`;
    if (rank) rank.textContent = rankValue ? `#${rankValue}` : "#---";
    if (action) {
      action.href = "arena.html";
      action.childNodes[0].nodeValue = "Continua nell’Arena ";
    }
  }

  async function init() {
    const navActions = document.querySelectorAll("[data-wc-auth-actions], .wc-nav-actions");
    const client = findClient();

    if (!client) {
      navActions.forEach(renderNavGuest);
      renderHubGuest();
      return;
    }

    let session = null;
    try {
      session = await getSession(client);
    } catch (_) {}

    if (!session || !session.user) {
      navActions.forEach(renderNavGuest);
      renderHubGuest();
      return;
    }

    const profile = await getProfile(client, session.user.id);
    if (!profile) {
      navActions.forEach(renderNavGuest);
      renderHubGuest();
      return;
    }

    const rank = await getRank(client, session.user.id);

    navActions.forEach((el) => renderNavUser(el, profile, session));
    renderHubUser(profile, rank);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
