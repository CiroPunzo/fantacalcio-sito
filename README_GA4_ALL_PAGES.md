# ProFantasy GA4 All Pages v1

Measurement ID installato: `G-CY7LK0E6M4`

## Pagine incluse

- `world-cup.html`
- `arena.html`
- `bracket.html`
- `daily-prediction.html`
- `leaderboard.html`
- `legal.html`
- `login.html`
- `missions.html`
- `predictions.html`
- `referral.html`
- `register.html`

## Cosa è stato aggiunto

1. GA4 base + Consent Mode v2 nelle pagine dove mancava.
2. CookieYes consent listener, coerente con quello già presente in `legal.html` e `predictions.html`.
3. Tracker comune per interazioni principali:
   - `pf_page_ready`
   - `pf_scroll_depth`
   - `pf_nav_click`
   - `pf_cta_click`
   - `pf_arena_cta_click`
   - `pf_auth_click`
   - `pf_form_submit`
   - `pf_referral_copy_click`
   - `pf_mission_claim_click`
   - `pf_bracket_start_click`
   - `pf_bracket_review_click`

## Deploy

Carica questi file nella root del sito, sostituendo gli omonimi esistenti.
I nomi sono già normalizzati, quindi NON usare i nomi upload con parentesi tipo `(2)`.

## Verifica

Dopo il deploy:

1. Apri la pagina in browser.
2. DevTools Console:
   ```js
   typeof window.gtag
   ```
   deve restituire `"function"`.
3. DevTools Console:
   ```js
   window.ProFantasyGA4Events
   ```
   deve esistere.
4. In GA4 vai su Realtime o DebugView e verifica eventi come `pf_page_ready`, `pf_nav_click`, `pf_scroll_depth`.

## Nota consenso

Con Consent Mode, gli eventi Analytics completi partono dopo consenso alla categoria Analytics nel banner CookieYes.
