# Version 6.1.1 — Metric card spacing patch

A three-line correction to Version 6.1. No features added, removed, or restructured.

## Changes

1. **Metric card spacing (the reported defect).**
   `styles.css` — `.metric strong` and `.metric small` now use `display:block`.
   Previously these were inline with no whitespace between the tags in the
   markup, so the value and its caption ran together: "0%of saved gear and
   communication checks". Six cards were affected: Departure, Summit goal,
   Readiness, Live weather, 14ers.com reviews, and Review workflow.
   This matches the `display:block` pattern already used throughout the app
   (`.wx-stat b`, `.weather-mini b`, `.link small`, `.peak small`).

2. **Summit goal progress bar.**
   `index.html` line 58 — bar changed from `width:76%` to `width:92%` so it
   agrees with the card's own "35 → 38" (35 of 38 = 92%).

3. **Service-worker cache name.**
   `sw.js` — `ddmg-v6-1-2026-08-02-1` → `ddmg-v6-1-1-2026-08-02-1`.
   Required: without the bump, devices already running 6.1 would keep serving
   the cached stylesheet and never receive the spacing fix.

4. Footer version string updated to 6.1.1 (so the deployed version is
   identifiable at a glance).

## Not changed

Weather architecture, NWS parsing, offline behavior, service-worker fetch
strategy, Summit Focus, sunlight calculations, Night Vision, privacy rules,
authoritative external links, and all Version 5.1 hardening are untouched.

## Verification performed on this package

- `node --check app.js` — pass
- `node --check sw.js` — pass
- `manifest.webmanifest` JSON parse — pass
- Every precached asset in `CORE` exists on disk — pass (11/11)
- Every `getElementById()` target exists in the HTML — pass
- No duplicate HTML IDs — pass
- Every `target="_blank"` link carries `rel="noopener"` — pass
- Diff against 6.1 confirms exactly four line changes across three files

## Still requires on-device verification after deployment

- Installed iPhone PWA update from 6.1
- Offline relaunch after one successful online load
- Live NWS success, timeout, and partial-failure states
- VoiceOver
