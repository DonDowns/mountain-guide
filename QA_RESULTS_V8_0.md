# Version 8.0 QA Results

## Structural
- app.js syntax: passed
- sw.js syntax: passed
- manifest JSON: passed
- duplicate HTML IDs: none
- missing JavaScript DOM targets: none
- footer version 8.0: passed
- new DOM targets present (riRouteSelect, riStartSelect, riStartWrap, riRouteDetail, riForecastState, riFieldSources, riResetOverrides): passed

## Dataset
- route profiles loaded: 31
- malformed route records: 0
- invalid risk vocabulary: 0
- remaining/planned peaks in ledger: 23
- uncovered remaining peaks: none
- routes with null distance/gain correctly flagged unverified: cnee3, cast4, nmar4, mwil5
- null stats missing the unverified flag: none
- reference-only routes flagged: litt6, litt3, nmar4

## Condition derivation
- Blanca + Ellingwood @ 8,800 ft: 15.25 mi / 6,000 ft, very-long, double, Class 3, limited water
- Blanca + Ellingwood @ Lake Como camp: 7 mi / 3,000 ft, long (commitment nudge applied), double, Class 3
- Blanca NW Ridge @ 8,000 ft: 17 mi / 6,500 ft, very-long, excessive distance
- Capitol NE Ridge: very-long, excessive, Class 4
- Unverified combo (Crestones Traverse): distance and water correctly left underived

## Forecast horizon gate (run 2026-08-03)
- Lake Como area, target 2026-08-22: out-of-range, opens about Aug 15
- Blanca Peak, target 2026-08-23: out-of-range, opens about Aug 16
- Ellingwood Point, target 2026-08-23: out-of-range, opens about Aug 16
- Mount Lindsey, target 2026-08-24: out-of-range, opens about Aug 17
- forecast-derived condition fields while out of range: none returned (correct)
- advisor states that locations are outside the forecast window rather than fabricating one: passed

## Safety language
- sufficiency or safety verdict language in advisor output: none detected
- Little Bear selected: first recommendation is the priority not-an-objective notice
- Mount Lindsey selected: access/waiver consideration present
- no green or all-clear state: passed
- turnaround prompts remain question-framed: passed

## Regression
- v7.9 Trip Conditions Advisor considerations: preserved
- v7.8 plan-based Gear Advisor recommendations: preserved and appear after route-derived items
- v7.6 tappable cards, v7.5.1 hardening, v7.4 ledger facts: preserved
- gear/fuel refresh flags, ascent escaping, partner corrections: preserved
- service-worker cache: ddmg-v8-0-2026-08-03-1

## Defects found and fixed during build
1. Temporal-dead-zone fault on load — weather renderer reached the Route Intelligence panel before dataset initialization. Fixed with a hoisted readiness flag.
2. Low-mileage-from-camp days mapped to "short / ordinary" despite Considerable commitment. Fixed with a commitment nudge.
