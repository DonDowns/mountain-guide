# Version 8.2 — Merged Summit Ledger Controls and Scroll Fix

This release merges two independent v8.1 attempts. Where they disagreed, the better mechanism was kept and the reasoning is recorded below.

## Summit ledger groups — kept the collapsible-section model

Three independent groups (Planned, Completed, Remaining), each with a tappable header, a live count, and persistent open/closed state. Expand all / Collapse all above them. Searching force-opens every matching group.

The alternative approach used two buttons acting as exclusive filters. It was rejected because it could only ever show one group at a time, it cleared the search box and range filter on every tap, and it did not survive a reload. The request was for groups that open and collapse independently, which the section model does and the filter model does not.

**Adopted from the alternative:** headers now say "Open" or "Collapse" in words rather than relying on a chevron alone, and a short note above the ledger explains the interaction.

## Horizontal drift on iPhone — kept both diagnoses, plus a correction

Four causes, all now addressed:

1. **`background-attachment: fixed` on `body`.** iOS Safari repaints the gradient every scroll frame and shifts content on top of it. Replaced with a `body::before` fixed layer. The alternative build did not touch this; it is the largest single contributor.
2. **No horizontal overflow clamp.** Now clamped on `html` and `body`.
3. **Rubber-band chaining from the horizontal strips.** The nav rail, hour strip, weather summary, and weather stats scroll sideways and chained their overscroll to the page. Now `overscroll-behavior-x: contain`. The alternative build did not address this.
4. **Over-wide children in the ledger subtree.** `box-sizing: border-box`, `max-width:100%`, `min-width:0`, and `overflow-wrap: anywhere` now constrain the content rather than only hiding the symptom. Adopted from the alternative.

### Correction to v8.1

Version 8.1 used `overflow-x: hidden` on `html` and `body`. That makes `body` a scroll container, which can break `position: sticky` — and this app has a sticky nav bar and a sticky install nudge. The alternative build used `overflow-x: clip`, which clamps without creating a scroll container. **That is the correct choice and it has been adopted**, with an `@supports` fallback scoped to `html` only so `body` never becomes a scroll container on older engines.

### Rejected from the alternative

- **Forcing the summit grid to one column on every touch device.** The media query used `(hover:none)`, which catches iPad as well as iPhone. A 58-item single column on a tablet is a regression. The responsive 4/3/2/1 grid is retained; single column applies below 430 px.
- **`transform: none !important` on cards and dashboard shortcuts.** This was aimed at hover motion, which does not fire on touch anyway, and it disables the Version 7.6 tap-feedback affordance.
- **Scoping the overflow clamp inside a mobile media query.** The clamp is now unconditional, so the same guarantee holds on desktop.

## Preserved

Version 8.1 collapsible groups and audit fixes · 8.0 Route Intelligence (31 route profiles, parking-elevation switch, forecast horizon gate, per-field condition sources) · 7.9 advisors · 7.7 incomplete-only checks · 7.6 tappable cards · 7.5.1 hardened transfer · 7.4 ledger facts · partner corrections · no green/all-clear state · all five question-framed turnaround prompts.

## Service worker

`ddmg-v8-2-2026-08-03-1`

## GitHub commit message

`Deploy Mountain Guide v8.2 merged summit ledger controls and scroll fix`
