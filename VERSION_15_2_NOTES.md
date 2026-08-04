# Don Downs Mountain Guide — Version 15.2

## Full-System Audit and Elevation Profile Integrity

Version 15.2 was built directly from the authoritative Version 15.1 package. It is a corrective and integrity release, not a redesign.

## Critical defects corrected

### Dependency-order startup failure

Version 15.1 still allowed `core.js` to begin application setup before `trips.js` had loaded. The early setup path called `tripBuilderAiContext()`, which was not yet defined. The resulting exception could stop `core.js` before `ROUTE_PROFILES` was created and cascade into blank or malfunctioning Route Intelligence and Mountain Intelligence features.

Version 15.2 introduces `coreInitialSetup()` and makes `js/bootstrap.js` the sole dependency-aware startup coordinator. Only `bootstrap.js` binds `DOMContentLoaded`.

### Additional runtime corrections

- Replaced the undefined `weatherData` reference with the authoritative `weatherStore`.
- Rewired the Route Intelligence disclosure toggle from the nonexistent `renderRouteIntelligence()` call to `riRenderPanel()`.
- Restored `totalNamed` and `remaining` fields in `ledgerFacts()` so summary text cannot render `undefined`.
- Marked Little Bear's West Ridge and Hourglass route as its standard individual route while preserving the traverse as a non-objective reference route.

## Search and mountain-name integrity

- Centralized mountain aliases in one `MOUNTAIN_SEARCH_ALIASES` source.
- Added the same alias behavior to Mountain Intelligence and the Summit Ledger.
- `Evans`, `Mount Evans`, and `Mt Evans` now rank Mount Blue Sky first without changing the authoritative current mountain name.
- Search continues across mountain notes, route labels, difficulty, ascent notes, conditions, partners, memories, and outing names.

## Elevation-profile integrity

All applicable visual elevation profiles now distinguish absolute elevation from segment change.

- Lake Como approach: parking elevation range, ascent range, and camp elevation.
- Blanca–Ellingwood: camp, Blanca summit, Ellingwood summit, and return-to-camp elevations with each net segment difference.
- Mount Lindsey: published total gain and summit elevation, with unavailable trailhead/return segment values explicitly labeled rather than estimated.

All 58 summit ledger entries now have an elevation. Missing values were filled only from elevation data already stored elsewhere in the app. Ledger counts and completion status were not changed.

## Interface and accessibility corrections

- Added explicit `type` attributes to all static buttons.
- Added accessible labels to previously unlabeled journal and command text areas.
- Styled dynamically rendered Mountain Intelligence action buttons consistently with the application.
- Removed obsolete feature-version wording from live section titles.
- Updated PWA title and description metadata to current branding.
- Replaced obsolete Version 6 deployment instructions with Version 15.2 documentation.

## Locked items preserved

- Eight ordered deferred JavaScript modules
- One authoritative `COLORADO_SUMMITS` ledger
- `PEAKS` derived from that ledger
- 58 total / 35 completed / 3 planned / 20 remaining
- Hardened `ddmg-` export/import and migration behavior
- No `Storage.prototype` monkey-patching
- `escapeHtml` discipline
- No inline `onclick`
- No green or all-clear state
- Five question-framed turnaround prompts
- Protected Lake Como system trip
- NWS automated weather source
- Weather cross-check links and agreement scoring
- Offline/PWA service-worker behavior

## GitHub commit message

`Deploy Mountain Guide v15.2 Full-System Audit and Elevation Profile Integrity`
