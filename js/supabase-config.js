// =========================================================
// PROFANTASY WORLD CUP ARENA — SUPABASE CONFIG
// Step 1: Auth + Profiles reali
// =========================================================

window.PFA_SUPABASE_URL = "https://ofivlxquvkfzabarsjsx.supabase.co";
window.PFA_SUPABASE_ANON_KEY = "sb_publishable_pRe0PkY4s0cxgk66eyrL1g_nYjeM65v";

// URL usata dalle email Supabase dopo la conferma account.
// Se pubblichi su un dominio diverso, aggiorna questa riga e aggiungi la stessa URL in Supabase Auth > URL Configuration.
window.PFA_AUTH_REDIRECT_URL = "https://ciropunzo.github.io/fantacalcio-sito/login.html";

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
