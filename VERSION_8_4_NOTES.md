# Version 8.4 — Deep-Clean: Dead Code, Duplicate Data, Brittle Patterns

A full audit of app.js (2,323 lines), styles.css, index.html, and sw.js. Findings below, each fixed in this release. GUI recommendations that require product decisions are listed separately at the end and are NOT implemented.

## Fixed — the v8.3 backup consolidation was incomplete (my own escaped bug)

Version 8.3 removed the legacy export/import *buttons by id*, but two more "Export backup" buttons in the intelligence toolbar and journal toolbar called the legacy `exportData()` through inline onclick handlers. The old incompatible format was still one tap away. Both buttons now trigger the unified `ddmg-` export, and the legacy `exportData` and `importBackupFile` functions are deleted. Exactly one export function and one import function remain, and the import still reads legacy files.

## Fixed — a second, stale, hand-maintained peak dataset

`PEAKS` was a 50-entry array driving the quick peak list, separate from the 58-entry `COLORADO_SUMMITS` ledger. It was missing eight peaks — including Capitol, Snowmass, Pyramid, the Maroons, the Crestones, and Little Bear — so searching the quick list for any of them returned nothing. This violated the v7.4 single-source principle. `PEAKS` is now derived from `COLORADO_SUMMITS` at load, so it can never disagree again, and planned peaks get their own gold styling in that list.

## Fixed — all twelve inline onclick handlers converted to listener bindings

Inline handlers require their functions to stay global forever, are invisible to the missing-DOM-target audit, and are blocked outright by any Content-Security-Policy without `unsafe-inline`. They were also how the incomplete backup consolidation above escaped three prior audits. All twelve (applyUpdate, clearJournal, clearReviews, refreshTripIntelligence, resetIntelWorkflow, five markReviewed buttons, and the two export buttons, plus one raw inline scroll script) are now bound in one `setupConvertedHandlers()` function.

## Fixed — copy-paste double render

`renderTripConditionsAdvisor()` was called twice back-to-back in two places (pack-profile change and check reset), doing every advisor computation and DOM write twice per interaction. Both deduplicated.

## Removed — dead code

- `resetChecks()` — defined, never referenced anywhere.
- `setSummitStatusFilter()` and every remaining `summitStatusFilter` read — the element was removed in v8.3; the reads always returned 'all' and the writes were no-ops. The filter logic no longer carries a status term at all.

## Audited and intentionally left alone

- **Empty `catch{}` blocks (5)** — all wrap localStorage access where private-mode Safari throws; silent fallback is the correct behavior there.
- **Two 30-second intervals** (dashboard countdown, focus turnaround countdown) — the second is cleared when Focus closes; the first runs for the page's life by design.
- **CSS selectors defined 3–4 times** — these are cascade layers (base → tablet → phone → campfire mode), not duplicates.
- **6.5 MB of story photographs precached by the service worker** — deliberate: the app must work in airplane mode at Lake Como. Noted as a first-install cost only.
- **XSS surface** — every user-data interpolation into innerHTML passes through `escapeHtml`. Zero unescaped paths found.
- **Orphan-looking HTML ids** (wx-*, review-*-status, metric cards) — all reached through template-string id construction or `data-dashboard-target`; not orphans.

## GUI recommendations — NOT implemented, for your decision

1. **Trip Conditions Advisor: collapse the five auto-derived dropdowns** behind an "Adjust conditions" disclosure (held from v8.3; still the highest-value GUI change remaining).
2. **The quick peak list and the summit ledger now show the same data two ways.** With `PEAKS` derived from the ledger, the quick list is a strict subset of what the ledger's search does. Consider retiring the quick list section entirely in v8.5 — one less place to look, zero information lost.
3. **Dashboard "Review workflow" and "14ers.com reviews" cards both jump to the same intelligence section.** Two tiles, one destination. Merging them frees a dashboard slot.
4. **The journal has no export of its own** — it rides inside the device backup. A one-tap "share journal as text" would fit how it's actually used after a trip.

## Preserved

8.3 ledger cleanup and route reunification · 8.2 scroll fixes · 8.1 collapsible groups · 8.0 Route Intelligence (31 profiles) · 7.9 advisors · 7.6 tappable cards · 7.5.1 hardened transfer · 7.4 ledger facts · partner corrections · no green/all-clear state · question-framed turnaround prompts.

## Service worker

`ddmg-v8-4-2026-08-03-1`

## GitHub commit message

`Deploy Mountain Guide v8.4 deep clean dead code and duplicate data`
