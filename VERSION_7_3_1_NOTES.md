# Version 7.3.1 — First-Climb Correction

Small correction release on the audited 7.3 base. No feature changes.

## Corrected: first and second climb were swapped

Don confirmed the authoritative record:
- **Longs Peak — September 4, 2011 — Don's first 14er**
- **Pikes Peak — October 2, 2019** (not the first; it was the first 14er
  climbed with Caleb)

The 7.3 ledger had the correct DATES but the milestone LABELS were reversed,
which produced a visible contradiction: Pikes Peak was tagged "first 14er"
while carrying a 2019 date, eight years after Longs.

Three places were corrected:
1. `app.js` — Longs Peak ascent milestone is now "Don's first 14er —
   September 4, 2011." (was "User-corrected second 14er.")
2. `app.js` — Pikes Peak ascent milestone is now "First 14er climbed with
   Caleb — October 2, 2019." (was "User-corrected first 14er.") This preserves
   what actually made the day significant; its memory text already read
   "Caleb and Don's first 14er together."
3. `index.html` — the ledger milestone strip now reads
   "First climb: Longs Peak · Sept. 4, 2011" and
   "First 14er with Caleb: Pikes Peak · Oct. 2, 2019"
   (was "First climb: Pikes Peak / Second climb: Longs Peak").

The "User-corrected" phrasing was also dropped from both labels — it described
an editing event rather than the climb, and read oddly on a summit page.

Verified after the change: the earliest ascent by date and the milestone-labeled
first 14er are now the same climb (Longs Peak, 2011-09-04).

## Also fixed: escaping in the ascent renderer

The 7.3 summit-detail renderer interpolated `partners`, `milestone`,
`outingName`, `outingClass`, `memory`, `conditions`, `gear`, and `note` into
innerHTML **without** `escapeHtml()`, breaking the escaping discipline held
since 5.1. Safe with today's static data, but this is exactly the render path a
future user-editable climb journal would feed. All eight interpolations are now
escaped.

## Unchanged
Ledger totals (58 entries; 35 completed, 20 remaining, 3 planned), all climb
history content, gear locker and the ddmg-v7-2-gearnames refresh, 7.1.5
fuel/coffee/RTE logic, Fort Garland lodging, weather and offline architecture,
Summit Focus, and every safety behavior: no green/all-clear states, all five
countdown prompts question-framed.

## Verification
Syntax, manifest, DOM ids, duplicates, noopener, precache (24 assets), CSS
balance, and safety greps all pass. Chronology consistency check passes.
Cache: ddmg-v7-3-1-2026-08-02-1.

## Open item (unchanged from 7.3)
The ledger records 7 solo ascents (Lincoln, Cameron, Bross, Sherman, La Plata,
Missouri, Holy Cross) while 7.1.1 stated a solo total of five. The
Lincoln/Cameron/Bross trio is recorded as "solo after summiting Democrat with
the group," which is likely the discrepancy. Don's call on how to count it.
