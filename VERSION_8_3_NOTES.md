# Version 8.3 — Ledger Cleanup and Route Data Reunification

## Removed — the Source discipline note

Cut for three reasons, in order of seriousness:

1. **It contradicted the data.** The note claimed Pikes Peak as the first climb and Longs Peak as the second. The ledger records Longs Peak on September 4, 2011 with an explicit milestone reading "Don's first 14er," and Pikes Peak in 2019 with the milestone "First 14er climbed with Caleb." The dashboard computes first ascent by sorting on date, so it displayed Longs directly above a caption asserting Pikes.
2. **It was release-notes text in the running UI.** "Version 7.3 uses Don's transcript..." belongs in version notes.
3. **Its one load-bearing clause was already elsewhere, better placed.** The warning that route statistics are reference values rather than GPS reconstructions already renders inside every summit detail card, next to the numbers it qualifies.

## Fixed — unclimbed peaks showed no route information

`openSummitDetail` gated its route section on `peak.route`, a field only completed peaks carry. Tapping Blanca Peak, Capitol, or any of the other 23 remaining objectives produced an empty panel, even though Version 8.0 holds a verified profile for every one of them.

The detail sheet now falls back to the Route Intelligence dataset: route name, class, round-trip distance, elevation gain, all four risk factors, access conditions, and the 14ers.com link. Reference-only routes still carry their not-an-objective flag, and unverified combos still declare their missing statistics.

## Removed — the Status dropdown

Now duplicated by the collapsible group headers, and actively confusing: filtering to Completed made the Planned and Remaining headers vanish, which read as broken rather than filtered. Search and Range remain.

Three shortcuts that drove the dropdown have been rewired to the group model instead of being left inert:

- **Show planned summits** now opens the Planned group and collapses the other two.
- **Range cards** now expand all groups so the selected range is actually visible.
- **Reset** clears search and range and announces the reset.

## Fixed — screen reader announced the whole ledger on every tap

`#summitGrid` carried `aria-live="polite"`, and collapsing a group re-renders the container. Every toggle re-announced all 58 summits. The live region moved to a compact status line that says what changed: "Completed expanded, 35 summits."

## Consolidated — one backup export, one import

Two export buttons wrote two incompatible formats under near-identical names, and neither file imported through the other's button. The legacy pair is retired. The remaining import now detects and remaps the legacy v6.6 schema, so existing backup files still restore, including route selection, parking start point, condition overrides, and group state.

## Fixed — internal version stamp drift

`stampLocalDataChange()` still wrote `version: '7.7'` while the export payload said 8.2. Both now read a single `APP_VERSION` constant, so the two can no longer diverge. No hardcoded version strings remain in the JavaScript.

## Preserved

Version 8.2 merged scroll fixes and collapsible groups · 8.0 Route Intelligence, 31 profiles · 7.9 advisors · 7.7 incomplete-only checks · 7.6 tappable cards · 7.5.1 hardened transfer · 7.4 ledger facts · partner corrections · no green/all-clear state · all five question-framed turnaround prompts.

## Held for a later release

The Trip Conditions Advisor still shows nine dropdowns, five of which auto-populate from the selected route. Collapsing the derived ones behind an "Adjust conditions" disclosure remains open.

## Service worker

`ddmg-v8-3-2026-08-03-1`

## GitHub commit message

`Deploy Mountain Guide v8.3 ledger cleanup and route data reunification`
