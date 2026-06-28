/* =========================================================
   PROFANTASY WORLD CUP ARENA — KNOCKOUT FIXTURES V3
   File: js/world-cup-knockout-fixtures.js
   Purpose: sedicesimi + percorso ufficiale collegati a Lobby,
   Daily Prediction, Admin Center e Bracket Knockout.
   Orari in UTC; le card mostrano l'orario locale del browser.
   ========================================================= */
(function () {
  const flag = (code) => `img/flags/${String(code || "tbd").toLowerCase()}.png`;

  const KO_TEAMS = {
    ZAF: "Sudafrica", CAN: "Canada", BRA: "Brasile", JPN: "Giappone",
    GER: "Germania", PRY: "Paraguay", NED: "Paesi Bassi", MAR: "Marocco",
    CIV: "Costa d’Avorio", NOR: "Norvegia", FRA: "Francia", SWE: "Svezia",
    MEX: "Messico", ECU: "Ecuador", ENG: "Inghilterra", COD: "RD Congo",
    BEL: "Belgio", SEN: "Senegal", USA: "Stati Uniti", BIH: "Bosnia-Erzegovina",
    ESP: "Spagna", AUT: "Austria", POR: "Portogallo", CRO: "Croazia",
    SUI: "Svizzera", ALG: "Algeria", AUS: "Australia", EGY: "Egitto",
    ARG: "Argentina", CPV: "Capo Verde", COL: "Colombia", GHA: "Ghana"
  };

  function koFixture({ matchNumber, id, home, away, kickoffUtc, localDate, stadium, city, group = "Sedicesimi" }) {
    return {
      id: id || `wc26-m${matchNumber}`,
      matchNumber,
      matchday: matchNumber,
      phase: "round32",
      group,
      home,
      away,
      homeName: KO_TEAMS[home] || home,
      awayName: KO_TEAMS[away] || away,
      homeFlag: flag(home),
      awayFlag: flag(away),
      kickoffUtc,
      localDate,
      stadium,
      city
    };
  }

  const PFA_KNOCKOUT_FIXTURES = [
    koFixture({ matchNumber: 73, home: "ZAF", away: "CAN", kickoffUtc: "2026-06-28T19:00:00Z", localDate: "2026-06-28", stadium: "Los Angeles Stadium", city: "Los Angeles" }),

    koFixture({ matchNumber: 76, home: "BRA", away: "JPN", kickoffUtc: "2026-06-29T17:00:00Z", localDate: "2026-06-29", stadium: "Houston Stadium", city: "Houston" }),
    koFixture({ matchNumber: 74, home: "GER", away: "PRY", kickoffUtc: "2026-06-29T20:30:00Z", localDate: "2026-06-29", stadium: "Boston Stadium", city: "Foxborough" }),
    koFixture({ matchNumber: 75, home: "NED", away: "MAR", kickoffUtc: "2026-06-30T01:00:00Z", localDate: "2026-06-30", stadium: "Monterrey Stadium", city: "Guadalupe" }),

    koFixture({ matchNumber: 78, home: "CIV", away: "NOR", kickoffUtc: "2026-06-30T17:00:00Z", localDate: "2026-06-30", stadium: "Dallas Stadium", city: "Arlington" }),
    koFixture({ matchNumber: 77, home: "FRA", away: "SWE", kickoffUtc: "2026-06-30T21:00:00Z", localDate: "2026-06-30", stadium: "New York/New Jersey Stadium", city: "East Rutherford" }),
    koFixture({ matchNumber: 79, home: "MEX", away: "ECU", kickoffUtc: "2026-07-01T01:00:00Z", localDate: "2026-07-01", stadium: "Mexico City Stadium", city: "Mexico City" }),

    koFixture({ matchNumber: 80, home: "ENG", away: "COD", kickoffUtc: "2026-07-01T16:00:00Z", localDate: "2026-07-01", stadium: "Atlanta Stadium", city: "Atlanta" }),
    koFixture({ matchNumber: 82, home: "BEL", away: "SEN", kickoffUtc: "2026-07-01T20:00:00Z", localDate: "2026-07-01", stadium: "Seattle Stadium", city: "Seattle" }),
    koFixture({ matchNumber: 81, home: "USA", away: "BIH", kickoffUtc: "2026-07-02T00:00:00Z", localDate: "2026-07-02", stadium: "San Francisco Bay Area Stadium", city: "Santa Clara" }),

    koFixture({ matchNumber: 84, home: "ESP", away: "AUT", kickoffUtc: "2026-07-02T19:00:00Z", localDate: "2026-07-02", stadium: "Los Angeles Stadium", city: "Los Angeles" }),
    koFixture({ matchNumber: 83, home: "POR", away: "CRO", kickoffUtc: "2026-07-02T23:00:00Z", localDate: "2026-07-03", stadium: "Toronto Stadium", city: "Toronto" }),
    koFixture({ matchNumber: 85, home: "SUI", away: "ALG", kickoffUtc: "2026-07-03T03:00:00Z", localDate: "2026-07-03", stadium: "BC Place Vancouver", city: "Vancouver" }),

    koFixture({ matchNumber: 88, home: "AUS", away: "EGY", kickoffUtc: "2026-07-03T18:00:00Z", localDate: "2026-07-03", stadium: "Dallas Stadium", city: "Arlington" }),
    koFixture({ matchNumber: 86, home: "ARG", away: "CPV", kickoffUtc: "2026-07-03T22:00:00Z", localDate: "2026-07-04", stadium: "Miami Stadium", city: "Miami" }),
    koFixture({ matchNumber: 87, home: "COL", away: "GHA", kickoffUtc: "2026-07-04T01:30:00Z", localDate: "2026-07-04", stadium: "Kansas City Stadium", city: "Kansas City" })
  ];

  const PFA_KNOCKOUT_PATH = {
    round32: PFA_KNOCKOUT_FIXTURES.map((fixture) => ({ ...fixture })),
    round16: [
      { matchNumber: 90, home: "W73", away: "W75", label: "Vincente M73 vs Vincente M75", kickoffUtc: "2026-07-04T17:00:00Z", date: "2026-07-04", stadium: "Houston Stadium" },
      { matchNumber: 89, home: "W74", away: "W77", label: "Vincente M74 vs Vincente M77", kickoffUtc: "2026-07-04T21:00:00Z", date: "2026-07-04", stadium: "Philadelphia Stadium" },
      { matchNumber: 91, home: "W76", away: "W78", label: "Vincente M76 vs Vincente M78", kickoffUtc: "2026-07-05T20:00:00Z", date: "2026-07-05", stadium: "New York/New Jersey Stadium" },
      { matchNumber: 92, home: "W79", away: "W80", label: "Vincente M79 vs Vincente M80", kickoffUtc: "2026-07-06T00:00:00Z", date: "2026-07-06", stadium: "Mexico City Stadium" },
      { matchNumber: 93, home: "W83", away: "W84", label: "Vincente M83 vs Vincente M84", kickoffUtc: "2026-07-06T19:00:00Z", date: "2026-07-06", stadium: "Dallas Stadium" },
      { matchNumber: 94, home: "W81", away: "W82", label: "Vincente M81 vs Vincente M82", kickoffUtc: "2026-07-07T00:00:00Z", date: "2026-07-07", stadium: "Seattle Stadium" },
      { matchNumber: 95, home: "W86", away: "W88", label: "Vincente M86 vs Vincente M88", kickoffUtc: "2026-07-07T16:00:00Z", date: "2026-07-07", stadium: "Atlanta Stadium" },
      { matchNumber: 96, home: "W85", away: "W87", label: "Vincente M85 vs Vincente M87", kickoffUtc: "2026-07-07T20:00:00Z", date: "2026-07-07", stadium: "Vancouver Stadium" }
    ],
    quarterFinals: [
      { matchNumber: 97, home: "W89", away: "W90", label: "Vincente M89 vs Vincente M90", kickoffUtc: "2026-07-09T20:00:00Z", date: "2026-07-09", stadium: "Boston Stadium" },
      { matchNumber: 98, home: "W93", away: "W94", label: "Vincente M93 vs Vincente M94", kickoffUtc: "2026-07-10T19:00:00Z", date: "2026-07-10", stadium: "Los Angeles Stadium" },
      { matchNumber: 99, home: "W91", away: "W92", label: "Vincente M91 vs Vincente M92", kickoffUtc: "2026-07-11T21:00:00Z", date: "2026-07-11", stadium: "Miami Stadium" },
      { matchNumber: 100, home: "W95", away: "W96", label: "Vincente M95 vs Vincente M96", kickoffUtc: "2026-07-12T01:00:00Z", date: "2026-07-12", stadium: "Kansas City Stadium" }
    ],
    semiFinals: [
      { matchNumber: 101, home: "W97", away: "W98", label: "Vincente M97 vs Vincente M98", kickoffUtc: "2026-07-14T19:00:00Z", date: "2026-07-14", stadium: "Dallas Stadium" },
      { matchNumber: 102, home: "W99", away: "W100", label: "Vincente M99 vs Vincente M100", kickoffUtc: "2026-07-15T19:00:00Z", date: "2026-07-15", stadium: "Atlanta Stadium" }
    ],
    finals: [
      { matchNumber: 103, home: "L101", away: "L102", label: "Perdente M101 vs Perdente M102", kickoffUtc: "2026-07-18T21:00:00Z", date: "2026-07-18", stadium: "Miami Stadium", title: "Finale 3° posto" },
      { matchNumber: 104, home: "W101", away: "W102", label: "Vincente M101 vs Vincente M102", kickoffUtc: "2026-07-19T19:00:00Z", date: "2026-07-19", stadium: "New York/New Jersey Stadium", title: "Finale" }
    ]
  };

  window.PFA_KNOCKOUT_FIXTURES = PFA_KNOCKOUT_FIXTURES;
  window.PFA_KNOCKOUT_PATH = PFA_KNOCKOUT_PATH;

  const base = Array.isArray(window.WORLD_CUP_FIXTURES) ? window.WORLD_CUP_FIXTURES : [];
  const byId = new Map(base.map((fixture) => [fixture.id, fixture]));
  PFA_KNOCKOUT_FIXTURES.forEach((fixture) => {
    if (!byId.has(fixture.id)) base.push(fixture);
  });
  window.WORLD_CUP_FIXTURES = base;
})();
