PROFANTASY ARENA — FIX BRACKET + SEDICESIMI

File modificati / aggiunti:
- arena.html
- daily-prediction.html
- bracket.html
- admin-center.html
- leaderboard.html
- css/arena.css
- js/arena-game.js
- js/bracket-game.js
- js/world-cup-knockout-fixtures.js  <-- nuovo file

Cosa fa questa versione:
1) Fix stato bracket "In attesa": bracket-game.js ora rilegge Supabase anche se esiste una vecchia cache locale. Se Supabase ha reward/token/posizioni esatte, la pagina mostra lo stato risolto.
2) Aggiunge i 16 sedicesimi al calendario Arena tramite js/world-cup-knockout-fixtures.js.
3) Home e Daily Prediction caricano automaticamente le card dei sedicesimi perché il nuovo file viene caricato prima di arena-game.js.
4) Admin Center vede i sedicesimi nella lista match e può inserire i risultati usando gli stessi match_id.
5) Bracket mostra sedicesimi e percorso successivo: ottavi, quarti, semifinali, finale 3° posto e finale.

Upload:
- Carica i file mantenendo le stesse cartelle.
- Il nuovo file deve stare in /js/world-cup-knockout-fixtures.js.
- Dopo l'upload fai hard refresh/cache clear, perché sono stati aggiornati i parametri ?v=knockout-r32-v1.

Match ID sedicesimi:
- wc26-m73 ... wc26-m88
