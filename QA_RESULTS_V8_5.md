# Version 8.5 QA Results

## Structural
- app.js, sw.js syntax: passed
- duplicate HTML IDs: none · missing DOM targets: none · inline handlers: 0
- footer version 8.5: passed
- service-worker cache: ddmg-v8-5-2026-08-03-1
- APP_VERSION remains the only version string: passed

## Dataset
- future points: 34 (20 summit, 14 access)
- every access point flagged approximate except Maroon Lake (a signed, surveyed trailhead)
- coordinate bounds check (inside Colorado, 8,000–14,500 ft): all pass
- all 20 remaining-status peaks have a summit point: passed (planned trio already covered by trip locations)
- summit elevations vs ledger: zero drift beyond 30 ft
- Capitol summit spot-checked against published USGS value during build: matched

## Engine integration
- locationById resolves future ids: passed (f-capitol → Capitol Peak (summit))
- unknown ids still fall back to the trip default: passed
- trip locations unchanged (blanca still carries 2026-08-23): passed
- TRIP_WEATHER_IDS untouched — bulk refresh remains 4 locations: passed
- selector: 3 optgroups appended, 34 options, built once (idempotent flag): passed

## Honest no-date handling
- riForecastWindow on a future point: state "none", label "No target date" — no invented window
- buildTripSummary with no targetDate: returns available:false, no throw
- hero Trip-window mode on a future point: renders "No trip date set for this point," no crash
- hero Now mode on the same point: renders current conditions normally

## Regression (v8.0–v8.4)
- collapsible groups: planned 3 / completed 35 / remaining 20: passed
- 31 route profiles; Blanca fallback resolves: passed
- dead code stays dead (exportData, importBackupFile, resetChecks, setSummitStatusFilter): passed
- scroll fixes retained: passed
- turnaround prompts question-framed: passed

## Not verified here
Live NWS responses for the new points, and rendering on the device. After deploy: select two or three future points while online (a summit and an approx trailhead), confirm the grid elevation shown on the card is near the point's listed elevation — that is the built-in check on the approximate coordinates.
