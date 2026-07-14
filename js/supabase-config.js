// ProFantasy shared Supabase client.
window.PFA_SUPABASE_URL = 'https://ofivlxquvkfzabarsjsx.supabase.co';
window.PFA_SUPABASE_ANON_KEY = 'sb_publishable_pRe0PkY4s0cxgk66eyrL1g_nYjeM65v';

(() => {
  const canInitialize = Boolean(
    window.supabase &&
    typeof window.supabase.createClient === 'function' &&
    window.PFA_SUPABASE_URL &&
    window.PFA_SUPABASE_ANON_KEY
  );

  if (!canInitialize) {
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
