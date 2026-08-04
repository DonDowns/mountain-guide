# Version 8.5 — Future Weather Points

## Added

**34 stored weather points covering every remaining 14er** — 20 summit points and 14 access points — wired into the existing NWS engine. The forecast selector now carries three new groups (Future · Elk Mountains, Future · San Juan Mountains, Future · Sangre de Cristo) below the trip locations. Select any point, refresh, and the same current-conditions view, planning flags, hourly strip, and offline caching that serve Lake Como now serve Capitol, the Crestones, Chicago Basin, and the rest.

Little Bear's access point is the existing Lake Como location, so it is not duplicated.

## Data discipline

- **Summit coordinates are published USGS values** — public-domain facts, not 14ers.com content. Summit elevations were cross-checked against the ledger during QA: zero drift beyond 30 ft.
- **Access points are approximate parking/basin locations**, each labeled "(approx)" in the selector. The NWS forecast grid is roughly 2.5 km, so parking-area precision is sufficient; the card's displayed grid elevation is the on-screen sanity check, exactly as the Lake Como deploy checklist already uses it.
- **No targetDate on future points, deliberately.** A future point in "Trip window" mode says plainly: *"No trip date set for this point"* and directs you to Now + 6 hours. It does not guess a date, and the forecast-horizon gate correctly reports "No target date" rather than inventing a window. When a climb is actually planned, the point graduates into `WEATHER_LOCATIONS` with a real date, and the full gate applies.
- **Conditions are still never cached.** During build research, 14ers.com showed an active July 2026 fire closure on Uncompahgre and Wetterhorn — precisely the kind of information that must be read live, and precisely why this release stores coordinates and nothing conditional.
- Dataset stamp: `FUTURE_WEATHER_STAMP` (2026-08-03), same refresh discipline as Route Intelligence.

## Deliberately unchanged

- `TRIP_WEATHER_IDS` still holds only the four Lake Como locations. Bulk "Refresh Trip Intelligence" does not fetch 34 extra points; future points refresh individually when selected.
- The service worker precache is unchanged; future-point forecasts cache in localStorage on fetch like every other point.

## Preserved

8.4 deep clean · 8.3 ledger cleanup and route reunification · 8.2 scroll fixes · 8.1 collapsible groups · 8.0 Route Intelligence · advisors, hardened transfer, ledger facts, partner corrections, no green/all-clear state, question-framed turnaround prompts.

## Service worker

`ddmg-v8-5-2026-08-03-1`

## GitHub commit message

`Deploy Mountain Guide v8.5 future weather points`
