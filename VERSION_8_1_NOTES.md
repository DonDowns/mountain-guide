# Version 8.1 — Collapsible Summit Groups and Vertical Scroll Lock

## Added

- **Collapsible status groups in the summit ledger.** Planned, Completed, and Remaining each get a tappable header showing its count. Tap to expand, tap again to collapse. Open/closed state persists on the device.
- **Expand all / Collapse all** controls above the ledger.
- **Search overrides collapse.** Typing in the search box forces every matching group open, so a match can never hide inside a collapsed section.
- Group headers are 56 px tall with a colored left edge matching the existing card status colors (blue completed, gold planned, gray remaining).

Default state on a fresh device: **Planned open, Completed and Remaining collapsed**, so the ledger fits one phone screen. Change it by tapping; the choice sticks.

## Fixed — horizontal drift while scrolling on iPhone

Three separate causes, all addressed:

1. **`background-attachment: fixed` on `body`.** iOS Safari does not composite this properly and repaints the gradient on every scroll frame, which visibly shifts content. Replaced with a `body::before` fixed layer, the standard iOS-safe pattern.
2. **No horizontal overflow clamp.** Nothing constrained document width, so any single over-wide child made the whole page horizontally scrollable. During momentum scroll that reads as blocks sliding left and right. Now clamped with `max-width:100%; overflow-x:hidden; overscroll-behavior-x:none` on **both** `html` and `body` — body alone is unreliable in Safari.
3. **Rubber-band chaining from the horizontal strips.** The nav rail, hour strip, weather summary, and weather stats all scroll horizontally. Their overscroll chained to the page. Now `overscroll-behavior-x: contain`.

Also added `touch-action: pan-y` to the ledger containers so those blocks can only ever pan vertically.

## Fixed — carried over from the v8.0 audit

- Backup payload declared `version: '7.7'`. Now stamps the correct version.
- The legacy gear-backup export enumerated a fixed key list and silently dropped route selection, parking start point, condition overrides, and group state on cross-device restore. Those four are now included.

## Preserved

Version 8.0 Route Intelligence in full — 31 route profiles, parking-elevation switch, per-location forecast horizon gate, per-field condition sources and overrides, reference-only flags. Plus 7.9 advisors, 7.7 incomplete-only checks, 7.6 tappable cards, 7.5.1 hardened transfer, 7.4 ledger facts, partner corrections, no green/all-clear state, and all five question-framed turnaround prompts.

## Service worker

`ddmg-v8-1-2026-08-03-1`

## GitHub commit message

`Deploy Mountain Guide v8.1 collapsible summit groups and scroll fix`
