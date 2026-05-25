// =========================================================
// PROFANTASY WORLD CUP ARENA — SUPABASE CONFIG
// Step 1: Auth + Profiles reali
// =========================================================

window.PFA_SUPABASE_URL = "https://ofivlxquvkfzabarsjsx.supabase.co";
window.PFA_SUPABASE_ANON_KEY = "sb_publishable_pRe0PkY4s0cxgk66eyrL1g_nYjeM65v";

// URL usata dalle email Supabase dopo la conferma account.
// In produzione viene calcolata automaticamente dal dominio attuale, così funziona sia su GitHub Pages sia su dominio custom.
(function () {
  const fallback = "https://ciropunzo.github.io/fantacalcio-sito/auth-confirmed.html";
  try {
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/[^/]*$/, "/auth-confirmed.html");
    window.PFA_AUTH_REDIRECT_URL = (origin && origin !== "null") ? `${origin}${path}` : fallback;
  } catch (error) {
    window.PFA_AUTH_REDIRECT_URL = fallback;
  }
})();

(function () {
  const hasClient = window.supabase && window.PFA_SUPABASE_URL && window.PFA_SUPABASE_ANON_KEY;

  if (!hasClient) {
    window.PFA_SUPABASE = null;
    window.PFA_SUPABASE_READY = Promise.resolve(null);
    return;
  }

  window.PFA_SUPABASE = window.supabase.createClient(
    window.PFA_SUPABASE_URL,
    window.PFA_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  window.PFA_SUPABASE_READY = Promise.resolve(window.PFA_SUPABASE);
})();
