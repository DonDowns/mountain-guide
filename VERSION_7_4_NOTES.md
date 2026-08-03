# Version 7.4 — Single Source of Truth

Fixes a whole CLASS of bug rather than one instance: displayed statistics that
were hardcoded in index.html and could silently disagree with the actual data.

## The problem
The swapped first/second climb labels in 7.3 were a symptom. The same fact was
stored in two places — the ledger data in app.js and hand-written HTML — so the
two could drift apart. An audit found several more instances of the same class.

## What was hardcoded (and what it actually was)

| Location | Was hardcoded | Real value from data |
|---|---|---|
| Ledger stat row | 31 ranked completed | 31 (agreed) |
| Ledger stat row | 35 recorded ascents | 35 (agreed) |
| Ledger stat row | **5 recorded solo summits** | **7** — DISAGREED |
| Ledger stat row | 50+ personal goal | 50+ |
| Summit goal card | "38 / 50" | 38 / 50 (agreed) |
| Summit goal bar | width:76% | 76% (agreed) |
| Hero meta strip | 35 completed / 3 planned / 50+ goal | agreed |
| Milestone strip | 3 hand-written milestone lines | now derived from ascent records |

Only the solo count was actually wrong at the moment of the audit, but every
one of these could have gone wrong at any future edit. They can't now.

## The fix
New `ledgerFacts()` in app.js computes every statistic from COLORADO_SUMMITS:
completed, planned, projected, ranked, ascent count, solo count, total, goal,
first ascent by date, and all milestone records. `renderLedgerFacts()` writes
them into the DOM at load.

index.html now contains ZERO hardcoded summit statistics — verified by scan
(0 remaining hardcoded `<b>number</b>` elements, no "38 / 50", no "width:76%").
If the ledger changes, every screen changes with it. The dashboard, hero strip,
ledger stats, milestone strip, and summit pages cannot disagree.

The milestone strip is now generated from the same `ascent.milestone` records
the summit detail pages render, so a milestone can only be stated once.
"First sunrise summit" was preserved by moving it INTO the Mount Massive ascent
record rather than leaving it as orphaned HTML text.

## Solo count now reads 7, not 5
The app now shows what the data says: 7 ascents flagged `solo:true` — Lincoln,
Cameron, Bross, Sherman, La Plata, Missouri, and Holy Cross. The old hardcoded
"5" is gone. If the true number is 5, the fix is to change `solo:false` on the
Lincoln/Cameron/Bross records (recorded as "solo after summiting Democrat with
the group") and the display will follow automatically.

## Readiness percentage: a DIFFERENT issue, not fixed by this
The iPhone showing 4% while the Mac shows 0% is NOT a data-consistency bug.
Checkmarks live in localStorage, which is per-device and per-browser by design.
This app is a static site on GitHub Pages with no account and no server, so
there is nothing to sync through. Two devices genuinely have two sets of
checkmarks.

7.4 makes this honest instead of confusing:
- The card is labeled "Readiness · this device"
- Its caption reads "on this device only"
- A note explains that the iPhone and Mac will differ unless you export a
  backup from one and import it on the other (Export/Import already exist)

Real cross-device sync would require an account and a server — a Version 8
project, not a pre-trip change.

## Unchanged
Ledger content, gear locker + ddmg-v7-2-gearnames, 7.1.5 fuel/coffee/RTE logic,
weather and offline architecture, Summit Focus, turnaround check and countdown,
and every safety behavior: no green/all-clear states, all five countdown
prompts question-framed. Milestone strip output is escaped via escapeHtml.

## Verification
Syntax, manifest, DOM ids (all new ids resolve), duplicates, noopener, precache
(24 assets), CSS balance, safety greps all pass.
Cache: ddmg-v7-4-2026-08-02-1.
